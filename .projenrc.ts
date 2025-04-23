import { CdklabsConstructLibrary } from 'cdklabs-projen-project-types';
import { awscdk } from 'projen';

const project = new CdklabsConstructLibrary({
  author: 'Amazon Web Services, Inc.',
  projenrcTs: true,
  private: false,
  enablePRAutoMerge: true,
  authorAddress: 'aws-cdk-team@amazon.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-drift-monitor',

  description: 'Monitors for CloudFormation stack drifts',
  repositoryUrl: 'https://github.com/cdklabs/cdk-drift-monitor',
  packageName: 'cdk-drift-monitor',
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
    'cdklabs-projen-project-types',
  ],
  gitignore: [
    'src/**/*.js',
  ],
  releaseToNpm: true,

  // do not release to other jsii languages because thats the way it was
  // when migrating to cdklabs-projen-project-types.
  jsiiTargetLanguages: [],
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
  lambdaOptions: {
    runtime: awscdk.LambdaRuntime.NODEJS_20_X,
  },
});

project.synth();
