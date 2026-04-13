'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import type { AbResult } from '@/types';

interface Props {
  model: string;
  systemPrompt?: string;
}

function SideCard({ side }: { side: AbResult['a'] }) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-3 flex-1">
      <h4 className="text-sm font-semibold text-zinc-300">{side.label}</h4>
      <div className="bg-zinc-900 rounded-lg p-3 max-h-48 overflow-y-auto">
        <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-words font-mono">
          {side.response}
        </pre>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ['Input tokens',  side.inputTokens],
          ['Output tokens', side.outputTokens],
          ['Latency',       `${side.totalMs}ms`],
          ['Tok/sec',       side.tokensPerSec.toFixed(1)],
          ['Context %',     `${side.contextUsagePct.toFixed(1)}%`],
          ['Est. cost',     `$${side.estimatedCostUsd.toFixed(6)}`],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-zinc-900 rounded-lg px-2 py-1.5">
            <div className="text-zinc-500">{label}</div>
            <div className="text-zinc-200 font-medium tabular-nums">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AbTestPanel({ model, systemPrompt }: Props) {
  const [promptA, setPromptA] = useState('');
  const [promptB, setPromptB] = useState('');
  const [result, setResult]   = useState<AbResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const run = async () => {
    if (!promptA || !promptB) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.abTest({ model, promptA, promptB, systemPrompt });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A/B test failed');
    } finally {
      setLoading(false);
    }
  };

  const textareaClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm p-3 resize-none focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600';

  return (
    <div className="space-y-4">
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
        {loading ? 'Running both prompts…' : 'Run A/B Test'}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {result && (
        <div className="flex gap-4">
          <SideCard side={result.a} />
          <SideCard side={result.b} />
        </div>
      )}
    </div>
  );
}
