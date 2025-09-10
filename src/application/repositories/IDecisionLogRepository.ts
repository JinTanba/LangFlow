import { DecisionLog, Prisma } from '../../generated';

export interface IDecisionLogRepository {
  create(data: Prisma.DecisionLogCreateInput): Promise<DecisionLog>;
  findById(id: string): Promise<DecisionLog | null>;
  findByFlowRunId(flowRunId: string, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.DecisionLogOrderByWithRelationInput;
  }): Promise<DecisionLog[]>;
  findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.DecisionLogWhereInput;
    orderBy?: Prisma.DecisionLogOrderByWithRelationInput;
  }): Promise<DecisionLog[]>;
  delete(id: string): Promise<DecisionLog>;
  exists(id: string): Promise<boolean>;
}