import { z } from 'zod';
import { Config, WorkflowStep } from '../config.types'
import { generateWorkflowsList } from '../workflows-endpoint';

// Mock randomUUID for consistent test results
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}));

describe('generateWorkflowsList', () => {
  it('should generate a list of workflows with steps', () => {
    const mockConfig: Config = {
      workflows: {
        workflow1: { name: 'Workflow 1' },
      },
      api: {
        paths: {
          '/path1': { name: 'Path 1', emits: 'event1', workflow: 'workflow1', method: 'GET' },
          '/path2': { name: 'Path 2', emits: 'event2', workflow: 'workflow1', method: 'POST' },
        },
        port: 3000,
      },
      cron: {
        cron1: { name: 'Cron Job 1', emits: 'event1', workflow: 'workflow1', cron: '* * * * *' },
      },
      state: {
        adapter: 'redis',
        host: 'localhost',
        port: 6379,
      }
    };

    const mockWorkflowSteps: WorkflowStep[] = [
      {
        config: {
          workflow: 'workflow1',
          name: 'Step 1',
          description: 'First step',
          emits: ['event1'],
          subscribes: [],
          input: z.object({}),
        },
        file: 'path',
        filePath: 'step1/path',
      },
      {
        config: {
          workflow: 'workflow1',
          name: 'Step 2',
          description: 'Second step',
          emits: ['event2'],
          subscribes: ['event1'],
          input: z.object({}),
        },
        file: 'path',
        filePath: 'step2/path',
      },
      {
        config: {
          workflow: 'workflow1',
          name: 'Step 3',
          description: 'Third step',
          emits: ['event3'],
          subscribes: ['event2'],
          input: z.object({}),
        },
        file: 'path',
        filePath: 'step3/path',
      },
    ];

    const result = generateWorkflowsList(mockConfig, mockWorkflowSteps);

    const mockedInputSchema = {
      "$schema": "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {},
      type: "object",
    }; // Empty schema from z.object({})

    expect(result).toEqual([
      {
        id: 'workflow1',
        name: 'Workflow 1',
        steps: [
          {
            id: 'mocked-uuid',
            type: 'trigger',
            name: 'Path 1',
            description: undefined,
            emits: ['event1'],
            action: 'webhook',
            webhookUrl: 'GET /path1',
            inputSchema: mockedInputSchema
          },
          {
            id: 'mocked-uuid',
            type: 'trigger',
            name: 'Path 2',
            description: undefined,
            emits: ['event2'],
            action: 'webhook',
            webhookUrl: 'POST /path2',
            inputSchema: mockedInputSchema
          },
          {
            id: 'mocked-uuid',
            type: 'base',
            name: 'Step 1',
            description: 'First step',
            emits: ['event1'],
            subscribes: [],
          },
          {
            id: 'mocked-uuid',
            type: 'base',
            name: 'Step 2',
            description: 'Second step',
            emits: ['event2'],
            subscribes: ['event1'],
          },
          {
            id: 'mocked-uuid',
            type: 'base',
            name: 'Step 3',
            description: 'Third step',
            emits: ['event3'],
            subscribes: ['event2'],
          },
          {
            id: 'mocked-uuid',
            type: 'trigger',
            name: 'Cron Job 1',
            description: undefined,
            emits: ['event1'],
            action: 'cron',
            cron: '* * * * *',
          },
        ],
      },
    ]);
  });

  it('should throw an error for missing workflow in steps', () => {
    const mockConfig: Config = {
      workflows: {
        workflow1: { name: 'Workflow 1' },
      },
      api: { paths: {}, port: 3000 },
      cron: {},
      state: {
        adapter: 'redis',
        host: 'localhost',
        port: 6379,
      }
    };

    const mockWorkflowSteps: WorkflowStep[] = [
      {
        config: {
          workflow: 'workflow2', // Invalid workflow
          name: 'Step 1',
          description: 'First step',
          emits: ['event1'],
          subscribes: [],
          input: z.object({}),
        },
        filePath: 'step1/path',
        file: 'path',
      },
    ];

    expect(() => generateWorkflowsList(mockConfig, mockWorkflowSteps)).toThrow(
      'Unknown workflow name workflow2 in step1/path, all workflows should be defined in the config.yml'
    );
  });

  it('should throw an error if no workflow steps are found for a workflow', () => {
    const mockConfig: Config = {
      workflows: {
        workflow1: { name: 'Workflow 1' },
      },
      api: { paths: {}, port: 3000 },
      cron: {},
      state: {
        adapter: 'redis',
        host: 'localhost',
        port: 6379,
      }
    };

    const mockWorkflowSteps: WorkflowStep[] = [];

    expect(() => generateWorkflowsList(mockConfig, mockWorkflowSteps)).toThrow(
      'No workflow steps found for workflow with id workflow1'
    );
  });

  it('should throw an error if no triggers are found for a workflow', () => {
    const mockConfig: Config = {
      workflows: {
        workflow1: { name: 'Workflow 1' },
      },
      api: { paths: {}, port: 3000 },
      cron: {},
      state: {
        adapter: 'redis',
        host: 'localhost',
        port: 6379,
      }
    };

    const mockWorkflowSteps: WorkflowStep[] = [
      {
        config: {
          workflow: 'workflow1',
          name: 'Step 1',
          description: 'First step',
          emits: ['event1'],
          subscribes: [],
          input: z.object({}),
        },
        filePath: 'step1/path',
        file: 'path',
      },
    ];

    expect(() => generateWorkflowsList(mockConfig, mockWorkflowSteps)).toThrow(
      'No triggers (api or cron) found for workflow with id workflow1'
    );
  });
});
