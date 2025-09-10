import { InMemoryHumanTaskRepository } from './InMemoryHumanTaskRepository';
import { HumanTaskStatus, Prisma } from '../../generated';

describe('InMemoryHumanTaskRepository', () => {
  let repository: InMemoryHumanTaskRepository;

  beforeEach(() => {
    repository = new InMemoryHumanTaskRepository();
  });

  afterEach(() => {
    repository.clear();
  });

  describe('create', () => {
    it('should create a new human task', async () => {
      const token = await repository.generateUniqueToken();
      const taskData: Prisma.HumanTaskCreateInput = {
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token,
        assignees: ['user1@example.com'],
        message: 'Please approve this request'
      };

      const task = await repository.create(taskData);

      expect(task.id).toBeDefined();
      expect(task.flowRunId).toBe('flow-run-1');
      expect(task.nodeKey).toBe('H1');
      expect(task.token).toBe(token);
      expect(task.status).toBe(HumanTaskStatus.pending);
      expect(task.blocking).toBe(true);
      expect(task.assignees).toEqual(['user1@example.com']);
      expect(task.message).toBe('Please approve this request');
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should set default values correctly', async () => {
      const token = await repository.generateUniqueToken();
      const taskData: Prisma.HumanTaskCreateInput = {
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token,
      };

      const task = await repository.create(taskData);

      expect(task.status).toBe(HumanTaskStatus.pending);
      expect(task.blocking).toBe(true);
      expect(task.assignees).toEqual([]);
      expect(task.message).toBeNull();
      expect(task.fields).toBeNull();
      expect(task.prefill).toBeNull();
      expect(task.result).toBeNull();
    });
  });

  describe('findByToken', () => {
    it('should find a task by token', async () => {
      const token = await repository.generateUniqueToken();
      const taskData: Prisma.HumanTaskCreateInput = {
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token,
      };

      const createdTask = await repository.create(taskData);
      const foundTask = await repository.findByToken(token);

      expect(foundTask).toEqual(createdTask);
    });

    it('should return null for non-existent token', async () => {
      const foundTask = await repository.findByToken('non-existent-token');
      expect(foundTask).toBeNull();
    });
  });

  describe('findByFlowRunId', () => {
    it('should find tasks by flow run ID', async () => {
      const token1 = await repository.generateUniqueToken();
      const token2 = await repository.generateUniqueToken();
      
      const task1 = await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token: token1,
      });
      
      const task2 = await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H2',
        token: token2,
      });

      await repository.create({
        flowRun: { connect: { id: 'flow-run-2' } },
        nodeKey: 'H3',
        token: await repository.generateUniqueToken(),
      });

      const tasks = await repository.findByFlowRunId('flow-run-1');

      expect(tasks).toHaveLength(2);
      expect(tasks.map(t => t.id)).toContain(task1.id);
      expect(tasks.map(t => t.id)).toContain(task2.id);
    });

    it('should return tasks ordered by creation date descending', async () => {
      const token1 = await repository.generateUniqueToken();
      const task1 = await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token: token1,
      });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));

      const token2 = await repository.generateUniqueToken();
      const task2 = await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H2',
        token: token2,
      });

      const tasks = await repository.findByFlowRunId('flow-run-1');

      expect(tasks[0].id).toBe(task2.id);
      expect(tasks[1].id).toBe(task1.id);
    });
  });

  describe('findExpiredTasks', () => {
    it('should find expired pending tasks', async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now

      const expiredTask = await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token: await repository.generateUniqueToken(),
        status: HumanTaskStatus.pending,
        expiresAt: pastDate,
      });

      await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H2',
        token: await repository.generateUniqueToken(),
        status: HumanTaskStatus.pending,
        expiresAt: futureDate,
      });

      await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H3',
        token: await repository.generateUniqueToken(),
        status: HumanTaskStatus.submitted,
        expiresAt: pastDate,
      });

      const expiredTasks = await repository.findExpiredTasks();

      expect(expiredTasks).toHaveLength(1);
      expect(expiredTasks[0].id).toBe(expiredTask.id);
    });
  });

  describe('submitResult', () => {
    it('should submit result and update status', async () => {
      const task = await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token: await repository.generateUniqueToken(),
        status: HumanTaskStatus.pending,
      });

      const result = { decision: 'approve', note: 'Looks good' };
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const updatedTask = await repository.submitResult(task.id, result);

      expect(updatedTask.status).toBe(HumanTaskStatus.submitted);
      expect(updatedTask.result).toEqual(result);
      expect(updatedTask.updatedAt.getTime()).toBeGreaterThan(task.updatedAt.getTime());
    });
  });

  describe('generateUniqueToken', () => {
    it('should generate unique tokens', async () => {
      const token1 = await repository.generateUniqueToken();
      const token2 = await repository.generateUniqueToken();

      expect(token1).not.toBe(token2);
      expect(token1).toBeTruthy();
      expect(token2).toBeTruthy();
    });

    it('should not generate duplicate tokens even if one is already used', async () => {
      const token1 = await repository.generateUniqueToken();
      
      await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token: token1,
      });

      const token2 = await repository.generateUniqueToken();
      
      expect(token2).not.toBe(token1);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const task = await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token: await repository.generateUniqueToken(),
        status: HumanTaskStatus.pending,
      });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const updatedTask = await repository.updateStatus(task.id, HumanTaskStatus.expired);

      expect(updatedTask.status).toBe(HumanTaskStatus.expired);
      expect(updatedTask.updatedAt.getTime()).toBeGreaterThan(task.updatedAt.getTime());
    });
  });

  describe('exists', () => {
    it('should return true for existing task', async () => {
      const task = await repository.create({
        flowRun: { connect: { id: 'flow-run-1' } },
        nodeKey: 'H1',
        token: await repository.generateUniqueToken(),
      });

      const exists = await repository.exists(task.id);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent task', async () => {
      const exists = await repository.exists('non-existent');
      expect(exists).toBe(false);
    });
  });
});