import { PrismaClient, NodeRun, NodeRunStatus, Prisma } from '../../generated';
import { INodeRunRepository } from '../../application/repositories/INodeRunRepository';

export class MongoNodeRunRepository implements INodeRunRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.NodeRunCreateInput): Promise<NodeRun> {
    return await this.prisma.nodeRun.create({
      data,
    });
  }

  async findById(id: string): Promise<NodeRun | null> {
    return await this.prisma.nodeRun.findUnique({
      where: { id },
    });
  }

  async findByFlowRunId(flowRunId: string): Promise<NodeRun[]> {
    return await this.prisma.nodeRun.findMany({
      where: { flowRunId },
      orderBy: { startedAt: 'asc' },
    });
  }

  async findByFlowRunIdAndNodeKey(flowRunId: string, nodeKey: string): Promise<NodeRun | null> {
    return await this.prisma.nodeRun.findFirst({
      where: {
        flowRunId,
        nodeKey,
      },
    });
  }

  async findByStatus(status: NodeRunStatus, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.NodeRunOrderByWithRelationInput;
  }): Promise<NodeRun[]> {
    return await this.prisma.nodeRun.findMany({
      where: { status },
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { startedAt: 'desc' },
    });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.NodeRunWhereInput;
    orderBy?: Prisma.NodeRunOrderByWithRelationInput;
  }): Promise<NodeRun[]> {
    return await this.prisma.nodeRun.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy || { startedAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.NodeRunUpdateInput): Promise<NodeRun> {
    return await this.prisma.nodeRun.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: NodeRunStatus): Promise<NodeRun> {
    return await this.prisma.nodeRun.update({
      where: { id },
      data: {
        status,
        finishedAt: status === 'ok' || status === 'error' || status === 'skipped' 
          ? new Date() 
          : undefined,
      },
    });
  }

  async markCompleted(id: string, output?: any): Promise<NodeRun> {
    return await this.prisma.nodeRun.update({
      where: { id },
      data: {
        status: 'ok',
        output,
        finishedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, error: any): Promise<NodeRun> {
    return await this.prisma.nodeRun.update({
      where: { id },
      data: {
        status: 'error',
        error,
        finishedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<NodeRun> {
    return await this.prisma.nodeRun.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.nodeRun.count({
      where: { id },
    });
    return count > 0;
  }
}