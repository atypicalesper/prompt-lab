'use client';

import { clsx } from 'clsx';
import type { FinalMetrics } from '@/types';

interface Props {
  final: FinalMetrics | null;
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
}

export function ContextWindowViz({ final }: Props) {
  if (!final) return null;

  const pct  = Math.min(final.contextUsagePct, 100);
  const warn = pct > 80;
  const crit = pct > 95;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-300">Context Window Usage</span>
        <span className={clsx(
          'text-sm font-bold tabular-nums',
          crit ? 'text-red-400' : warn ? 'text-amber-400' : 'text-emerald-400',
        )}>
          {pct.toFixed(1)}%
        </span>
      </div>

      <div className="h-3 w-full rounded-full bg-zinc-700 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            crit ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-emerald-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{fmt(final.inputTokens + final.outputTokens)} tokens used</span>
        <span>{fmt(final.contextWindow)} token window</span>
      </div>

      {crit && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          Context near limit — older tokens will be truncated on next request
        </p>
      )}
      {warn && !crit && (
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Context above 80% — consider summarising or starting a new session
        </p>
      )}
    </div>
  );
}
