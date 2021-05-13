import { SynthUtils } from '@aws-cdk/assert';
import { Duration, Stack } from '@aws-cdk/core';
import '@aws-cdk/assert/jest';
import { DriftMonitor } from '../src';

test('snapshot test', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', { stackNames: ['stack1', 'stack2'] });
  const cfnArtifact = SynthUtils.synthesize(stack);

  // THEN
  expect(cfnArtifact.template).toMatchSnapshot();
});

test('lambda is created with expected environment variables', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', { stackNames: ['stack1', 'stack2'] });

  // THEN
  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        stackNames: 'stack1,stack2',
        metricNamespace: 'DriftMonitor',
      },
    },
  });
});

test('when given metric namespace then lambda is created with expected environment variables', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', { stackNames: ['stack1', 'stack2'], metricNamespace: 'customMetricNamespace' });

  // THEN
  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        stackNames: 'stack1,stack2',
        metricNamespace: 'customMetricNamespace',
      },
    },
  });
});

test('when no runEvery argument then lambda is scheduled to run every hour by default', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', { stackNames: ['stack1', 'stack2'] });

  // THEN
  expect(stack).toHaveResource('AWS::Events::Rule', {
    ScheduleExpression: 'rate(1 hour)',
  });
});

test('when stackNames is empty then construct throws', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN / THEN
  expect(() => {
    new DriftMonitor(stack, 'DriftMonitor', { stackNames: [] });
  }).toThrow();
});

test('when runEvery < 1 minute then construct throws', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN / THEN
  expect(() => {
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1', 'stack2'],
      runEvery: Duration.seconds(59),
    });
  }).toThrow();
});