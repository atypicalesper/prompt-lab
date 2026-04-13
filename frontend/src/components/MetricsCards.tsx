'use client';

import { clsx } from 'clsx';
import type { FinalMetrics, LiveMetrics, StreamStatus } from '@/types';

interface Props {
  status: StreamStatus;
  live: LiveMetrics | null;
  final: FinalMetrics | null;
}

function Card({ label, value, sub, accent = false }: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={clsx(
      'rounded-xl border p-4 flex flex-col gap-1',
      accent
        ? 'border-indigo-500/40 bg-indigo-500/10'
        : 'border-zinc-700 bg-zinc-800/60',
    )}>
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</span>
      <span className={clsx('text-2xl font-bold tabular-nums', accent ? 'text-indigo-300' : 'text-zinc-100')}>
        {value}
      </span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  );
}

export function MetricsCards({ status, live, final }: Props) {
  const m = final ?? live;
  const isLive = !final && live;

  if (status === 'idle') return null;

  const ttft     = m && 'ttft' in m && m.ttft != null ? `${m.ttft}ms` : '—';
  const tps      = m ? `${(m.tokensPerSec ?? 0).toFixed(1)}` : '—';
  const tokens   = final
    ? `${final.inputTokens} / ${final.outputTokens}`
    : live
    ? `${live.outputTokens}`
    : '—';
  const latency  = final ? `${final.totalMs}ms` : live ? `${live.elapsedMs}ms` : '—';
  const cost     = final ? `$${final.estimatedCostUsd.toFixed(6)}` : '—';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Card label="TTFT" value={ttft} sub="time to first token" accent />
      <Card label="Tokens/sec" value={tps} sub={isLive ? 'live' : 'avg'} />
      <Card label="Tokens (in/out)" value={tokens} />
      <Card label={isLive ? 'Elapsed' : 'Total latency'} value={latency} />
      <Card label="Est. cost" value={cost} sub="based on GPT-4o-mini pricing" />
    </div>
  );
}
