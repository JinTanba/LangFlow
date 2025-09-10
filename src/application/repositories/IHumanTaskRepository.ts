import { HumanTask, HumanTaskStatus, Prisma } from '../../generated';

export interface IHumanTaskRepository {
  create(data: Prisma.HumanTaskCreateInput): Promise<HumanTask>;
  findById(id: string): Promise<HumanTask | null>;
  findByToken(token: string): Promise<HumanTask | null>;
  findByFlowRunId(flowRunId: string): Promise<HumanTask[]>;
  findByStatus(status: HumanTaskStatus, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.HumanTaskOrderByWithRelationInput;
  }): Promise<HumanTask[]>;
  findExpiredTasks(currentTime?: Date): Promise<HumanTask[]>;
  findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.HumanTaskWhereInput;
    orderBy?: Prisma.HumanTaskOrderByWithRelationInput;
  }): Promise<HumanTask[]>;
  update(id: string, data: Prisma.HumanTaskUpdateInput): Promise<HumanTask>;
  updateStatus(id: string, status: HumanTaskStatus): Promise<HumanTask>;
  submitResult(id: string, result: any): Promise<HumanTask>;
  delete(id: string): Promise<HumanTask>;
  exists(id: string): Promise<boolean>;
  generateUniqueToken(): Promise<string>;
}