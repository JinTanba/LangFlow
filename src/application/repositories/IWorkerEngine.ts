import { NodeType } from '../../generated';

export interface NodeExecutionRequest {
  flowRunId: string;
  nodeKey: string;
  nodeType: NodeType;
  input: Record<string, any>;
  nodeConfig: any; // endpoint/model/ui_hint depending on nodeType
}

export interface NodeExecutionResult {
  nodeKey: string;
  status: 'ok' | 'error' | 'waiting_human';
  output?: Record<string, any>;
  error?: Record<string, any>;
  humanTaskId?: string; // Set when status is 'waiting_human'
}

export interface IWorkerEngine {
  executeNode(request: NodeExecutionRequest): Promise<NodeExecutionResult>;
  executeNodes(requests: NodeExecutionRequest[]): Promise<NodeExecutionResult[]>;
}