// eslint disabled as aws-sdk dependency exists for every lambda at runtime
/* eslint-disable import/no-extraneous-dependencies */
import { CloudFormation, CloudWatch } from 'aws-sdk';
import { Stacks, NextToken, Stack, StackDriftDetectionStatus, StackDriftStatus } from 'aws-sdk/clients/cloudformation';
/* eslint-enable import/no-extraneous-dependencies */

const cloudformation = new CloudFormation();
const cloudwatch = new CloudWatch();

export async function handler() {
  if (!process.env.metricNamespace) {
    throw new Error(`Missing environment variables. metricNamespace: ${process.env.metricNamespace}`);
  }

  const requestedStackNames = process.env.stackNames?.split(',');
  const metricNamespace = process.env.metricNamespace;
  const timeoutMs = getTimeoutMs(process.env.driftDetectionTimeoutSeconds);
  console.log(`requestedStackNames: ${requestedStackNames}`);
  const stacks = await getStacks(requestedStackNames);

  const notFoundStacks = requestedStackNames?.filter(stackName => !stacks.map(x => x.StackName).includes(stackName));
  if (notFoundStacks?.length ?? 0 >= 1) {
    throw new Error(`One or more stacks not found: ${notFoundStacks}`);
  }

  const eligibleStacks = stacks.filter(isEligibleStatus);
  console.log(`eligibleStacks: ${eligibleStacks.map(x => x.StackName)}`);

  let driftStatusList: (StackDriftStatus | undefined)[] = [];
  for (const stack of eligibleStacks) {
    const driftDetectionId = await detectDriftAndGetDetectionId(stack);
    const driftStatus = await getDriftStatus(stack, driftDetectionId, timeoutMs);
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

async function getStacks(requestedStackNames?: string[]): Promise<Stacks> {
  let allStacks: Stacks = [];
  let nextToken: NextToken | undefined;
  do {
    const response = await cloudformation.describeStacks().promise();
    allStacks = response.Stacks ? [...allStacks, ...response.Stacks!] : allStacks;
    nextToken = response.NextToken;
  } while (nextToken);

  console.log(`Received stacks: ${allStacks.map(x => x.StackName)}`);
  const requestedStacks = requestedStackNames ? allStacks.filter(stack => requestedStackNames.includes(stack.StackName)) : allStacks;
  console.log(`Returning requested stacks: ${requestedStacks.map(x => x.StackName)}`);

  return requestedStacks;
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

const DEFAULT_TIMEOUT_SECONDS = 60;
const POLL_INTERVAL_MS = 1_000;

function getTimeoutMs(driftDetectionTimeoutSeconds: string | undefined): number {
  if (driftDetectionTimeoutSeconds === undefined) {
    return DEFAULT_TIMEOUT_SECONDS * 1_000;
  }
  const seconds = Number(driftDetectionTimeoutSeconds);
  if (!Number.isInteger(seconds) || seconds < 1) {
    throw new Error(`Invalid driftDetectionTimeoutSeconds: ${driftDetectionTimeoutSeconds}`);
  }
  return seconds * 1_000;
}

async function getDriftStatus(stack: Stack, detectionId: string, timeoutMs: number): Promise<StackDriftStatus | undefined> {
  const stackName = stack.StackName;
  console.log(`Waiting for drift detection ${detectionId} to complete for stack ${stackName}`);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    const response = await cloudformation.describeStackDriftDetectionStatus({
      StackDriftDetectionId: detectionId,
    }).promise();
    if (response.DetectionStatus === 'DETECTION_FAILED') {
      throw new Error(`Detection failed: ${response.DetectionStatusReason}`);
    }
    if (!shouldWaitForDriftDetectionToFinish(response.DetectionStatus)) {
      console.log(`stackName: ${stackName}, driftDetectionStatus: ${response.DetectionStatus}, stackDriftStatus: ${response.StackDriftStatus}`);
      return response.StackDriftStatus;
    }
  }
  throw new Error(`Drift detection did not finish within ${timeoutMs / 1_000} seconds for stack ${stackName}`);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}