import { HumanTask, HumanTaskStatus, Prisma } from '../../generated';
import { IHumanTaskRepository } from '../../application/repositories/IHumanTaskRepository';

export class InMemoryHumanTaskRepository implements IHumanTaskRepository {
  private humanTasks: Map<string, HumanTask> = new Map();
  private tokens: Set<string> = new Set();
  private idCounter = 1;

  private generateId(): string {
    return (this.idCounter++).toString();
  }

  async create(data: Prisma.HumanTaskCreateInput): Promise<HumanTask> {
    const id = this.generateId();
    const now = new Date();
    
    const humanTask: HumanTask = {
      id,
      flowRunId: typeof data.flowRun === 'string' ? data.flowRun : data.flowRun.connect!.id!,
      nodeKey: data.nodeKey,
      status: data.status || HumanTaskStatus.pending,
      message: data.message || null,
      fields: (data.fields as any) || null,
      prefill: (data.prefill as any) || null,
      result: (data.result as any) || null,
      assignees: (data.assignees as string[]) || [],
      blocking: data.blocking ?? true,
      token: data.token,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      createdAt: now,
      updatedAt: now,
    };

    this.humanTasks.set(id, humanTask);
    this.tokens.add(humanTask.token);
    return humanTask;
  }

  async findById(id: string): Promise<HumanTask | null> {
    return this.humanTasks.get(id) || null;
  }

  async findByToken(token: string): Promise<HumanTask | null> {
    for (const task of this.humanTasks.values()) {
      if (task.token === token) {
        return task;
      }
    }
    return null;
  }

  async findByFlowRunId(flowRunId: string): Promise<HumanTask[]> {
    return Array.from(this.humanTasks.values())
      .filter(task => task.flowRunId === flowRunId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByStatus(status: HumanTaskStatus, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.HumanTaskOrderByWithRelationInput;
  }): Promise<HumanTask[]> {
    let results = Array.from(this.humanTasks.values())
      .filter(task => task.status === status);

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

  async findExpiredTasks(currentTime: Date = new Date()): Promise<HumanTask[]> {
    return Array.from(this.humanTasks.values())
      .filter(task => 
        task.status === HumanTaskStatus.pending && 
        task.expiresAt && 
        task.expiresAt <= currentTime
      );
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.HumanTaskWhereInput;
    orderBy?: Prisma.HumanTaskOrderByWithRelationInput;
  }): Promise<HumanTask[]> {
    let results = Array.from(this.humanTasks.values());

    // Simple filtering
    if (options?.where?.flowRunId) {
      results = results.filter(task => 
        task.flowRunId === options.where!.flowRunId
      );
    }
    if (options?.where?.status) {
      results = results.filter(task => 
        task.status === options.where!.status
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

  async update(id: string, data: Prisma.HumanTaskUpdateInput): Promise<HumanTask> {
    const task = this.humanTasks.get(id);
    if (!task) {
      throw new Error(`HumanTask with id ${id} not found`);
    }

    const updatedTask: HumanTask = {
      ...task,
      status: (data.status as HumanTaskStatus) || task.status,
      message: (data.message as string) || task.message,
      fields: (data.fields as any) || task.fields,
      prefill: (data.prefill as any) || task.prefill,
      result: (data.result as any) || task.result,
      assignees: (data.assignees as string[]) || task.assignees,
      blocking: (data.blocking as boolean) ?? task.blocking,
      expiresAt: data.expiresAt ? new Date(data.expiresAt as any) : task.expiresAt,
      updatedAt: new Date(),
    };

    this.humanTasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateStatus(id: string, status: HumanTaskStatus): Promise<HumanTask> {
    return this.update(id, { status });
  }

  async submitResult(id: string, result: any): Promise<HumanTask> {
    return this.update(id, { 
      status: HumanTaskStatus.submitted, 
      result 
    });
  }

  async delete(id: string): Promise<HumanTask> {
    const task = this.humanTasks.get(id);
    if (!task) {
      throw new Error(`HumanTask with id ${id} not found`);
    }
    
    this.humanTasks.delete(id);
    this.tokens.delete(task.token);
    return task;
  }

  async exists(id: string): Promise<boolean> {
    return this.humanTasks.has(id);
  }

  async generateUniqueToken(): Promise<string> {
    let token: string;
    do {
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    } while (this.tokens.has(token));
    
    return token;
  }

  // Helper method for testing
  clear(): void {
    this.humanTasks.clear();
    this.tokens.clear();
    this.idCounter = 1;
  }
}