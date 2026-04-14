export type DashboardMode = 'single' | 'compare' | 'abtest';

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  systemPrompt?: string;
  createdAt: string;
}


export interface ModelParams {
  temperature?: number;
  topP?: number;
  topK?: number;
  numPredict?: number;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details: {
    parameter_size: string;
    quantization_level: string;
  };
}

// SSE event payloads from backend
export interface TokenEvent {
  type: 'token';
  token: string;
  index: number;
}

export interface LiveMetricsEvent {
  type: 'metrics';
  ttft: number | null;
  outputTokens: number;
  tokensPerSec: number;
  elapsedMs: number;
}

export interface DoneEvent {
  type: 'done';
  ttft: number;
  totalMs: number;
  inputTokens: number;
  outputTokens: number;
  tokensPerSec: number;
  contextWindow: number;
  contextUsagePct: number;
  estimatedCostUsd: number;
  response: string;
}

export interface ErrorEvent {
  type: 'error';
  message: string;
}

export type SseEvent = TokenEvent | LiveMetricsEvent | DoneEvent | ErrorEvent;

// Final metrics after a stream completes
export interface FinalMetrics {
  ttft: number;
  totalMs: number;
  inputTokens: number;
  outputTokens: number;
  tokensPerSec: number;
  contextWindow: number;
  contextUsagePct: number;
  estimatedCostUsd: number;
}

export interface LiveMetrics {
  ttft: number | null;
  outputTokens: number;
  tokensPerSec: number;
  elapsedMs: number;
}

export type StreamStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export interface StreamState {
  status: StreamStatus;
  output: string;
  live: LiveMetrics | null;
  final: FinalMetrics | null;
  error: string | null;
}

// Hardware
export interface HardwareSnapshot {
  cpu: { usagePct: number; cores: number; speed: number; model: string };
  memory: { totalGb: number; usedGb: number; freeGb: number; usagePct: number };
  gpu: {
    available: boolean;
    model: string;
    vramTotalMb: number;
    vramUsedMb: number;
    usagePct: number;
  } | null;
  ollamaRunningOnGpu: boolean;
}

// Compare
export interface CompareResult {
  model: string;
  response?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  totalMs?: number;
  loadMs?: number;
  inferenceMs?: number;
  tokensPerSec?: number;
  contextWindow?: number;
  contextUsagePct?: number;
  estimatedCostUsd?: number;
  error?: string;
}

// A/B test
export interface AbSide {
  label: string;
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalMs: number;
  tokensPerSec: number;
  contextUsagePct: number;
  estimatedCostUsd: number;
}

export interface AbResult {
  a: AbSide;
  b: AbSide;
}

// Request history
export interface RequestLog {
  id: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  ttft: number;
  totalTime: number;
  tokensPerSec: number;
  contextUsagePct: number;
  estimatedCostUsd: number;
  createdAt: string;
}

export interface LogsResponse {
  items: RequestLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LogStats {
  totalRequests: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  avgTokensPerSec: number;
}
