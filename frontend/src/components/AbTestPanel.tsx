'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import type { AbResult } from '@/types';

interface Props {
  model: string;
  systemPrompt?: string;
}

function SideCard({ side, phase }: { side: AbResult['a']; phase?: 'running' | 'done' }) {
  return (
    <div className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-700/60 bg-zinc-900/40 shrink-0">
        <span className="text-sm font-semibold text-zinc-200">{side.label}</span>
        {phase === 'running' && (
          <span className="flex items-center gap-1.5 text-xs text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            running…
          </span>
        )}
        {phase === 'done' && <span className="text-xs text-emerald-400">done</span>}
      </div>

      {/* Response */}
      <div className="flex-1 px-4 py-3 max-h-56 overflow-y-auto">
        <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{side.response}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-px bg-zinc-700/40 border-t border-zinc-700/60 shrink-0">
        {[
          ['In / Out', `${side.inputTokens} / ${side.outputTokens}`],
          ['Latency',  `${side.totalMs}ms`],
          ['Tok/sec',  side.tokensPerSec.toFixed(1)],
          ['Context',  `${side.contextUsagePct.toFixed(1)}%`],
          ['Est. cost', `$${side.estimatedCostUsd.toFixed(5)}`],
          ['Tokens',   String(side.totalTokens)],
        ].map(([label, value]) => (
          <div key={label} className="bg-zinc-900/60 px-2 py-2 flex flex-col items-center">
            <span className="text-xs text-zinc-500">{label}</span>
            <span className="text-sm tabular-nums font-medium text-zinc-200">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonSide({ label }: { label: string }) {
  return (
    <div className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 overflow-hidden animate-pulse flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-700/60 bg-zinc-900/40">
        <span className="text-sm font-semibold text-zinc-400">{label}</span>
        <span className="flex items-center gap-1.5 text-xs text-indigo-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          running…
        </span>
      </div>
      <div className="flex-1 px-4 py-3 space-y-2">
        <div className="h-3 bg-zinc-700 rounded w-full" />
        <div className="h-3 bg-zinc-700 rounded w-5/6" />
        <div className="h-3 bg-zinc-700 rounded w-4/6" />
        <div className="h-3 bg-zinc-700 rounded w-full" />
        <div className="h-3 bg-zinc-700 rounded w-3/6" />
      </div>
      <div className="grid grid-cols-3 gap-px bg-zinc-700/40 border-t border-zinc-700/60">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-zinc-900/60 px-2 py-2 flex flex-col items-center gap-1">
            <div className="h-2.5 w-10 bg-zinc-700 rounded" />
            <div className="h-3 w-8 bg-zinc-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AbTestPanel({ model, systemPrompt }: Props) {
  const [promptA, setPromptA]   = useState('');
  const [promptB, setPromptB]   = useState('');
  const [result, setResult]     = useState<AbResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [phase, setPhase]       = useState<'a' | 'b' | 'done'>('done');
  const [error, setError]       = useState<string | null>(null);

  const run = async () => {
    if (!promptA || !promptB || !model) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setPhase('a');

    // After ~3s assume A finished, show B running
    const timer = setTimeout(() => setPhase('b'), 3000);

    try {
      const data = await api.abTest({ model, promptA, promptB, systemPrompt });
      setResult(data);
      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A/B test failed');
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const textareaClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm p-3 resize-none focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600';

  return (
    <div className="space-y-4">
      {/* Model badge */}
      {model && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Model:</span>
          <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            {model}
          </span>
          <span className="text-xs text-zinc-600">· runs A then B sequentially</span>
        </div>
      )}

      {/* Prompt inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Prompt A</label>
          <textarea
            rows={4}
            value={promptA}
            onChange={(e) => setPromptA(e.target.value)}
            placeholder="First prompt variant…"
            className={textareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Prompt B</label>
          <textarea
            rows={4}
            value={promptB}
            onChange={(e) => setPromptB(e.target.value)}
            placeholder="Second prompt variant…"
            className={textareaClass}
          />
        </div>
      </div>

      <button
        onClick={run}
        disabled={loading || !promptA || !promptB || !model}
        className={clsx(
          'px-5 py-2 rounded-lg text-sm font-medium transition-colors',
          loading || !promptA || !promptB || !model
            ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white',
        )}
      >
        {loading
          ? phase === 'a' ? 'Running Prompt A…' : 'Running Prompt B…'
          : 'Run A/B Test'}
      </button>

      {!model && (
        <p className="text-xs text-amber-400">Select a model from the sidebar first.</p>
      )}

      {error && (
        <div className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex gap-4">
          <SkeletonSide label="Prompt A" />
          <SkeletonSide label="Prompt B" />
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="flex gap-4">
          <SideCard side={result.a} phase="done" />
          <SideCard side={result.b} phase="done" />
        </div>
      )}
    </div>
  );
}
