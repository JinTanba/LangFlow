import { InMemoryFlowRepository } from './InMemoryFlowRepository';
import { Prisma } from '../../generated';

describe('InMemoryFlowRepository', () => {
  let repository: InMemoryFlowRepository;

  beforeEach(() => {
    repository = new InMemoryFlowRepository();
  });

  afterEach(() => {
    repository.clear();
  });

  describe('create', () => {
    it('should create a new flow', async () => {
      const flowData: Prisma.FlowCreateInput = {
        name: 'Test Flow',
        version: 1,
        nodes: {
          nodes: [
            {
              key: 'A',
              kind: 'program',
              input_schema: { type: 'object' },
              output_schema: { type: 'object' }
            }
          ]
        }
      };

      const flow = await repository.create(flowData);

      expect(flow.id).toBeDefined();
      expect(flow.name).toBe('Test Flow');
      expect(flow.version).toBe(1);
      expect(flow.nodes).toEqual(flowData.nodes);
      expect(flow.createdAt).toBeInstanceOf(Date);
      expect(flow.updatedAt).toBeInstanceOf(Date);
    });

    it('should assign unique IDs to flows', async () => {
      const flowData: Prisma.FlowCreateInput = {
        name: 'Test Flow',
        version: 1,
        nodes: {}
      };

      const flow1 = await repository.create(flowData);
      const flow2 = await repository.create(flowData);

      expect(flow1.id).not.toBe(flow2.id);
    });
  });

  describe('findById', () => {
    it('should find a flow by ID', async () => {
      const flowData: Prisma.FlowCreateInput = {
        name: 'Test Flow',
        version: 1,
        nodes: {}
      };

      const createdFlow = await repository.create(flowData);
      const foundFlow = await repository.findById(createdFlow.id);

      expect(foundFlow).toEqual(createdFlow);
    });

    it('should return null for non-existent ID', async () => {
      const foundFlow = await repository.findById('non-existent');
      expect(foundFlow).toBeNull();
    });
  });

  describe('findByNameAndVersion', () => {
    it('should find a flow by name and version', async () => {
      const flowData: Prisma.FlowCreateInput = {
        name: 'Test Flow',
        version: 1,
        nodes: {}
      };

      const createdFlow = await repository.create(flowData);
      const foundFlow = await repository.findByNameAndVersion('Test Flow', 1);

      expect(foundFlow).toEqual(createdFlow);
    });

    it('should return null for non-existent name/version combination', async () => {
      const foundFlow = await repository.findByNameAndVersion('Non-existent', 1);
      expect(foundFlow).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a flow', async () => {
      const flowData: Prisma.FlowCreateInput = {
        name: 'Test Flow',
        version: 1,
        nodes: {}
      };

      const createdFlow = await repository.create(flowData);
      const updateData: Prisma.FlowUpdateInput = {
        name: 'Updated Flow',
        version: 2
      };

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 5));
      const updatedFlow = await repository.update(createdFlow.id, updateData);

      expect(updatedFlow.id).toBe(createdFlow.id);
      expect(updatedFlow.name).toBe('Updated Flow');
      expect(updatedFlow.version).toBe(2);
      expect(updatedFlow.updatedAt.getTime()).toBeGreaterThan(createdFlow.updatedAt.getTime());
    });

    it('should throw error for non-existent flow', async () => {
      await expect(repository.update('non-existent', { name: 'Updated' }))
        .rejects.toThrow('Flow with id non-existent not found');
    });
  });

  describe('delete', () => {
    it('should delete a flow', async () => {
      const flowData: Prisma.FlowCreateInput = {
        name: 'Test Flow',
        version: 1,
        nodes: {}
      };

      const createdFlow = await repository.create(flowData);
      const deletedFlow = await repository.delete(createdFlow.id);

      expect(deletedFlow).toEqual(createdFlow);
      
      const foundFlow = await repository.findById(createdFlow.id);
      expect(foundFlow).toBeNull();
    });

    it('should throw error for non-existent flow', async () => {
      await expect(repository.delete('non-existent'))
        .rejects.toThrow('Flow with id non-existent not found');
    });
  });

  describe('exists', () => {
    it('should return true for existing flow', async () => {
      const flowData: Prisma.FlowCreateInput = {
        name: 'Test Flow',
        version: 1,
        nodes: {}
      };

      const createdFlow = await repository.create(flowData);
      const exists = await repository.exists(createdFlow.id);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent flow', async () => {
      const exists = await repository.exists('non-existent');
      expect(exists).toBe(false);
    });
  });

  describe('findMany', () => {
    it('should return all flows when no options provided', async () => {
      const flow1 = await repository.create({ name: 'Flow 1', version: 1, nodes: {} });
      const flow2 = await repository.create({ name: 'Flow 2', version: 1, nodes: {} });

      const flows = await repository.findMany();

      expect(flows).toHaveLength(2);
      expect(flows.map(f => f.id)).toEqual([flow1.id, flow2.id]);
    });

    it('should apply pagination', async () => {
      await repository.create({ name: 'Flow 1', version: 1, nodes: {} });
      await repository.create({ name: 'Flow 2', version: 1, nodes: {} });
      await repository.create({ name: 'Flow 3', version: 1, nodes: {} });

      const flows = await repository.findMany({ skip: 1, take: 1 });

      expect(flows).toHaveLength(1);
    });

    it('should apply ordering', async () => {
      const flow1 = await repository.create({ name: 'Flow 1', version: 1, nodes: {} });
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const flow2 = await repository.create({ name: 'Flow 2', version: 1, nodes: {} });

      const flowsDesc = await repository.findMany({ orderBy: { createdAt: 'desc' } });
      expect(flowsDesc[0].id).toBe(flow2.id);
      expect(flowsDesc[1].id).toBe(flow1.id);
    });
  });
});