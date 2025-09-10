import { FlowRun, FlowRunStatus, Prisma } from '../../generated';

export interface IFlowRunRepository {
  create(data: Prisma.FlowRunCreateInput): Promise<FlowRun>;
  findById(id: string): Promise<FlowRun | null>;
  findByFlowId(flowId: string, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.FlowRunOrderByWithRelationInput;
  }): Promise<FlowRun[]>;
  findByStatus(status: FlowRunStatus, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.FlowRunOrderByWithRelationInput;
  }): Promise<FlowRun[]>;
  findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.FlowRunWhereInput;
    orderBy?: Prisma.FlowRunOrderByWithRelationInput;
    include?: Prisma.FlowRunInclude;
  }): Promise<FlowRun[]>;
  update(id: string, data: Prisma.FlowRunUpdateInput): Promise<FlowRun>;
  updateContext(id: string, context: any): Promise<FlowRun>;
  updateStatus(id: string, status: FlowRunStatus): Promise<FlowRun>;
  delete(id: string): Promise<FlowRun>;
  exists(id: string): Promise<boolean>;
}