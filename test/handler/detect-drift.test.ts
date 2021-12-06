// IntelliJ incorrectly marks this import as TS6059 violation, however it builds successfully.
// https://youtrack.jetbrains.com/issue/WEB-44587
import each from 'jest-each';
import { DetectDriftMockManager } from './detect-drift-mock-manager';

describe('detect-drift lambda handler tests', () => {

  const ORIGINAL_PROCESS_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_PROCESS_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_PROCESS_ENV;
  });

  test('when all env variables missing then throw', async (done) => {
    const handler = await importHandler();
    handler().catch(e => {
      expect(e.toString()).toContain('Missing environment variables');
      done();
    });
  });

  test('when metricNamespace env variables missing then throw', async (done) => {
    // GIVEN
    process.env.stackNames = 'stack';

    // WHEN / THEN
    const handler = await importHandler();
    handler().catch(e => {
      expect(e.toString()).toContain('Missing environment variables');
      done();
    });
  });


  test('when stack not found then throw', async (done) => {
    // GIVEN
    process.env.stackNames = 'stack';
    process.env.metricNamespace = 'someNamespace';

    // WHEN
    const detectDriftMockManager = new DetectDriftMockManager();
    detectDriftMockManager.mockDescribeStacksResponse([{
      StackName: 'someOtherStack',
      StackStatus: 'CREATE_COMPLETE',
    }]);

    // THEN
    const handler = await importHandler();
    handler().catch(e => {
      expect(e.toString()).toContain('One or more stacks not found');
      done();
    });
  });

  const ineligibleStatuses = [
    'CREATE_IN_PROGRESS',
    'CREATE_FAILED',
    'ROLLBACK_IN_PROGRESS',
    'ROLLBACK_FAILED',
    'ROLLBACK_COMPLETE',
    'DELETE_IN_PROGRESS',
    'DELETE_FAILED',
    'DELETE_COMPLETE',
    'UPDATE_IN_PROGRESS',
    'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
    'UPDATE_ROLLBACK_IN_PROGRESS',
    'UPDATE_ROLLBACK_FAILED',
    'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
    'UPDATE_ROLLBACK_COMPLETE',
    'REVIEW_IN_PROGRESS',
    'IMPORT_IN_PROGRESS',
    'IMPORT_ROLLBACK_IN_PROGRESS',
    'IMPORT_ROLLBACK_FAILED',
    'IMPORT_ROLLBACK_COMPLETE',
  ];
  each(ineligibleStatuses).test('when stack status is in %s status then emit 0 drifts', async (stackStatus: string, done) => {
    // GIVEN
    process.env.stackNames = 'stack';
    process.env.metricNamespace = 'someNamespace';

    // WHEN
    const detectDriftMockManager = new DetectDriftMockManager();
    detectDriftMockManager.mockDescribeStacksResponse([{
      StackName: 'stack',
      StackStatus: stackStatus,
    }]);

    // THEN
    const handler = await importHandler();
    void handler().then(() => {
      expect(detectDriftMockManager.getDriftMetricValue()).toBe(0);
      done();
    });
  });

  test('when stack has no drifts then emit 0 drifts', async (done) => {
    // GIVEN
    process.env.stackNames = 'stack';
    process.env.metricNamespace = 'someNamespace';

    // WHEN
    const detectDriftMockManager = new DetectDriftMockManager();
    detectDriftMockManager.mockDescribeStacksResponse([{
      StackName: 'stack',
      StackStatus: 'CREATE_COMPLETE',
    }]);
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('IN_SYNC');

    // THEN
    const handler = await importHandler();
    void handler().then(() => {
      expect(detectDriftMockManager.getDriftMetricValue()).toBe(0);
      done();
    });
  });

  test('when stack has drift then emit 1 drifts', async (done) => {
    // GIVEN
    process.env.stackNames = 'stack';
    process.env.metricNamespace = 'someNamespace';

    // WHEN
    const detectDriftMockManager = new DetectDriftMockManager();
    detectDriftMockManager.mockDescribeStacksResponse([{
      StackName: 'stack',
      StackStatus: 'CREATE_COMPLETE',
    }]);
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('DRIFTED');

    // THEN
    const handler = await importHandler();
    void handler().then(() => {
      expect(detectDriftMockManager.getDriftMetricValue()).toBe(1);
      done();
    });
  });

  test('when detection status in progress and then call until status completed', async (done) => {
    // GIVEN
    process.env.stackNames = 'stack';
    process.env.metricNamespace = 'someNamespace';

    // WHEN
    const detectDriftMockManager = new DetectDriftMockManager();
    detectDriftMockManager.mockDescribeStacksResponse([{
      StackName: 'stack',
      StackStatus: 'CREATE_COMPLETE',
    }]);
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('UNKNOWN', 'DETECTION_IN_PROGRESS');
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('DRIFTED', 'DETECTION_COMPLETE');

    // THEN
    const handler = await importHandler();
    void handler().then(() => {
      expect(detectDriftMockManager.getDriftMetricValue()).toBe(1);
      done();
    });
  });

  test('when detection status is failed then throw', async (done) => {
    // GIVEN
    process.env.stackNames = 'stack';
    process.env.metricNamespace = 'someNamespace';

    // WHEN
    const detectDriftMockManager = new DetectDriftMockManager();
    detectDriftMockManager.mockDescribeStacksResponse([{
      StackName: 'stack',
      StackStatus: 'CREATE_COMPLETE',
    }]);
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('UNKNOWN', 'DETECTION_FAILED');

    // THEN
    const handler = await importHandler();
    void handler().catch((e) => {
      expect(e.toString()).toContain('Detection failed');
      done();
    });
  });

  test('when 3 stacks have 2 drifts have then emit 2 drifts', async (done) => {
    // GIVEN
    process.env.stackNames = 'stack1,stack2,stack3';
    process.env.metricNamespace = 'someNamespace';

    // WHEN
    const detectDriftMockManager = new DetectDriftMockManager();
    detectDriftMockManager.mockDescribeStacksResponse([
      {
        StackName: 'stack1',
        StackStatus: 'CREATE_COMPLETE',
      },
      {
        StackName: 'stack2',
        StackStatus: 'CREATE_COMPLETE',
      },
      {
        StackName: 'stack3',
        StackStatus: 'CREATE_COMPLETE',
      },
    ]);
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('IN_SYNC', 'DETECTION_COMPLETE');
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('DRIFTED', 'DETECTION_COMPLETE');
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('DRIFTED', 'DETECTION_COMPLETE');

    // THEN
    const handler = await importHandler();
    void handler().then(() => {
      expect(detectDriftMockManager.getDriftMetricValue()).toBe(2);
      done();
    });
  });


  test('when stackNames env variables missing then detect drift on all stacks', async (done) => {
    // GIVEN
    process.env.metricNamespace = 'someNamespace';

    // WHEN
    const detectDriftMockManager = new DetectDriftMockManager();
    detectDriftMockManager.mockDescribeStacksResponse([
      {
        StackName: 'stack1',
        StackStatus: 'CREATE_COMPLETE',
      },
      {
        StackName: 'stack2',
        StackStatus: 'CREATE_COMPLETE',
      },
    ]);
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('DRIFTED', 'DETECTION_COMPLETE');
    detectDriftMockManager.mockDescribeStackDriftDetectionStatusResponse('DRIFTED', 'DETECTION_COMPLETE');

    // THEN
    const handler = await importHandler();
    void handler().then(() => {
      expect(detectDriftMockManager.getDriftMetricValue()).toBe(2);
      done();
    });
  });
});

async function importHandler() {
  const { handler } = await import('../../src/detect-drift.lambda');
  return handler;
}