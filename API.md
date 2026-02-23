# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### DriftMonitor <a name="DriftMonitor" id="cdk-drift-monitor.DriftMonitor"></a>

#### Initializers <a name="Initializers" id="cdk-drift-monitor.DriftMonitor.Initializer"></a>

```typescript
import { DriftMonitor } from 'cdk-drift-monitor'

new DriftMonitor(scope: Construct, id: string, props?: DriftMonitorProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-drift-monitor.DriftMonitor.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-drift-monitor.DriftMonitor.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-drift-monitor.DriftMonitor.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-drift-monitor.DriftMonitorProps">DriftMonitorProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-drift-monitor.DriftMonitor.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-drift-monitor.DriftMonitor.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-drift-monitor.DriftMonitor.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-drift-monitor.DriftMonitorProps">DriftMonitorProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-drift-monitor.DriftMonitor.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-drift-monitor.DriftMonitor.with">with</a></code> | Applies one or more mixins to this construct. |

---

##### `toString` <a name="toString" id="cdk-drift-monitor.DriftMonitor.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="cdk-drift-monitor.DriftMonitor.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="cdk-drift-monitor.DriftMonitor.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-drift-monitor.DriftMonitor.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="cdk-drift-monitor.DriftMonitor.isConstruct"></a>

```typescript
import { DriftMonitor } from 'cdk-drift-monitor'

DriftMonitor.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="cdk-drift-monitor.DriftMonitor.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-drift-monitor.DriftMonitor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-drift-monitor.DriftMonitor.property.alarm">alarm</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-drift-monitor.DriftMonitor.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `alarm`<sup>Required</sup> <a name="alarm" id="cdk-drift-monitor.DriftMonitor.property.alarm"></a>

```typescript
public readonly alarm: Alarm;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm

---


## Structs <a name="Structs" id="Structs"></a>

### DriftMonitorProps <a name="DriftMonitorProps" id="cdk-drift-monitor.DriftMonitorProps"></a>

#### Initializer <a name="Initializer" id="cdk-drift-monitor.DriftMonitorProps.Initializer"></a>

```typescript
import { DriftMonitorProps } from 'cdk-drift-monitor'

const driftMonitorProps: DriftMonitorProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-drift-monitor.DriftMonitorProps.property.alarmOptions">alarmOptions</a></code> | <code>aws-cdk-lib.aws_cloudwatch.CreateAlarmOptions</code> | Options to create alarm. |
| <code><a href="#cdk-drift-monitor.DriftMonitorProps.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | Namespace of published metric. |
| <code><a href="#cdk-drift-monitor.DriftMonitorProps.property.runEvery">runEvery</a></code> | <code>aws-cdk-lib.Duration</code> | Run drift detection every X duration. |
| <code><a href="#cdk-drift-monitor.DriftMonitorProps.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The Lambda runtime to use for drift detection. |
| <code><a href="#cdk-drift-monitor.DriftMonitorProps.property.stackNames">stackNames</a></code> | <code>string[]</code> | List of stack names to monitor for CloudFormation drifts. |
| <code><a href="#cdk-drift-monitor.DriftMonitorProps.property.stacks">stacks</a></code> | <code>aws-cdk-lib.Stack[]</code> | List of stack to monitor for CloudFormation drifts Either stacks or stackNames are required (though not both). |

---

##### `alarmOptions`<sup>Optional</sup> <a name="alarmOptions" id="cdk-drift-monitor.DriftMonitorProps.property.alarmOptions"></a>

```typescript
public readonly alarmOptions: CreateAlarmOptions;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.CreateAlarmOptions
- *Default:* alarm on 1 drifted stacks or more, for 3 data points, for

Options to create alarm.

---

##### `metricNamespace`<sup>Optional</sup> <a name="metricNamespace" id="cdk-drift-monitor.DriftMonitorProps.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string
- *Default:* 'DriftMonitor'

Namespace of published metric.

---

##### `runEvery`<sup>Optional</sup> <a name="runEvery" id="cdk-drift-monitor.DriftMonitorProps.property.runEvery"></a>

```typescript
public readonly runEvery: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(1)

Run drift detection every X duration.

---

##### `runtime`<sup>Optional</sup> <a name="runtime" id="cdk-drift-monitor.DriftMonitorProps.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime
- *Default:* Latest Node.js runtime available in the deployment region (determined via determineLatestNodeRuntime)

The Lambda runtime to use for drift detection.

---

##### `stackNames`<sup>Optional</sup> <a name="stackNames" id="cdk-drift-monitor.DriftMonitorProps.property.stackNames"></a>

```typescript
public readonly stackNames: string[];
```

- *Type:* string[]

List of stack names to monitor for CloudFormation drifts.

Either stacks or stackNames are required (though not both)

---

##### `stacks`<sup>Optional</sup> <a name="stacks" id="cdk-drift-monitor.DriftMonitorProps.property.stacks"></a>

```typescript
public readonly stacks: Stack[];
```

- *Type:* aws-cdk-lib.Stack[]

List of stack to monitor for CloudFormation drifts Either stacks or stackNames are required (though not both).

---



