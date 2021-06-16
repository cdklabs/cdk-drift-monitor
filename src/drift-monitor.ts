import { join } from 'path';
import { Alarm, ComparisonOperator, Metric, Statistic, TreatMissingData, Unit } from '@aws-cdk/aws-cloudwatch';
import { CreateAlarmOptions } from '@aws-cdk/aws-cloudwatch/lib/metric';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import { Effect, ManagedPolicy, Policy, PolicyStatement } from '@aws-cdk/aws-iam';
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

  constructor(scope: Construct, id: string, props: DriftMonitorProps = {}) {
    super(scope, id);

    if ((props.stacks !== undefined && props.stacks.length > 0) && (props.stackNames !== undefined && props.stackNames.length > 0)) {
      throw new Error('Must have either stacks or stackNames, not both');
    }
    if (props.runEvery !== undefined && props.runEvery.toSeconds() < 60) {
      throw new Error('runEvery must be higher than 1 minute');
    }

    const stacks = props.stacks?.map(stack => stack.stackName) ?? props.stackNames;
    const metricNamespace = props.metricNamespace ?? 'DriftMonitor';
    const detectDriftLambda = new lambda.Function(this, 'DetectDriftLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'detect-drift.handler',
      code: lambda.Code.fromAsset(join(__dirname, '/handler')),
      environment: {
        metricNamespace: metricNamespace,
        ... stacks ? { stackNames: stacks.join(',') } : {},
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

    const lambdaHandlerPolicy = new Policy(this, 'LambdaHandlerPolicy', {
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
      ],
    });
    const readOnlyAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess');
    detectDriftLambda.role!.attachInlinePolicy(lambdaHandlerPolicy);
    detectDriftLambda.role!.addManagedPolicy(readOnlyAccessPolicy);
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