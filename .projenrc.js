const { AwsCdkConstructLibrary, ProjectType } = require('projen');
const project = new AwsCdkConstructLibrary({
  author: 'Amazon Web Services, Inc.',
  authorAddress: 'aws-cdk-team@amazon.com',
  cdkVersion: '1.102.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-drift-monitor',
  description: 'Monitors for CloudFormation stack drifts',
  repositoryUrl: 'https://github.com/cdklabs/cdk-drift-monitor',
  packageName: 'cdk-drift-monitor',
  projectType: ProjectType.LIB,
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
  ],
  gitignore: [
    'src/**/*.js',
  ],
});

// A lambda handler must be ready in .js format before compilation runs in order to lambda asset to get bundled
const bundleLambdaHandlerTask = project.addTask('bundle:handler/detect-drift', {
  description: 'bundle handler/detect-drift lambda handler',
  exec: [
    'esbuild',
    '--bundle',
    `${project.srcdir}/handler/detect-drift.ts`,
    '--target="node14"',
    '--platform="node"',
    `--outfile="${project.srcdir}/handler/detect-drift.js"`,
    '--external:aws-sdk',
  ].join(' '),
});
project.compileTask.spawn(bundleLambdaHandlerTask);

project.synth();