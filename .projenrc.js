const { awscdk } = require('projen');

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Amazon Web Services, Inc.',
  authorAddress: 'aws-cdk-team@amazon.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-drift-monitor',
  minNodeVersion: '14.18.0',
  description: 'Monitors for CloudFormation stack drifts',
  repositoryUrl: 'https://github.com/cdklabs/cdk-drift-monitor',
  packageName: 'cdk-drift-monitor',
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  deps: [
    'aws-cdk-lib',
    'constructs',
  ],
  peerDeps: [
    'aws-cdk-lib',
    'constructs',
  ],
  devDeps: [
    'aws-sdk',
    'esbuild',
    'jest-each',
    'aws-cdk-lib',
    'constructs',
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
