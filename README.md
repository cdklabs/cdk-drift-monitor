## CDK Drift Monitor

Monitors for CloudFormation stack drifts. The construct requires a list of stack names to get started:

```typescript
new DriftMonitor(driftDetectStack, 'CloudFormationDriftMonitor', {
    stackNames: ['MyStack1', 'MyStack2']
});
```

By default, the drift detection will run every hour. This can be customized:

```typescript
new DriftMonitor(driftDetectStack, 'CloudFormationDriftMonitor', {
    stackNames: ['MyStack1', 'MyStack2'],
    runEvery: Duration.minutes(10),
});
```

The construct creates an alarm with no actions. Here's an example for adding an alarm action:

```typescript
const driftMonitor = new DriftMonitor(driftDetectStack, 'CloudFormationDriftMonitor', {
    stackNames: ['MyStack1', 'MyStack2'],
    runEvery: Duration.minutes(10),
});
driftMonitor.alarm.addAlarmAction(new SnsAction('errorTopic'))
```

## Roadmap

- [ ] More construct tests
- [ ] Lambda handler tests
- [ ] Add alarm for error on lambda execution?
- [ ] Replace long list of IAM policy statement actions with something better

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the [Apache-2.0 License](./LICENSE).

