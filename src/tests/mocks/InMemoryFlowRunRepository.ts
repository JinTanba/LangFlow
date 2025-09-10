import { FlowRun, FlowRunStatus, Prisma } from '../../generated';
import { IFlowRunRepository } from '../../application/repositories/IFlowRunRepository';

export class InMemoryFlowRunRepository implements IFlowRunRepository {
  private flowRuns: Map<string, FlowRun> = new Map();
  private idCounter = 1;

  private generateId(): string {
    return (this.idCounter++).toString();
  }

  async create(data: Prisma.FlowRunCreateInput): Promise<FlowRun> {
    const id = this.generateId();
    const now = new Date();
    
    const flowRun: FlowRun = {
      id,
      flowId: typeof data.flow === 'string' ? data.flow : data.flow.connect!.id!,
      status: data.status || FlowRunStatus.queued,
      input: data.input as any,
      context: data.context as any,
      createdAt: now,
      updatedAt: now,
    };

    this.flowRuns.set(id, flowRun);
    return flowRun;
  }

  async findById(id: string): Promise<FlowRun | null> {
    return this.flowRuns.get(id) || null;
  }

  async findByFlowId(flowId: string, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.FlowRunOrderByWithRelationInput;
  }): Promise<FlowRun[]> {
    let results = Array.from(this.flowRuns.values())
      .filter(flowRun => flowRun.flowId === flowId);

    // Simple ordering
    if (options?.orderBy?.createdAt === 'desc') {
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    // Pagination
    if (options?.skip) {
      results = results.slice(options.skip);
    }
    if (options?.take) {
      results = results.slice(0, options.take);
    }

    return results;
  }

  async findByStatus(status: FlowRunStatus, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.FlowRunOrderByWithRelationInput;
  }): Promise<FlowRun[]> {
    let results = Array.from(this.flowRuns.values())
      .filter(flowRun => flowRun.status === status);

    // Simple ordering
    if (options?.orderBy?.updatedAt === 'desc') {
      results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } else {
      results.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    }

    // Pagination
    if (options?.skip) {
      results = results.slice(options.skip);
    }
    if (options?.take) {
      results = results.slice(0, options.take);
    }

    return results;
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.FlowRunWhereInput;
    orderBy?: Prisma.FlowRunOrderByWithRelationInput;
    include?: Prisma.FlowRunInclude;
  }): Promise<FlowRun[]> {
    let results = Array.from(this.flowRuns.values());

    // Simple filtering
    if (options?.where?.flowId) {
      results = results.filter(flowRun => 
        flowRun.flowId === options.where!.flowId
      );
    }
    if (options?.where?.status) {
      results = results.filter(flowRun => 
        flowRun.status === options.where!.status
      );
    }

    // Simple ordering
    if (options?.orderBy?.createdAt === 'desc') {
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    // Pagination
    if (options?.skip) {
      results = results.slice(options.skip);
    }
    if (options?.take) {
      results = results.slice(0, options.take);
    }

    return results;
  }

  async update(id: string, data: Prisma.FlowRunUpdateInput): Promise<FlowRun> {
    const flowRun = this.flowRuns.get(id);
    if (!flowRun) {
      throw new Error(`FlowRun with id ${id} not found`);
    }

    const updatedFlowRun: FlowRun = {
      ...flowRun,
      status: (data.status as FlowRunStatus) || flowRun.status,
      input: (data.input as any) || flowRun.input,
      context: (data.context as any) || flowRun.context,
      updatedAt: new Date(),
    };

    this.flowRuns.set(id, updatedFlowRun);
    return updatedFlowRun;
  }

  async updateContext(id: string, context: any): Promise<FlowRun> {
    return this.update(id, { context });
  }

  async updateStatus(id: string, status: FlowRunStatus): Promise<FlowRun> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<FlowRun> {
    const flowRun = this.flowRuns.get(id);
    if (!flowRun) {
      throw new Error(`FlowRun with id ${id} not found`);
    }
    
    this.flowRuns.delete(id);
    return flowRun;
  }

  async exists(id: string): Promise<boolean> {
    return this.flowRuns.has(id);
  }

  // Helper method for testing
  clear(): void {
    this.flowRuns.clear();
    this.idCounter = 1;
  }
}