import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { DriftMonitor } from '../src';

describe('runtime configuration', () => {
  test('uses latest regional Node.js runtime by default', () => {
    const stack = new Stack();

    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
    });

    // Should use determineLatestNodeRuntime() which returns nodejs22.x in test environment
    Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs22.x',
    });
  });

  test('allows users to override with specific Node.js runtime', () => {
    const stack = new Stack();

    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runtime: lambda.Runtime.NODEJS_20_X,
    });

    Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x',
    });
  });

  test('allows users to override with another Node.js version', () => {
    const stack = new Stack();

    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
    });
  });
});
