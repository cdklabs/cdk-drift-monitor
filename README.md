## CDK Drift Monitor

Monitors for CloudFormation stack drifts. By default, detects drifts for all stacks:

```ts
new DriftMonitor(driftDetectStack, 'DriftMonitor');
```

You can also specify a list of stacks to detect drifts:

```ts
new DriftMonitor(driftDetectStack, 'DriftMonitor', {
  stacks: [myStack1, myStack2],
});
```

It can also be initialized by providing stack names:

```ts
new DriftMonitor(driftDetectStack, 'DriftMonitor', {
  stackNames: ['myStack1', 'myStack2'],
});
```

By default, the drift detection will run every hour. This can be customized:

```ts
new DriftMonitor(driftDetectStack, 'DriftMonitor', {
  runEvery: Duration.hours(24),
});
```

The construct creates an alarm with no actions. Here's an example for adding an alarm action:

```ts
import * as sns from 'aws-cdk-lib/aws-sns';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

const driftMonitor = new DriftMonitor(driftDetectStack, 'DriftMonitor');
const topic = new sns.Topic(this, 'errorTopic');
driftMonitor.alarm.addAlarmAction(new SnsAction(topic));
```

## Lambda Runtime

By default, the drift detection Lambda function uses the latest Node.js runtime available in your deployment region. This is determined automatically at CDK synthesis time.

You can override the runtime to use a specific Node.js version:

```ts
import * as lambda from 'aws-cdk-lib/aws-lambda';

new DriftMonitor(driftDetectStack, 'DriftMonitor', {
  runtime: lambda.Runtime.NODEJS_20_X,
});
```

## Drift Detection Timeout

By default, the Lambda function waits up to 1 minute for drift detection to finish on each stack.
It checks the detection status every second.
Drift detection on stacks with many resources can take longer, and the function then fails with
`Drift detection did not finish within <n> seconds for stack <name>` and emits no metric.
Raise the timeout for large stacks:

```ts
new DriftMonitor(driftDetectStack, 'DriftMonitor', {
  driftDetectionTimeout: Duration.minutes(4),
});
```

The timeout can be from 1 second to 4 minutes. Stacks are checked one after another, so the total
for all stacks must fit in the 5 minute Lambda timeout.

## Roadmap

- [ ] Publish to Maven
- [ ] Publish to PyPi
- [ ] Publish to NuGet
- [ ] Use [AWS Config rule `cloudformation-stack-drift-detection-check`](https://docs.aws.amazon.com/config/latest/developerguide/cloudformation-stack-drift-detection-check.html) instead of custom lambda 

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the [Apache-2.0 License](./LICENSE).

