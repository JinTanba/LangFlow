import { Flow, Prisma } from '../../generated';

export interface IFlowRepository {
  create(data: Prisma.FlowCreateInput): Promise<Flow>;
  findById(id: string): Promise<Flow | null>;
  findByNameAndVersion(name: string, version: number): Promise<Flow | null>;
  findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.FlowWhereInput;
    orderBy?: Prisma.FlowOrderByWithRelationInput;
  }): Promise<Flow[]>;
  update(id: string, data: Prisma.FlowUpdateInput): Promise<Flow>;
  delete(id: string): Promise<Flow>;
  exists(id: string): Promise<boolean>;
}