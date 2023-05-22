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

## Roadmap

- [ ] Publish to Maven
- [ ] Publish to PyPi
- [ ] Publish to NuGet
- [ ] Use [AWS Config rule `cloudformation-stack-drift-detection-check`](https://docs.aws.amazon.com/config/latest/developerguide/cloudformation-stack-drift-detection-check.html) instead of custom lambda 

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the [Apache-2.0 License](./LICENSE).

