import { PrismaClient, FlowRun, FlowRunStatus, Prisma } from '../../generated';
import { IFlowRunRepository } from '../../application/repositories/IFlowRunRepository';

export class MongoFlowRunRepository implements IFlowRunRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.FlowRunCreateInput): Promise<FlowRun> {
    return await this.prisma.flowRun.create({
      data,
    });
  }

  async findById(id: string): Promise<FlowRun | null> {
    return await this.prisma.flowRun.findUnique({
      where: { id },
      include: {
        flow: true,
        nodeRuns: true,
        humanTasks: true,
        decisionLogs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByFlowId(flowId: string, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.FlowRunOrderByWithRelationInput;
  }): Promise<FlowRun[]> {
    return await this.prisma.flowRun.findMany({
      where: { flowId },
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
      include: {
        flow: true,
      },
    });
  }

  async findByStatus(status: FlowRunStatus, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.FlowRunOrderByWithRelationInput;
  }): Promise<FlowRun[]> {
    return await this.prisma.flowRun.findMany({
      where: { status },
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { updatedAt: 'desc' },
      include: {
        flow: true,
      },
    });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.FlowRunWhereInput;
    orderBy?: Prisma.FlowRunOrderByWithRelationInput;
    include?: Prisma.FlowRunInclude;
  }): Promise<FlowRun[]> {
    return await this.prisma.flowRun.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
      include: options?.include || {
        flow: true,
      },
    });
  }

  async update(id: string, data: Prisma.FlowRunUpdateInput): Promise<FlowRun> {
    return await this.prisma.flowRun.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateContext(id: string, context: any): Promise<FlowRun> {
    return await this.prisma.flowRun.update({
      where: { id },
      data: {
        context,
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: FlowRunStatus): Promise<FlowRun> {
    return await this.prisma.flowRun.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<FlowRun> {
    return await this.prisma.flowRun.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.flowRun.count({
      where: { id },
    });
    return count > 0;
  }
}