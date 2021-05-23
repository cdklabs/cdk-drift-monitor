import { join } from 'path';
import { Alarm, ComparisonOperator, Metric, Statistic, TreatMissingData, Unit } from '@aws-cdk/aws-cloudwatch';
import { CreateAlarmOptions } from '@aws-cdk/aws-cloudwatch/lib/metric';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import { Effect, Policy, PolicyStatement } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { Construct, Duration, Stack } from '@aws-cdk/core';


export interface DriftMonitorProps {

  /**
   * List of stack to monitor for CloudFormation drifts
   * Either stacks or stackNames are required (though not both)
   */
  readonly stacks?: Stack[];

  /**
   * List of stack names to monitor for CloudFormation drifts.
   * Either stacks or stackNames are required (though not both)
   */
  readonly stackNames?: string[];

  /**
   * Run drift detection every X duration.
   *
   * @default Duration.hours(1)
   */
  readonly runEvery?: Duration;

  /**
   * Namespace of published metric
   *
   * @default 'DriftMonitor'
   */
  readonly metricNamespace?: string;

  /**
   * Options to create alarm
   *
   * @default alarm on 1 drifted stacks or more, for 3 data points, for
   */
  readonly alarmOptions?: CreateAlarmOptions;

}

export class DriftMonitor extends Construct {

  public readonly alarm: Alarm;

  constructor(scope: Construct, id: string, props: DriftMonitorProps) {
    super(scope, id);

    if ((props.stacks !== undefined && props.stacks.length > 0) && (props.stackNames !== undefined && props.stackNames.length > 0)) {
      throw new Error('Must have either stacks or stackNames, not both');
    }
    if ((props.stacks === undefined || (props.stacks.length === 0)) &&
        (props.stackNames === undefined || (props.stackNames.length === 0))) {
      throw new Error('Must provide at least one stack');
    }
    if (props.runEvery !== undefined && props.runEvery.toSeconds() < 60) {
      throw new Error('runEvery must be higher than 1 minute');
    }

    const stacks = props.stacks ? props.stacks.map(stack => stack.stackName) : props.stackNames!;
    const metricNamespace = props.metricNamespace ?? 'DriftMonitor';
    const detectDriftLambda = new lambda.Function(this, 'DetectDriftLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'detect-drift.handler',
      code: lambda.Code.fromAsset(join(__dirname, '/handler')),
      environment: {
        stackNames: stacks.join(','),
        metricNamespace: metricNamespace,
      },
      timeout: Duration.minutes(1),
    });

    const runEvery = props.runEvery ?? Duration.hours(1);
    new events.Rule(this, 'DetectDriftRule', {
      targets: [new eventsTargets.LambdaFunction(detectDriftLambda)],
      schedule: events.Schedule.rate(runEvery),
      enabled: true,
    });

    const alarmOptions = props.alarmOptions ?? {
      alarmName: 'DriftDetected',
      threshold: 0,
      evaluationPeriods: 1,
      treatMissingData: TreatMissingData.IGNORE,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
    };

    this.alarm = new Alarm(this, 'DriftAlarm', {
      metric: new Metric({
        metricName: 'DriftedStacks',
        namespace: metricNamespace,
        period: this.getClosestCloudWatchMetricPeriod(runEvery),
        statistic: Statistic.AVERAGE,
        unit: Unit.COUNT,
      }),
      ...alarmOptions,
    });

    detectDriftLambda.role!.attachInlinePolicy(new Policy(this, 'DetectDriftLambdaPolicy', {
      policyName: 'DetectDriftLambdaPolicy',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'cloudformation:ListStackResources',
            'cloudformation:DescribeStackDriftDetectionStatus',
            'cloudformation:DetectStackDrift',
            'cloudformation:DetectStackResourceDrift',
            'cloudwatch:PutMetricData',
          ],
          resources: ['*'],
        }),
        // CloudFormation's drift detection requires the caller to have Describe/List permissions on the stack resources.
        // As the construct has no knowledge on which resources the inspected stacks contain, Describe permissions were given to all services.
        // The closest AWS managed policy is 'ReadOnlyAccess', which contains excessive permissions.
        // The list below was taken from 'ReadOnlyAccess', though retaining only Describe/List actions.
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'a4b:List*',
            'access-analyzer:ListAccessPreviewFindings',
            'access-analyzer:ListAccessPreviews',
            'access-analyzer:ListAnalyzedResources',
            'access-analyzer:ListAnalyzers',
            'access-analyzer:ListArchiveRules',
            'access-analyzer:ListFindings',
            'access-analyzer:ListTagsForResource',
            'acm-pca:Describe*',
            'acm-pca:List*',
            'acm:Describe*',
            'acm:List*',
            'amplify:ListApps',
            'amplify:ListBranches',
            'amplify:ListDomainAssociations',
            'amplify:ListJobs',
            'application-autoscaling:Describe*',
            'applicationinsights:Describe*',
            'applicationinsights:List*',
            'appmesh:Describe*',
            'appmesh:List*',
            'appstream:Describe*',
            'appstream:List*',
            'appsync:List*',
            'athena:List*',
            'autoscaling-plans:Describe*',
            'autoscaling:Describe*',
            'backup:Describe*',
            'backup:List*',
            'batch:Describe*',
            'batch:List*',
            'budgets:Describe*',
            'chatbot:Describe*',
            'chime:List*',
            'cloud9:Describe*',
            'cloud9:List*',
            'clouddirectory:List*',
            'cloudformation:Describe*',
            'cloudformation:List*',
            'cloudfront:List*',
            'cloudhsm:Describe*',
            'cloudhsm:List*',
            'cloudsearch:Describe*',
            'cloudsearch:List*',
            'cloudtrail:Describe*',
            'cloudtrail:List*',
            'cloudwatch:Describe*',
            'cloudwatch:List*',
            'codeartifact:DescribeDomain',
            'codeartifact:DescribePackageVersion',
            'codeartifact:DescribeRepository',
            'codeartifact:ListDomains',
            'codeartifact:ListPackages',
            'codeartifact:ListPackageVersionAssets',
            'codeartifact:ListPackageVersionDependencies',
            'codeartifact:ListPackageVersions',
            'codeartifact:ListRepositories',
            'codeartifact:ListRepositoriesInDomain',
            'codeartifact:ListTagsForResource',
            'codebuild:DescribeCodeCoverages',
            'codebuild:DescribeTestCases',
            'codebuild:List*',
            'codecommit:Describe*',
            'codecommit:List*',
            'codedeploy:List*',
            'codeguru-profiler:Describe*',
            'codeguru-profiler:List*',
            'codeguru-reviewer:Describe*',
            'codeguru-reviewer:List*',
            'codepipeline:List*',
            'codestar-notifications:describeNotificationRule',
            'codestar-notifications:listEventTypes',
            'codestar-notifications:listNotificationRules',
            'codestar-notifications:listTagsForResource',
            'codestar-notifications:ListTargets',
            'codestar:Describe*',
            'codestar:List*',
            'cognito-identity:Describe*',
            'cognito-identity:List*',
            'cognito-idp:AdminList*',
            'cognito-idp:Describe*',
            'cognito-idp:List*',
            'cognito-sync:Describe*',
            'cognito-sync:List*',
            'compute-optimizer:DescribeRecommendationExportJobs',
            'config:Describe*',
            'config:List*',
            'connect:Describe*',
            'connect:List*',
            'dataexchange:List*',
            'datapipeline:Describe*',
            'datapipeline:List*',
            'datasync:Describe*',
            'datasync:List*',
            'dax:Describe*',
            'dax:ListTags',
            'deepcomposer:ListCompositions',
            'deepcomposer:ListModels',
            'deepcomposer:ListSampleModels',
            'deepcomposer:ListTrainingTopics',
            'detective:List*',
            'devicefarm:List*',
            'devops-guru:DescribeAccountHealth',
            'devops-guru:DescribeAccountOverview',
            'devops-guru:DescribeAnomaly',
            'devops-guru:DescribeInsight',
            'devops-guru:DescribeResourceCollectionHealth',
            'devops-guru:DescribeServiceIntegration',
            'devops-guru:ListAnomaliesForInsight',
            'devops-guru:ListEvents',
            'devops-guru:ListInsights',
            'devops-guru:ListNotificationChannels',
            'devops-guru:ListRecommendations',
            'directconnect:Describe*',
            'discovery:Describe*',
            'discovery:List*',
            'dms:Describe*',
            'dms:List*',
            'ds:Describe*',
            'ds:List*',
            'dynamodb:Describe*',
            'dynamodb:List*',
            'ec2:Describe*',
            'ecr:Describe*',
            'ecr:List*',
            'ecs:Describe*',
            'ecs:List*',
            'eks:Describe*',
            'eks:List*',
            'elasticache:Describe*',
            'elasticache:List*',
            'elasticbeanstalk:Describe*',
            'elasticbeanstalk:List*',
            'elasticfilesystem:Describe*',
            'elasticloadbalancing:Describe*',
            'elasticmapreduce:Describe*',
            'elasticmapreduce:List*',
            'elastictranscoder:List*',
            'elemental-appliances-software:List*',
            'es:Describe*',
            'es:List*',
            'events:Describe*',
            'events:List*',
            'firehose:Describe*',
            'firehose:List*',
            'fis:ListActions',
            'fis:ListExperiments',
            'fis:ListExperimentTemplates',
            'fis:ListTagsForResource',
            'fms:ListAppsLists',
            'fms:ListComplianceStatus',
            'fms:ListMemberAccounts',
            'fms:ListPolicies',
            'fms:ListProtocolsLists',
            'fms:ListTagsForResource',
            'forecast:DescribeDataset',
            'forecast:DescribeDatasetGroup',
            'forecast:DescribeDatasetImportJob',
            'forecast:DescribeForecast',
            'forecast:DescribeForecastExportJob',
            'forecast:DescribePredictor',
            'forecast:DescribePredictorBacktestExportJob',
            'forecast:ListDatasetGroups',
            'forecast:ListDatasetImportJobs',
            'forecast:ListDatasets',
            'forecast:ListForecastExportJobs',
            'forecast:ListForecasts',
            'forecast:ListPredictorBacktestExportJobs',
            'forecast:ListPredictors',
            'freertos:Describe*',
            'freertos:List*',
            'fsx:Describe*',
            'fsx:List*',
            'gamelift:Describe*',
            'gamelift:List*',
            'glacier:Describe*',
            'glacier:List*',
            'globalaccelerator:Describe*',
            'globalaccelerator:List*',
            'glue:ListCrawlers',
            'glue:ListDevEndpoints',
            'glue:ListJobs',
            'glue:ListMLTransforms',
            'glue:ListRegistries',
            'glue:ListSchemas',
            'glue:ListSchemaVersions',
            'glue:ListTriggers',
            'glue:ListWorkflows',
            'greengrass:DescribeComponent',
            'greengrass:List*',
            'guardduty:DescribeOrganizationConfiguration',
            'guardduty:DescribePublishingDestination',
            'guardduty:List*',
            'health:Describe*',
            'iam:List*',
            'imagebuilder:List*',
            'importexport:List*',
            'inspector:Describe*',
            'inspector:List*',
            'iot:Describe*',
            'iot:List*',
            'iotanalytics:Describe*',
            'iotanalytics:List*',
            'iotfleethub:DescribeApplication',
            'iotfleethub:ListApplications',
            'iotsitewise:Describe*',
            'iotsitewise:List*',
            'iotwireless:ListDestinations',
            'iotwireless:ListDeviceProfiles',
            'iotwireless:ListPartnerAccounts',
            'iotwireless:ListServiceProfiles',
            'iotwireless:ListTagsForResource',
            'iotwireless:ListWirelessDevices',
            'iotwireless:ListWirelessGateways',
            'iotwireless:ListWirelessGatewayTaskDefinitions',
            'ivs:ListChannels',
            'ivs:ListPlaybackKeyPairs',
            'ivs:ListStreams',
            'ivs:ListTagsForResource',
            'kafka:Describe*',
            'kafka:List*',
            'kendra:DescribeDataSource',
            'kendra:DescribeFaq',
            'kendra:DescribeIndex',
            'kendra:DescribeThesaurus',
            'kendra:ListDataSources',
            'kendra:ListDataSourceSyncJobs',
            'kendra:ListFaqs',
            'kendra:ListIndices',
            'kendra:ListTagsForResource',
            'kendra:ListThesauri',
            'kinesis:Describe*',
            'kinesis:List*',
            'kinesisanalytics:Describe*',
            'kinesisanalytics:List*',
            'kinesisvideo:Describe*',
            'kinesisvideo:List*',
            'kms:Describe*',
            'kms:List*',
            'lambda:List*',
            'license-manager:List*',
            'logs:Describe*',
            'logs:ListTagsLogGroup',
            'machinelearning:Describe*',
            'mediaconvert:DescribeEndpoints',
            'mediaconvert:List*',
            'mediapackage:Describe*',
            'mediapackage:List*',
            'mgh:Describe*',
            'mgh:List*',
            'mobilehub:Describe*',
            'mobilehub:List*',
            'mobiletargeting:List*',
            'mq:Describe*',
            'mq:List*',
            'network-firewall:DescribeFirewall',
            'network-firewall:DescribeFirewallPolicy',
            'network-firewall:DescribeLoggingConfiguration',
            'network-firewall:DescribeResourcePolicy',
            'network-firewall:DescribeRuleGroup',
            'network-firewall:ListFirewallPolicies',
            'network-firewall:ListFirewalls',
            'network-firewall:ListRuleGroups',
            'network-firewall:ListTagsForResource',
            'networkmanager:DescribeGlobalNetworks',
            'opsworks-cm:Describe*',
            'opsworks-cm:List*',
            'opsworks:Describe*',
            'organizations:Describe*',
            'organizations:List*',
            'outposts:List*',
            'personalize:Describe*',
            'personalize:List*',
            'pi:DescribeDimensionKeys',
            'polly:Describe*',
            'polly:List*',
            'qldb:DescribeJournalS3Export',
            'qldb:DescribeLedger',
            'qldb:ListJournalS3Exports',
            'qldb:ListJournalS3ExportsForLedger',
            'qldb:ListLedgers',
            'qldb:ListTagsForResource',
            'ram:List*',
            'rds:Describe*',
            'rds:List*',
            'redshift:Describe*',
            'rekognition:List*',
            'resource-groups:List*',
            'robomaker:BatchDescribe*',
            'robomaker:Describe*',
            'robomaker:List*',
            'route53:List*',
            'route53domains:List*',
            'route53resolver:List*',
            's3:DescribeJob',
            's3:List*',
            'sagemaker:Describe*',
            'sagemaker:List*',
            'savingsplans:DescribeSavingsPlanRates',
            'savingsplans:DescribeSavingsPlans',
            'savingsplans:DescribeSavingsPlansOfferingRates',
            'savingsplans:DescribeSavingsPlansOfferings',
            'savingsplans:ListTagsForResource',
            'schemas:Describe*',
            'schemas:List*',
            'sdb:List*',
            'secretsmanager:Describe*',
            'secretsmanager:List*',
            'securityhub:Describe*',
            'securityhub:List*',
            'serverlessrepo:List*',
            'servicecatalog:Describe*',
            'servicecatalog:List*',
            'servicediscovery:List*',
            'servicequotas:ListAWSDefaultServiceQuotas',
            'servicequotas:ListRequestedServiceQuotaChangeHistory',
            'servicequotas:ListRequestedServiceQuotaChangeHistoryByQuota',
            'servicequotas:ListServiceQuotaIncreaseRequestsInTemplate',
            'servicequotas:ListServiceQuotas',
            'servicequotas:ListServices',
            'ses:Describe*',
            'ses:List*',
            'shield:Describe*',
            'shield:List*',
            'signer:DescribeSigningJob',
            'signer:ListProfilePermissions',
            'signer:ListSigningJobs',
            'signer:ListSigningPlatforms',
            'signer:ListSigningProfiles',
            'signer:ListTagsForResource',
            'snowball:Describe*',
            'snowball:List*',
            'sns:List*',
            'sqs:List*',
            'ssm:Describe*',
            'ssm:List*',
            'sso-directory:Describe*',
            'sso-directory:List*',
            'sso:Describe*',
            'sso:List*',
            'states:Describe*',
            'states:List*',
            'storagegateway:Describe*',
            'storagegateway:List*',
            'swf:Describe*',
            'swf:List*',
            'synthetics:Describe*',
            'synthetics:List*',
            'transcribe:List*',
            'transfer:Describe*',
            'transfer:List*',
            'trustedadvisor:Describe*',
            'waf-regional:List*',
            'waf:List*',
            'wafv2:Describe*',
            'wafv2:List*',
            'workdocs:Describe*',
            'worklink:Describe*',
            'worklink:List*',
            'workmail:Describe*',
            'workmail:List*',
            'workspaces:Describe*',
          ],
          resources: ['*'],
        }),
      ],
    }));
  }

  /**
   * While construct consumer may provide almost any duration, the relevant CloudWatch metric period ranges are:
   * 1 minute, 5 minutes, 15 minutes, 1 hour, 6 hours, 1 day, 7 days, 30 days.
   *
   * @return Duration - the closest CloudWatch period.
   */
  private getClosestCloudWatchMetricPeriod(duration: Duration) {
    const timeConversionOptions = { integral: false };
    if (duration.toMinutes(timeConversionOptions) <= 1) {
      return Duration.minutes(1);
    } if (duration.toMinutes(timeConversionOptions) <= 5) {
      return Duration.minutes(5);
    } else if (duration.toMinutes(timeConversionOptions) <= 15) {
      return Duration.minutes(15);
    } else if (duration.toHours(timeConversionOptions) <= 1) {
      return Duration.hours(1);
    } else if (duration.toHours(timeConversionOptions) <= 6) {
      return Duration.hours(6);
    } else if (duration.toDays(timeConversionOptions) <= 1) {
      return Duration.days(1);
    } else if (duration.toDays(timeConversionOptions) <= 7) {
      return Duration.days(7);
    } else {
      return Duration.days(30);
    }
  }

}