import { PrismaClient, Flow, Prisma } from '../../generated';
import { IFlowRepository } from '../../application/repositories/IFlowRepository';

export class MongoFlowRepository implements IFlowRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.FlowCreateInput): Promise<Flow> {
    return await this.prisma.flow.create({
      data,
    });
  }

  async findById(id: string): Promise<Flow | null> {
    return await this.prisma.flow.findUnique({
      where: { id },
    });
  }

  async findByNameAndVersion(name: string, version: number): Promise<Flow | null> {
    return await this.prisma.flow.findFirst({
      where: {
        name,
        version,
      },
    });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.FlowWhereInput;
    orderBy?: Prisma.FlowOrderByWithRelationInput;
  }): Promise<Flow[]> {
    return await this.prisma.flow.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.FlowUpdateInput): Promise<Flow> {
    return await this.prisma.flow.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Flow> {
    return await this.prisma.flow.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.flow.count({
      where: { id },
    });
    return count > 0;
  }
}