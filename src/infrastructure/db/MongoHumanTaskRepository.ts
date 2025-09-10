import { PrismaClient, HumanTask, HumanTaskStatus, Prisma } from '../../generated';
import { IHumanTaskRepository } from '../../application/repositories/IHumanTaskRepository';
import { randomBytes } from 'crypto';

export class MongoHumanTaskRepository implements IHumanTaskRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.HumanTaskCreateInput): Promise<HumanTask> {
    return await this.prisma.humanTask.create({
      data,
    });
  }

  async findById(id: string): Promise<HumanTask | null> {
    return await this.prisma.humanTask.findUnique({
      where: { id },
    });
  }

  async findByToken(token: string): Promise<HumanTask | null> {
    return await this.prisma.humanTask.findUnique({
      where: { token },
    });
  }

  async findByFlowRunId(flowRunId: string): Promise<HumanTask[]> {
    return await this.prisma.humanTask.findMany({
      where: { flowRunId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: HumanTaskStatus, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.HumanTaskOrderByWithRelationInput;
  }): Promise<HumanTask[]> {
    return await this.prisma.humanTask.findMany({
      where: { status },
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  async findExpiredTasks(currentTime: Date = new Date()): Promise<HumanTask[]> {
    return await this.prisma.humanTask.findMany({
      where: {
        status: 'pending',
        expiresAt: {
          lte: currentTime,
        },
      },
    });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.HumanTaskWhereInput;
    orderBy?: Prisma.HumanTaskOrderByWithRelationInput;
  }): Promise<HumanTask[]> {
    return await this.prisma.humanTask.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.HumanTaskUpdateInput): Promise<HumanTask> {
    return await this.prisma.humanTask.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: HumanTaskStatus): Promise<HumanTask> {
    return await this.prisma.humanTask.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  async submitResult(id: string, result: any): Promise<HumanTask> {
    return await this.prisma.humanTask.update({
      where: { id },
      data: {
        status: 'submitted',
        result,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<HumanTask> {
    return await this.prisma.humanTask.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.humanTask.count({
      where: { id },
    });
    return count > 0;
  }

  async generateUniqueToken(): Promise<string> {
    let token: string;
    let exists: boolean;
    
    do {
      token = randomBytes(32).toString('hex');
      const existingTask = await this.prisma.humanTask.findUnique({
        where: { token },
      });
      exists = !!existingTask;
    } while (exists);
    
    return token;
  }
}