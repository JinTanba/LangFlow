import { IFlowRunRepository } from '../../repositories/IFlowRunRepository';
import { FlowRun } from '../../../generated';

export interface GetRunStatusInput {
  runId: string;
}

export interface GetRunStatusOutput {
  id: string;
  flowId: string;
  status: string;
  input: any;
  context: any;
  createdAt: Date;
  updatedAt: Date;
}

export class GetRunStatusUseCase {
  constructor(
    private flowRunRepository: IFlowRunRepository
  ) {}

  async execute(input: GetRunStatusInput): Promise<GetRunStatusOutput> {
    const flowRun = await this.flowRunRepository.findById(input.runId);
    
    if (!flowRun) {
      throw new Error('Flow run not found');
    }

    return {
      id: flowRun.id,
      flowId: flowRun.flowId,
      status: flowRun.status,
      input: flowRun.input,
      context: flowRun.context,
      createdAt: flowRun.createdAt,
      updatedAt: flowRun.updatedAt
    };
  }
}