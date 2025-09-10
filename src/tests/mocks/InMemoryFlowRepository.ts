import { Flow, Prisma } from '../../generated';
import { IFlowRepository } from '../../application/repositories/IFlowRepository';

export class InMemoryFlowRepository implements IFlowRepository {
  private flows: Map<string, Flow> = new Map();
  private idCounter = 1;

  private generateId(): string {
    return (this.idCounter++).toString();
  }

  async create(data: Prisma.FlowCreateInput): Promise<Flow> {
    const id = this.generateId();
    const now = new Date();
    
    const flow: Flow = {
      id,
      name: data.name,
      version: data.version,
      nodes: data.nodes as any,
      createdAt: now,
      updatedAt: now,
    };

    this.flows.set(id, flow);
    return flow;
  }

  async findById(id: string): Promise<Flow | null> {
    return this.flows.get(id) || null;
  }

  async findByNameAndVersion(name: string, version: number): Promise<Flow | null> {
    for (const flow of this.flows.values()) {
      if (flow.name === name && flow.version === version) {
        return flow;
      }
    }
    return null;
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.FlowWhereInput;
    orderBy?: Prisma.FlowOrderByWithRelationInput;
  }): Promise<Flow[]> {
    let results = Array.from(this.flows.values());

    // Simple filtering (extend as needed)
    if (options?.where?.name) {
      results = results.filter(flow => 
        typeof options.where!.name === 'string' 
          ? flow.name === options.where!.name
          : true
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

  async update(id: string, data: Prisma.FlowUpdateInput): Promise<Flow> {
    const flow = this.flows.get(id);
    if (!flow) {
      throw new Error(`Flow with id ${id} not found`);
    }

    const updatedFlow: Flow = {
      ...flow,
      name: typeof data.name === 'string' ? data.name : flow.name,
      version: typeof data.version === 'number' ? data.version : flow.version,
      nodes: (data.nodes as any) || flow.nodes,
      updatedAt: new Date(),
    };

    this.flows.set(id, updatedFlow);
    return updatedFlow;
  }

  async delete(id: string): Promise<Flow> {
    const flow = this.flows.get(id);
    if (!flow) {
      throw new Error(`Flow with id ${id} not found`);
    }
    
    this.flows.delete(id);
    return flow;
  }

  async exists(id: string): Promise<boolean> {
    return this.flows.has(id);
  }

  // Helper method for testing
  clear(): void {
    this.flows.clear();
    this.idCounter = 1;
  }
}