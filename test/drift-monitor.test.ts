import { SynthUtils } from '@aws-cdk/assert';
import { ComparisonOperator, TreatMissingData } from '@aws-cdk/aws-cloudwatch';
import { Duration, Stack } from '@aws-cdk/core';
import '@aws-cdk/assert/jest';
import { DriftMonitor } from '../src';

test('snapshot test', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stacks: [
      new Stack(stack, 'stack1'),
      new Stack(stack, 'stack2'),
    ],
  });
  const cfnArtifact = SynthUtils.synthesize(stack);

  // THEN
  expect(cfnArtifact.template).toMatchSnapshot();
});

test('lambda is created with stackNames and default metric namespace environment variables', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1', 'stack2'],
  });

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

test('lambda is created with stackNames and custom metric namespace environment variables', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1', 'stack2'],
    metricNamespace: 'customMetricNamespace',
  });

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

test('alarm is created with default values', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1'],
  });

  // THEN
  expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
    AlarmName: 'DriftDetected',
    Namespace: 'DriftMonitor',
    Threshold: 0,
    EvaluationPeriods: 1,
    Period: Duration.hours(1).toSeconds(),
    TreatMissingData: TreatMissingData.IGNORE,
    ComparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
  });
});

test('alarm is created with custom metric namespace', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1'],
    metricNamespace: 'customNamespace',
  });

  // THEN
  expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
    Namespace: 'customNamespace',
  });
});

test('alarm is created with custom alarm options', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1'],
    alarmOptions: {
      threshold: 99,
      evaluationPeriods: 3,
    },
  });

  // THEN
  expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
    Threshold: 99,
    EvaluationPeriods: 3,
  });
});

test('when given metric namespace then lambda is created with expected environment variables', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1', 'stack2'],
    metricNamespace: 'customMetricNamespace',
  });

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
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1', 'stack2'],
  });

  // THEN
  expect(stack).toHaveResource('AWS::Events::Rule', {
    ScheduleExpression: 'rate(1 hour)',
  });
});

describe('props input validation tests', () => {

  test('when no stack arguments then construct throws', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN / THEN
    expect(() => {
      new DriftMonitor(stack, 'DriftMonitor', {});
    }).toThrow();
  });

  test('when stackNames is empty then construct throws', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN / THEN
    expect(() => {
      new DriftMonitor(stack, 'DriftMonitor', {
        stackNames: [],
      });
    }).toThrow();
  });

  test('when stacks is empty then construct throws', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN / THEN
    expect(() => {
      new DriftMonitor(stack, 'DriftMonitor', {
        stacks: [],
      });
    }).toThrow();
  });

  test('when both stacks and stackNames exist then construct throws', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN / THEN
    expect(() => {
      new DriftMonitor(stack, 'DriftMonitor', {
        stacks: [new Stack(stack, 'someStack')],
        stackNames: ['someOtherStack'],
      });
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
});

describe('runEvery CloudWatch metric period tests', () => {

  test('when runEvery 1 minute then period is 1 minute', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.minutes(1),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
      Period: Duration.minutes(1).toSeconds(),
    });
  });

  test('when runEvery 4 minute then period is 5 minute', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.minutes(4),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
      Period: Duration.minutes(5).toSeconds(),
    });
  });

  test('when runEvery 14 minute then period is 15 minute', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.minutes(14),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
      Period: Duration.minutes(15).toSeconds(),
    });
  });

  test('when runEvery 16 minutes then period is 1 hour', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.minutes(16),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
      Period: Duration.hours(1).toSeconds(),
    });
  });

  test('when runEvery 61 minutes then period is 6 hour', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.minutes(61),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
      Period: Duration.hours(6).toSeconds(),
    });
  });

  test('when runEvery 5 hours then period is 6 hour', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.hours(5),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
      Period: Duration.hours(6).toSeconds(),
    });
  });

  test('when runEvery 7 hours then period is 1 day', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.hours(7),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
      Period: Duration.days(1).toSeconds(),
    });
  });

  test('when runEvery 2 days then period is 7 day', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.days(2),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
      Period: Duration.days(7).toSeconds(),
    });
  });

  test('when runEvery 8 days then period is 30 day', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.days(8),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::CloudWatch::Alarm', {
      Period: Duration.days(30).toSeconds(),
    });
  });

});