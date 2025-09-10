import { NodeRun, NodeRunStatus, Prisma } from '../../generated';

export interface INodeRunRepository {
  create(data: Prisma.NodeRunCreateInput): Promise<NodeRun>;
  findById(id: string): Promise<NodeRun | null>;
  findByFlowRunId(flowRunId: string): Promise<NodeRun[]>;
  findByFlowRunIdAndNodeKey(flowRunId: string, nodeKey: string): Promise<NodeRun | null>;
  findByStatus(status: NodeRunStatus, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.NodeRunOrderByWithRelationInput;
  }): Promise<NodeRun[]>;
  findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.NodeRunWhereInput;
    orderBy?: Prisma.NodeRunOrderByWithRelationInput;
  }): Promise<NodeRun[]>;
  update(id: string, data: Prisma.NodeRunUpdateInput): Promise<NodeRun>;
  updateStatus(id: string, status: NodeRunStatus): Promise<NodeRun>;
  markCompleted(id: string, output?: any): Promise<NodeRun>;
  markFailed(id: string, error: any): Promise<NodeRun>;
  delete(id: string): Promise<NodeRun>;
  exists(id: string): Promise<boolean>;
}