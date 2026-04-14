'use client';

import { useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import type {
  StreamState,
  StreamStatus,
  LiveMetrics,
  FinalMetrics,
  SseEvent,
  ModelParams,
} from '@/types';

const INITIAL_STATE: StreamState = {
  status: 'idle',
  output: '',
  live: null,
  final: null,
  error: null,
};

interface RunParams extends ModelParams {
  model: string;
  prompt: string;
  systemPrompt?: string;
}

export function useStream() {
  const [state, setState] = useState<StreamState>(INITIAL_STATE);
  const esRef = useRef<EventSource | null>(null);

  const stop = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    setState((prev) => ({
      ...prev,
      status: prev.status === 'streaming' ? 'done' : prev.status,
    }));
  }, []);

  const reset = useCallback(() => {
    stop();
    setState(INITIAL_STATE);
  }, [stop]);

  const run = useCallback(
    async (params: RunParams) => {
      esRef.current?.close();
      setState({ status: 'loading', output: '', live: null, final: null, error: null });

      let sessionId: string;
      try {
        const res = await api.stream.init(params);
        sessionId = res.sessionId;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to initialise stream',
        }));
        return;
      }

      setState((prev) => ({ ...prev, status: 'streaming' }));

      const es = new EventSource(api.stream.url(sessionId));
      esRef.current = es;

      es.addEventListener('token', (e: MessageEvent<string>) => {
        const data = JSON.parse(e.data) as SseEvent;
        if (data.type !== 'token') return;
        setState((prev) => ({ ...prev, output: prev.output + data.token }));
      });

      es.addEventListener('metrics', (e: MessageEvent<string>) => {
        const data = JSON.parse(e.data) as SseEvent;
        if (data.type !== 'metrics') return;
        setState((prev) => ({
          ...prev,
          live: {
            ttft:        data.ttft,
            outputTokens: data.outputTokens,
            tokensPerSec: data.tokensPerSec,
            elapsedMs:   data.elapsedMs,
          } satisfies LiveMetrics,
        }));
      });

      es.addEventListener('done', (e: MessageEvent<string>) => {
        const data = JSON.parse(e.data) as SseEvent;
        if (data.type !== 'done') return;
        const final: FinalMetrics = {
          ttft:             data.ttft,
          totalMs:          data.totalMs,
          inputTokens:      data.inputTokens,
          outputTokens:     data.outputTokens,
          tokensPerSec:     data.tokensPerSec,
          contextWindow:    data.contextWindow,
          contextUsagePct:  data.contextUsagePct,
          estimatedCostUsd: data.estimatedCostUsd,
        };
        setState((prev) => ({ ...prev, status: 'done', final }));
        es.close();
        esRef.current = null;
      });

      // Named 'error' events are application-level errors emitted by the server
      es.addEventListener('error', (e: MessageEvent<string>) => {
        if (e.data) {
          try {
            const data = JSON.parse(e.data) as SseEvent;
            if (data.type === 'error') {
              setState((prev) => ({ ...prev, status: 'error', error: data.message }));
            }
          } catch {
            setState((prev) => ({ ...prev, status: 'error', error: 'Stream error' }));
          }
        }
        es.close();
        esRef.current = null;
      });

      // onerror fires for connection-level failures (network drop, server restart, etc.)
      // The event is a plain Event with no .data — handle separately
      es.onerror = () => {
        setState((prev) =>
          prev.status === 'done' ? prev : { ...prev, status: 'error', error: 'Stream connection lost' },
        );
        es.close();
        esRef.current = null;
      };
    },
    [],
  );

  return { ...state, run, stop, reset };
}
