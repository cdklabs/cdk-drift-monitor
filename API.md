# API Reference

**Classes**

Name|Description
----|-----------
[DriftMonitor](#cdk-drift-monitor-driftmonitor)|*No description*


**Structs**

Name|Description
----|-----------
[DriftMonitorProps](#cdk-drift-monitor-driftmonitorprops)|*No description*



## class DriftMonitor 🔹 <a id="cdk-drift-monitor-driftmonitor"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IDependable](#constructs-idependable)
__Extends__: [Construct](#constructs-construct)

### Initializer




```ts
new DriftMonitor(scope: Construct, id: string, props?: DriftMonitorProps)
```

* **scope** (<code>[Construct](#constructs-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[DriftMonitorProps](#cdk-drift-monitor-driftmonitorprops)</code>)  *No description*
  * **alarmOptions** (<code>[aws_cloudwatch.CreateAlarmOptions](#aws-cdk-lib-aws-cloudwatch-createalarmoptions)</code>)  Options to create alarm. __*Default*__: alarm on 1 drifted stacks or more, for 3 data points, for
  * **metricNamespace** (<code>string</code>)  Namespace of published metric. __*Default*__: 'DriftMonitor'
  * **runEvery** (<code>[Duration](#aws-cdk-lib-duration)</code>)  Run drift detection every X duration. __*Default*__: Duration.hours(1)
  * **stackNames** (<code>Array<string></code>)  List of stack names to monitor for CloudFormation drifts. __*Optional*__
  * **stacks** (<code>Array<[Stack](#aws-cdk-lib-stack)></code>)  List of stack to monitor for CloudFormation drifts Either stacks or stackNames are required (though not both). __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**alarm**🔹 | <code>[aws_cloudwatch.Alarm](#aws-cdk-lib-aws-cloudwatch-alarm)</code> | <span></span>



## struct DriftMonitorProps 🔹 <a id="cdk-drift-monitor-driftmonitorprops"></a>






Name | Type | Description 
-----|------|-------------
**alarmOptions**?🔹 | <code>[aws_cloudwatch.CreateAlarmOptions](#aws-cdk-lib-aws-cloudwatch-createalarmoptions)</code> | Options to create alarm.<br/>__*Default*__: alarm on 1 drifted stacks or more, for 3 data points, for
**metricNamespace**?🔹 | <code>string</code> | Namespace of published metric.<br/>__*Default*__: 'DriftMonitor'
**runEvery**?🔹 | <code>[Duration](#aws-cdk-lib-duration)</code> | Run drift detection every X duration.<br/>__*Default*__: Duration.hours(1)
**stackNames**?🔹 | <code>Array<string></code> | List of stack names to monitor for CloudFormation drifts.<br/>__*Optional*__
**stacks**?🔹 | <code>Array<[Stack](#aws-cdk-lib-stack)></code> | List of stack to monitor for CloudFormation drifts Either stacks or stackNames are required (though not both).<br/>__*Optional*__



