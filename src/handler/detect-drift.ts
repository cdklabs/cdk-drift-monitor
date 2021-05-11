import { CloudFormation, CloudWatch } from 'aws-sdk';
import { Stacks, NextToken, Stack, StackDriftDetectionStatus, StackDriftStatus } from 'aws-sdk/clients/cloudformation';

const cloudformation = new CloudFormation();
const cloudwatch = new CloudWatch();

export async function handler() {
  if (!process.env.stackNames || !process.env.metricNamespace) {
    throw new Error(`Missing environment variables. stackNames: ${process.env.stackNames}, metricNamespace: ${process.env.metricNamespace}`);
  }

  const requestedStackNames = process.env.stackNames.split(',');
  const metricNamespace = process.env.metricNamespace;
  console.log(`stackNamesToDetectDrift: ${requestedStackNames}`);
  const allStacks = await getStacks();
  console.log(`Received stacks: ${allStacks.map(x => x.StackName)}`);

  const notFoundStacks = requestedStackNames.filter(stackName => !allStacks.map(x => x.StackName).includes(stackName));
  if (notFoundStacks.length >= 1) {
    throw new Error(`One or more stacks not found: ${notFoundStacks}`);
  }

  const eligibleStacks = allStacks.filter(isEligibleStatus)
    .filter(stack => requestedStackNames.includes(stack.StackName));
  console.log(`Eligible stacks: ${eligibleStacks.map(x => x.StackName)}`);

  let driftStatusList: (StackDriftStatus | undefined)[] = [];
  for (const stack of eligibleStacks) {
    const driftDetectionId = await detectDriftAndGetDetectionId(stack);
    const driftStatus = await getDriftStatus(stack, driftDetectionId);
    driftStatusList = [...driftStatusList, driftStatus];
  }
  const numOfDriftedStacks = driftStatusList.filter(status => status === 'DRIFTED').length;
  console.log(`found ${numOfDriftedStacks} drifted stacks`);

  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'DriftedStacks',
        Unit: 'Count',
        Value: numOfDriftedStacks,
      },
    ],
    Namespace: metricNamespace,
  }).promise();
}

function isEligibleStatus(stack : Stack) {
  const validStates = ['CREATE_COMPLETE', 'UPDATE_COMPLETE', 'IMPORT_COMPLETE'];
  return validStates.includes(stack.StackStatus);
}

async function getStacks(): Promise<Stacks> {
  let stacks: Stacks = [];
  let nextToken: NextToken | undefined;
  do {
    const response = await cloudformation.describeStacks().promise();
    stacks = response.Stacks ? [...stacks, ...response.Stacks!] : stacks;
    nextToken = response.NextToken;
  } while (nextToken);

  return stacks;
}

async function detectDriftAndGetDetectionId(stack: Stack): Promise<string> {
  console.log(`Calling detectStackDrift for ${stack.StackName}`);
  const response = await cloudformation.detectStackDrift({
    StackName: stack.StackName,
  }).promise();

  return response.StackDriftDetectionId;
}

function shouldWaitForDriftDetectionToFinish(driftDetectionStatus: StackDriftDetectionStatus) {
  return driftDetectionStatus === 'DETECTION_IN_PROGRESS';
}

async function getDriftStatus(stack: Stack, detectionId: string): Promise<StackDriftStatus | undefined> {
  const stackName = stack.StackName;
  console.log(`Waiting for drift detection ${detectionId} to complete for stack ${stackName}`);
  const maxTries = 60;
  let tries = 0;
  let driftDetectionStatus: StackDriftDetectionStatus;
  let stackDriftStatus: StackDriftStatus | undefined;
  do {
    await sleep(1000);
    const response = await cloudformation.describeStackDriftDetectionStatus({
      StackDriftDetectionId: detectionId,
    }).promise();
    driftDetectionStatus = response.DetectionStatus;
    if (driftDetectionStatus === 'DETECTION_FAILED') {
      throw new Error(`Detection failed: ${response.DetectionStatusReason}`);
    }
    stackDriftStatus = response.StackDriftStatus;
    tries++;
  } while (shouldWaitForDriftDetectionToFinish(driftDetectionStatus) && tries < maxTries);
  if (tries === maxTries) {
    throw new Error(`Reached max tries for stack ${stackName}`);
  }

  console.log(`stackName: ${stackName}, driftDetectionStatus: ${driftDetectionStatus}, stackDriftStatus: ${stackDriftStatus}`);
  return stackDriftStatus;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}