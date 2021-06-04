## CDK Drift Monitor

Monitors for CloudFormation stack drifts. By default, detects drifts for all stacks:

```typescript
new DriftMonitor(driftDetectStack, 'DriftMonitor');
```

You can also specify a list of stacks to detect drifts:

```typescript
new DriftMonitor(driftDetectStack, 'DriftMonitor', {
  stacks: [myStack1, myStack2],
});
```

It can also be initialized by providing stack names:

```typescript
new DriftMonitor(driftDetectStack, 'DriftMonitor', {
  stackNames: ['myStack1', 'myStack2'],
});
```

By default, the drift detection will run every hour. This can be customized:

```typescript
new DriftMonitor(driftDetectStack, 'DriftMonitor', {
  runEvery: Duration.minutes(10)
});
```

The construct creates an alarm with no actions. Here's an example for adding an alarm action:

```typescript
const driftMonitor = new DriftMonitor(driftDetectStack, 'DriftMonitor', {
  stacks: [myStack1, myStack2],
  runEvery: Duration.minutes(10),
});
driftMonitor.alarm.addAlarmAction(new SnsAction('errorTopic'))
```

## Roadmap

- [ ] Publish to Maven
- [ ] Publish to PyPi
- [ ] Publish to NuGet
- [ ] Add alarm for error on lambda execution?
- [ ] Replace long list of IAM policy statement actions with something better

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the [Apache-2.0 License](./LICENSE).

