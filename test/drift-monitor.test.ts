import { Duration, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ComparisonOperator, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
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

  // THEN
  expect(Template.fromStack(stack).toJSON()).toMatchSnapshot();
});

test('lambda is created with stackNames and default metric namespace environment variables', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1', 'stack2'],
  });

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        stackNames: 'stack1,stack2',
        metricNamespace: 'DriftMonitor',
      },
    },
  });
});

test('lambda is created with no stackNames and default metric namespace environment variables', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor');

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
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
  Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        stackNames: 'stack1,stack2',
        metricNamespace: 'customMetricNamespace',
      },
    },
  });
});

test('when driftDetectionTimeout is given then lambda is created with driftDetectionTimeoutSeconds', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1'],
    driftDetectionTimeout: Duration.minutes(4),
  });

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        stackNames: 'stack1',
        metricNamespace: 'DriftMonitor',
        driftDetectionTimeoutSeconds: '240',
      },
    },
  });
});

test('when no driftDetectionTimeout then lambda has no driftDetectionTimeoutSeconds', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1'],
  });

  // THEN
  const functions = Template.fromStack(stack).findResources('AWS::Lambda::Function');
  const variables = Object.values(functions)
    .map((fn: any) => fn.Properties.Environment?.Variables ?? {});
  variables.forEach(vars => expect(vars).not.toHaveProperty('driftDetectionTimeoutSeconds'));
});

test('alarm is created with default values', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new DriftMonitor(stack, 'DriftMonitor', {
    stackNames: ['stack1'],
  });

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
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
  Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
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
  Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
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
  Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
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
  Template.fromStack(stack).hasResourceProperties('AWS::Events::Rule', {
    ScheduleExpression: 'rate(1 hour)',
  });
});

describe('props input validation tests', () => {
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

  test.each([
    ['0 seconds', Duration.seconds(0)],
    ['more than 5 minutes', Duration.minutes(6)],
    ['a fraction of a second', Duration.millis(1500)],
  ])('when driftDetectionTimeout is %s then construct throws', (_name, driftDetectionTimeout) => {
    // GIVEN
    const stack = new Stack();

    // THEN
    expect(() => new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      driftDetectionTimeout,
    })).toThrow(/driftDetectionTimeout must be a whole number of seconds between 1 second and 5 minutes/);
  });

  test('when runEvery is not in supported durations then construct throws', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN / THEN
    expect(() => {
      new DriftMonitor(stack, 'DriftMonitor', {
        stackNames: ['stack1', 'stack2'],
        runEvery: Duration.hours(2),
      });
    }).toThrow();
  });
});


describe('runEvery CloudWatch metric period tests', () => {

  test('when runEvery 1 hour then period is 1 hour', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.hours(1),
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
      Period: Duration.hours(1).toSeconds(),
    });
  });

  test('when runEvery 3 hours then period is 6 hours', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.hours(3),
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
      Period: Duration.hours(6).toSeconds(),
    });
  });

  test('when runEvery 12 hours then period is 24 hours', () => {
    // GIVEN
    const stack = new Stack();

    // WHEN
    new DriftMonitor(stack, 'DriftMonitor', {
      stackNames: ['stack1'],
      runEvery: Duration.hours(12),
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
      Period: Duration.hours(24).toSeconds(),
    });
  });
});