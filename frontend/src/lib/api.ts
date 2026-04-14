import type {
  OllamaModel,
  CompareResult,
  AbResult,
  LogsResponse,
  LogStats,
  ModelParams,
  PromptTemplate,
} from '@/types';

const BASE = '/api';
// EventSource goes directly to the backend — the Next.js dev proxy buffers
// chunked responses and breaks real-time SSE streaming.
const SSE_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`${res.status}`);
}

export const api = {
  models: {
    list: () => get<OllamaModel[]>('/llm/models'),
  },

  stream: {
    // Step 1: reserve session
    init: (body: { model: string; prompt: string; systemPrompt?: string } & ModelParams) =>
      post<{ sessionId: string }>('/llm/stream/init', body),
    // Step 2: SSE URL — bypasses Next.js proxy to avoid response buffering
    url: (sessionId: string) => `${SSE_BASE}/llm/stream/${sessionId}`,
  },

  compare: (body: { models: string[]; prompt: string; systemPrompt?: string }) =>
    post<CompareResult[]>('/llm/compare', body),

  abTest: (body: { model: string; promptA: string; promptB: string; systemPrompt?: string }) =>
    post<AbResult>('/llm/ab-test', body),

  logs: {
    list: (page = 1, limit = 20) =>
      get<LogsResponse>(`/logs?page=${page}&limit=${limit}`),
    stats: () => get<LogStats>('/logs/stats'),
    clear: () => del('/logs'),
  },

  hardware: () => get<import('@/types').HardwareSnapshot>('/hardware'),

  templates: {
    list: () => get<PromptTemplate[]>('/templates'),
    create: (body: { name: string; prompt: string; systemPrompt?: string }) =>
      post<PromptTemplate>('/templates', body),
    remove: (id: string) => del(`/templates/${id}`),
  },
};
