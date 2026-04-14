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

function MetricBadge({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-zinc-500 mb-0.5">{label}</span>
      <span className={clsx('text-sm tabular-nums font-medium', highlight ? 'text-emerald-400' : 'text-zinc-200')}>
        {value}
      </span>
    </div>
  );
}

function ResultCard({ result, bestTps, bestLatency, leastTokens }: {
  result: CompareResult;
  bestTps: number;
  bestLatency: number;
  leastTokens: number;
}) {
  const [expanded, setExpanded] = useState(true);

  if (result.error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-sm text-zinc-200">{result.model}</span>
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">error</span>
        </div>
        <p className="text-xs text-red-400">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/60 bg-zinc-900/40">
        <span className="font-mono text-sm font-medium text-zinc-100">{result.model}</span>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {expanded ? 'hide' : 'show'}
        </button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-5 gap-px bg-zinc-700/40 border-b border-zinc-700/60">
        {[
          { label: 'Tok/sec',    value: `${(result.tokensPerSec ?? 0).toFixed(1)}`, highlight: result.tokensPerSec === bestTps },
          { label: 'Latency',   value: `${result.totalMs}ms`,                       highlight: result.totalMs === bestLatency },
          { label: 'In / Out',  value: `${result.inputTokens} / ${result.outputTokens}` },
          { label: 'Total tok', value: String(result.totalTokens),                  highlight: result.totalTokens === leastTokens },
          { label: 'Est. cost', value: `$${(result.estimatedCostUsd ?? 0).toFixed(5)}` },
        ].map((m) => (
          <div key={m.label} className="bg-zinc-900/60 px-3 py-2.5 flex flex-col items-center">
            <span className="text-xs text-zinc-500 mb-0.5">{m.label}</span>
            <span className={clsx('text-sm tabular-nums font-medium', m.highlight ? 'text-emerald-400' : 'text-zinc-200')}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Response */}
      {expanded && result.response && (
        <div className="px-4 py-3 max-h-52 overflow-y-auto">
          <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{result.response}</p>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-zinc-700/60 bg-zinc-900/40">
        <div className="h-4 w-32 bg-zinc-700 rounded" />
      </div>
      <div className="grid grid-cols-5 gap-px bg-zinc-700/40 border-b border-zinc-700/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-zinc-900/60 px-3 py-2.5 flex flex-col items-center gap-1">
            <div className="h-2.5 w-10 bg-zinc-700 rounded" />
            <div className="h-4 w-8 bg-zinc-700 rounded" />
          </div>
        ))}
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="h-3 bg-zinc-700 rounded w-full" />
        <div className="h-3 bg-zinc-700 rounded w-4/5" />
        <div className="h-3 bg-zinc-700 rounded w-3/5" />
      </div>
    </div>
  );
}

export function ComparisonTable({ models, prompt, systemPrompt }: Props) {
  const [results, setResults]   = useState<CompareResult[] | null>(null);
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState<string | null>(null);

  const run = async () => {
    if (models.length < 2 || !prompt) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setProgress(0);

    // Fake per-model progress ticks while the sequential backend runs
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setProgress(Math.min(tick, models.length - 1));
    }, 3000);

    try {
      const data = await api.compare({ models, prompt, systemPrompt });
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compare failed');
    } finally {
      clearInterval(interval);
      setProgress(models.length);
      setLoading(false);
    }
  };

  const valid = results?.filter((r): r is CompareResult & { tokensPerSec: number; totalMs: number; totalTokens: number } => !r.error);
  const bestTps      = valid?.length ? Math.max(...valid.map((r) => r.tokensPerSec ?? 0)) : 0;
  const bestLatency  = valid?.length ? Math.min(...valid.map((r) => r.totalMs ?? Infinity)) : Infinity;
  const leastTokens  = valid?.length ? Math.min(...valid.map((r) => r.totalTokens ?? Infinity)) : Infinity;

  const canRun = models.length >= 2 && !!prompt;

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-zinc-300">
            Model Comparison
            <span className="ml-2 text-zinc-500 font-normal">{models.length} / 4 selected</span>
          </h3>
          {loading && (
            <p className="text-xs text-zinc-500">
              Running {models[Math.min(progress, models.length - 1)]}… ({progress + 1} of {models.length})
            </p>
          )}
        </div>
        <button
          onClick={run}
          disabled={loading || !canRun}
          className={clsx(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            loading || !canRun
              ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white',
          )}
        >
          {loading ? 'Running…' : 'Compare'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {!results && !loading && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-800/40 px-4 py-10 text-center">
          <p className="text-sm text-zinc-500">
            {!canRun
              ? 'Select at least 2 models and enter a prompt to compare.'
              : 'Click Compare to run the prompt across all selected models.'}
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {models.map((m, i) => (
            i < progress + 1
              ? <SkeletonCard key={m} />
              : (
                <div key={m} className="rounded-xl border border-zinc-700/40 bg-zinc-800/20 px-4 py-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" />
                  <span className="text-sm font-mono text-zinc-600">{m}</span>
                  <span className="text-xs text-zinc-700 ml-auto">queued</span>
                </div>
              )
          ))}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-3">
          {results.map((r) => (
            <ResultCard
              key={r.model}
              result={r}
              bestTps={bestTps}
              bestLatency={bestLatency}
              leastTokens={leastTokens}
            />
          ))}
        </div>
      )}
    </div>
  );
}
