import { Flow, FlowRun } from '../../generated';

export interface ReadyNodeInfo {
  key: string;
  kind: 'program' | 'ai' | 'human';
  input_schema: Record<string, any>;
}

export interface LLMDecisionContext {
  flow: {
    name: string;
    version: number;
  };
  ready_nodes: ReadyNodeInfo[];
  context: {
    input: Record<string, any>;
    vars: Record<string, any>;
    completed: Array<{
      key: string;
      output: Record<string, any>;
    }>;
  };
  last?: {
    key: string;
    output: Record<string, any>;
  };
}

export interface NodeExecutionInput {
  nodeKey: string;
  input: Record<string, any>;
  human?: {
    message?: string;
    fields?: Array<{
      name: string;
      type: string;
      options?: string[];
      required?: boolean;
    }>;
  };
}

export interface LLMDecisionResult {
  mode: 'next' | 'parallel' | 'stop';
  next: NodeExecutionInput[];
  skips?: string[];
  reason?: string;
}

export interface IEdgeLLMClient {
  makeDecision(context: LLMDecisionContext): Promise<LLMDecisionResult>;
}