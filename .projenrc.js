const { DependencyType, awscdk, ProjectType } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Amazon Web Services, Inc.',
  authorAddress: 'aws-cdk-team@amazon.com',
  cdkVersion: '1.106.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-drift-monitor',
  description: 'Monitors for CloudFormation stack drifts',
  repositoryUrl: 'https://github.com/cdklabs/cdk-drift-monitor',
  packageName: 'cdk-drift-monitor',
  projectType: ProjectType.LIB,
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-cloudwatch',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
  ],
  devDeps: [
    'aws-sdk',
    'esbuild',
    'jest-each',
  ],
  gitignore: [
    'src/**/*.js',
  ],
  releaseToNpm: true,
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
});

project.synth();
