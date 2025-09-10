import { GetRunStatusUseCase } from './GetRunStatus';
import { InMemoryFlowRunRepository } from '../../../tests/mocks/InMemoryFlowRunRepository';
import { FlowRunStatus } from '../../../generated';

describe('GetRunStatusUseCase', () => {
  let useCase: GetRunStatusUseCase;
  let flowRunRepository: InMemoryFlowRunRepository;

  beforeEach(() => {
    flowRunRepository = new InMemoryFlowRunRepository();
    useCase = new GetRunStatusUseCase(flowRunRepository);
  });

  afterEach(() => {
    flowRunRepository.clear();
  });

  describe('execute', () => {
    it('should return flow run status with context and node results', async () => {
      // Arrange
      const flowRun = await flowRunRepository.create({
        flow: { connect: { id: 'flow123' } },
        status: FlowRunStatus.running,
        input: { phone: '+1234567890' },
        context: {
          vars: { userId: 'user123' },
          node_results: {
            'A': {
              status: 'ok',
              output: { userId: 'user123', risk: { score: 0.3 } },
              finishedAt: '2023-09-10T12:00:00Z'
            },
            'B': {
              status: 'running'
            }
          },
          started_at: '2023-09-10T11:00:00Z',
          updated_at: '2023-09-10T12:00:00Z'
        }
      });

      // Act
      const result = await useCase.execute({ runId: flowRun.id });

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(flowRun.id);
      expect(result.status).toBe(FlowRunStatus.running);
      expect(result.input).toEqual({ phone: '+1234567890' });
      expect(result.context).toBeDefined();
      expect(result.context.vars).toEqual({ userId: 'user123' });
      expect(result.context.node_results).toBeDefined();
      expect(result.context.node_results['A']).toEqual({
        status: 'ok',
        output: { userId: 'user123', risk: { score: 0.3 } },
        finishedAt: '2023-09-10T12:00:00Z'
      });
      expect(result.context.node_results['B']).toEqual({
        status: 'running'
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw error when flow run is not found', async () => {
      // Act & Assert
      await expect(useCase.execute({ runId: 'nonexistent' }))
        .rejects
        .toThrow('Flow run not found');
    });

    it('should return flow run with empty context when context is not set', async () => {
      // Arrange
      const flowRun = await flowRunRepository.create({
        flow: { connect: { id: 'flow123' } },
        status: FlowRunStatus.queued,
        input: { test: 'data' },
        context: {}
      });

      // Act
      const result = await useCase.execute({ runId: flowRun.id });

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(flowRun.id);
      expect(result.status).toBe(FlowRunStatus.queued);
      expect(result.context).toEqual({});
    });

    it('should handle completed flow run status', async () => {
      // Arrange
      const flowRun = await flowRunRepository.create({
        flow: { connect: { id: 'flow123' } },
        status: FlowRunStatus.completed,
        input: { phone: '+1234567890' },
        context: {
          vars: {},
          node_results: {
            'A': { status: 'ok', output: { result: 'success' }, finishedAt: '2023-09-10T12:00:00Z' },
            'B': { status: 'ok', output: { result: 'success' }, finishedAt: '2023-09-10T12:05:00Z' }
          },
          completed_at: '2023-09-10T12:05:00Z'
        }
      });

      // Act
      const result = await useCase.execute({ runId: flowRun.id });

      // Assert
      expect(result.status).toBe(FlowRunStatus.completed);
      expect(result.context.node_results['A'].status).toBe('ok');
      expect(result.context.node_results['B'].status).toBe('ok');
    });

    it('should handle failed flow run status', async () => {
      // Arrange
      const flowRun = await flowRunRepository.create({
        flow: { connect: { id: 'flow123' } },
        status: FlowRunStatus.failed,
        input: { phone: '+1234567890' },
        context: {
          vars: {},
          node_results: {
            'A': { 
              status: 'error', 
              error: { message: 'HTTP request failed' }, 
              finishedAt: '2023-09-10T12:00:00Z' 
            }
          },
          failed_at: '2023-09-10T12:00:00Z'
        }
      });

      // Act
      const result = await useCase.execute({ runId: flowRun.id });

      // Assert
      expect(result.status).toBe(FlowRunStatus.failed);
      expect(result.context.node_results['A'].status).toBe('error');
      expect(result.context.node_results['A'].error).toEqual({ message: 'HTTP request failed' });
    });
  });
});