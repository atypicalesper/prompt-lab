'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import type { CompareResult } from '@/types';

interface Props {
  models: string[];
  prompt: string;
  systemPrompt?: string;
}

function Cell({ value, best = false }: { value: string; best?: boolean }) {
  return (
    <td className={clsx(
      'px-3 py-2.5 text-sm tabular-nums text-center',
      best ? 'text-emerald-400 font-bold' : 'text-zinc-300',
    )}>
      {value}
    </td>
  );
}

export function ComparisonTable({ models, prompt, systemPrompt }: Props) {
  const [results, setResults] = useState<CompareResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const run = async () => {
    if (models.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.compare({ models, prompt, systemPrompt });
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compare failed');
    } finally {
      setLoading(false);
    }
  };

  const valid = results?.filter((r): r is CompareResult & { tokensPerSec: number } => !r.error);

  const bestTps     = valid ? Math.max(...valid.map((r) => r.tokensPerSec ?? 0)) : 0;
  const bestLatency = valid ? Math.min(...valid.map((r) => r.totalMs ?? Infinity)) : Infinity;
  const leastTokens = valid ? Math.min(...valid.map((r) => r.totalTokens ?? Infinity)) : Infinity;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <h3 className="text-sm font-medium text-zinc-300">
          Model Comparison ({models.length} models)
        </h3>
        <button
          onClick={run}
          disabled={loading || models.length < 2 || !prompt}
          className={clsx(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            loading || models.length < 2 || !prompt
              ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white',
          )}
        >
          {loading ? 'Running…' : 'Compare'}
        </button>
      </div>

      {error && (
        <p className="px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      {results && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/50">
                {['Model', 'Input tok', 'Output tok', 'Total tok', 'Latency', 'Tok/sec', 'Context %', 'Est. cost'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-xs font-medium text-zinc-400 text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.model} className="border-b border-zinc-700/50 hover:bg-zinc-700/20">
                  <td className="px-3 py-2.5 text-sm font-mono text-zinc-200">
                    {r.model}
                    {r.error && <span className="ml-2 text-xs text-red-400">({r.error})</span>}
                  </td>
                  {r.error ? (
                    <td colSpan={7} className="px-3 py-2.5 text-sm text-red-400">
                      Failed: {r.error}
                    </td>
                  ) : (
                    <>
                      <Cell value={String(r.inputTokens ?? '—')} />
                      <Cell value={String(r.outputTokens ?? '—')} />
                      <Cell value={String(r.totalTokens ?? '—')} best={r.totalTokens === leastTokens} />
                      <Cell value={`${r.totalMs ?? '—'}ms`} best={r.totalMs === bestLatency} />
                      <Cell value={`${(r.tokensPerSec ?? 0).toFixed(1)}`} best={r.tokensPerSec === bestTps} />
                      <Cell value={`${(r.contextUsagePct ?? 0).toFixed(1)}%`} />
                      <Cell value={`$${(r.estimatedCostUsd ?? 0).toFixed(6)}`} />
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!results && !loading && (
        <p className="px-4 py-6 text-sm text-zinc-500 text-center">
          Select at least 2 models and enter a prompt, then click Compare.
        </p>
      )}
    </div>
  );
}
