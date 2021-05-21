import { DetectStackDriftInput, Stack, StackDriftDetectionStatus, StackDriftStatus } from 'aws-sdk/clients/cloudformation';
import Mock = jest.Mock;

/**
 * Utility for defining mock behavior for DetectDrift lambda handler
 */
export class DetectDriftMockManager {

  private readonly putMetricDataMock: Mock;
  private readonly describeStacksMock: Mock;
  private readonly describeStackDriftDetectionStatusMock: Mock;

  constructor() {
    this.putMetricDataMock = jest.fn().mockImplementation(() => {
      return {
        promise: () => new Promise(resolve => {
          resolve(null);
        }),
      };
    });
    const detectStackDriftMock = jest.fn().mockImplementation((detectStackDriftInput: DetectStackDriftInput) => {
      return {
        promise: () => new Promise(resolve => {
          resolve({
            StackDriftDetectionId: detectStackDriftInput.StackName,
          });
        }),
      };
    });
    this.describeStackDriftDetectionStatusMock = jest.fn();
    this.describeStacksMock = jest.fn();

    jest.doMock('aws-sdk', () => ({
      __esModule: true, // this property makes it work
      CloudFormation: jest.fn().mockImplementation(() => {
        return {
          describeStacks: this.describeStacksMock,
          detectStackDrift: detectStackDriftMock,
          describeStackDriftDetectionStatus: this.describeStackDriftDetectionStatusMock,
        };
      }),
      CloudWatch: jest.fn().mockImplementation(() => {
        return {
          putMetricData: this.putMetricDataMock,
        };
      }),
    }));
  }

  public mockDescribeStacksResponse(stackSummaryList: StackSummary[]) {
    stackSummaryList.forEach((stackSummary, index) => {
      this.describeStacksMock.mockImplementationOnce(() => {
        return {
          promise: () => new Promise(resolve => {
            resolve({
              Stacks: [stackSummary],
              NextToken: index < stackSummaryList.length - 1 ? 'someToken' : null,
            });
          }),
        };
      });
    });
  }

  public mockDescribeStackDriftDetectionStatusResponse(stackDriftStatus: StackDriftStatus,
    stackDriftDetectionStatus?: StackDriftDetectionStatus) {
    this.describeStackDriftDetectionStatusMock.mockImplementationOnce(() => {
      return {
        promise: () => new Promise(resolve => {
          resolve({
            StackDriftStatus: stackDriftStatus,
            DetectionStatus: stackDriftDetectionStatus ?? 'DETECTION_COMPLETE',
          });
        }),
      };
    });
  }

  public getDriftMetricValue(): number {
    return this.putMetricDataMock.mock.calls[0][0].MetricData[0].Value;
  }

}

/**
 *
 */
export interface StackSummary extends Omit<Stack, 'CreationTime'> {}