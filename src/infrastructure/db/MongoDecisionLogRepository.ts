import { PrismaClient, DecisionLog, Prisma } from '../../generated';
import { IDecisionLogRepository } from '../../application/repositories/IDecisionLogRepository';

export class MongoDecisionLogRepository implements IDecisionLogRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.DecisionLogCreateInput): Promise<DecisionLog> {
    return await this.prisma.decisionLog.create({
      data,
    });
  }

  async findById(id: string): Promise<DecisionLog | null> {
    return await this.prisma.decisionLog.findUnique({
      where: { id },
    });
  }

  async findByFlowRunId(flowRunId: string, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.DecisionLogOrderByWithRelationInput;
  }): Promise<DecisionLog[]> {
    return await this.prisma.decisionLog.findMany({
      where: { flowRunId },
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'asc' },
    });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.DecisionLogWhereInput;
    orderBy?: Prisma.DecisionLogOrderByWithRelationInput;
  }): Promise<DecisionLog[]> {
    return await this.prisma.decisionLog.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  async delete(id: string): Promise<DecisionLog> {
    return await this.prisma.decisionLog.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.decisionLog.count({
      where: { id },
    });
    return count > 0;
  }
}