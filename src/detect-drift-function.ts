import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { determineLatestNodeRuntime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Props for DetectDriftFunction
 */
export interface DetectDriftFunctionProps extends lambda.FunctionOptions {
  /**
   * The Lambda runtime to use for drift detection.
   *
   * @default - Latest Node.js runtime available in your deployment region (determined via determineLatestNodeRuntime)
   */
  readonly lambdaRuntime?: lambda.Runtime;
}

/**
 * An AWS Lambda function which executes src/detect-drift.
 */
export class DetectDriftFunction extends lambda.Function {
  constructor(scope: Construct, id: string, props?: DetectDriftFunctionProps) {
    const runtime = props?.lambdaRuntime ?? determineLatestNodeRuntime(scope);

    // Validate that the runtime is Node.js
    if (runtime.family !== lambda.RuntimeFamily.NODEJS) {
      throw new Error(`DetectDriftFunction only supports Node.js runtimes, but ${runtime.name} was provided`);
    }

    super(scope, id, {
      description: 'src/detect-drift.lambda.ts',
      ...props,
      runtime: runtime,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/detect-drift.lambda')),
    });
    this.addEnvironment('AWS_NODEJS_CONNECTION_REUSE_ENABLED', '1', { removeInEdge: true });
  }
}
