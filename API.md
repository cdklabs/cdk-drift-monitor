# API Reference

**Classes**

Name|Description
----|-----------
[DriftMonitor](#cdk-drift-monitor-driftmonitor)|*No description*
[MonitoredStack](#cdk-drift-monitor-monitoredstack)|*No description*


**Structs**

Name|Description
----|-----------
[DriftMonitorProps](#cdk-drift-monitor-driftmonitorprops)|*No description*



## class DriftMonitor  <a id="cdk-drift-monitor-driftmonitor"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new DriftMonitor(scope: Construct, id: string, props: DriftMonitorProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[DriftMonitorProps](#cdk-drift-monitor-driftmonitorprops)</code>)  *No description*
  * **stacks** (<code>Array<[MonitoredStack](#cdk-drift-monitor-monitoredstack)></code>)  List of stack to monitor for CloudFormation drifts. 
  * **alarmOptions** (<code>[CreateAlarmOptions](#aws-cdk-aws-cloudwatch-createalarmoptions)</code>)  Options to create alarm. __*Default*__: alarm on 1 drifted stacks or more, for 3 data points, for
  * **metricNamespace** (<code>string</code>)  Namespace of published metric. __*Default*__: 'DriftMonitor'
  * **runEvery** (<code>[Duration](#aws-cdk-core-duration)</code>)  Run drift detection every X duration. __*Default*__: Duration.hours(1)



### Properties


Name | Type | Description 
-----|------|-------------
**alarm** | <code>[Alarm](#aws-cdk-aws-cloudwatch-alarm)</code> | <span></span>



## class MonitoredStack  <a id="cdk-drift-monitor-monitoredstack"></a>





### Properties


Name | Type | Description 
-----|------|-------------
**name** | <code>string</code> | <span></span>

### Methods


#### *static* fromNames(...stackNames) <a id="cdk-drift-monitor-monitoredstack-fromnames"></a>



```ts
static fromNames(...stackNames: string[]): Array<MonitoredStack>
```

* **stackNames** (<code>string</code>)  *No description*

__Returns__:
* <code>Array<[MonitoredStack](#cdk-drift-monitor-monitoredstack)></code>

#### *static* fromStacks(...stacks) <a id="cdk-drift-monitor-monitoredstack-fromstacks"></a>



```ts
static fromStacks(...stacks: Stack[]): Array<MonitoredStack>
```

* **stacks** (<code>[Stack](#aws-cdk-core-stack)</code>)  *No description*

__Returns__:
* <code>Array<[MonitoredStack](#cdk-drift-monitor-monitoredstack)></code>



## struct DriftMonitorProps  <a id="cdk-drift-monitor-driftmonitorprops"></a>






Name | Type | Description 
-----|------|-------------
**stacks** | <code>Array<[MonitoredStack](#cdk-drift-monitor-monitoredstack)></code> | List of stack to monitor for CloudFormation drifts.
**alarmOptions**? | <code>[CreateAlarmOptions](#aws-cdk-aws-cloudwatch-createalarmoptions)</code> | Options to create alarm.<br/>__*Default*__: alarm on 1 drifted stacks or more, for 3 data points, for
**metricNamespace**? | <code>string</code> | Namespace of published metric.<br/>__*Default*__: 'DriftMonitor'
**runEvery**? | <code>[Duration](#aws-cdk-core-duration)</code> | Run drift detection every X duration.<br/>__*Default*__: Duration.hours(1)



