'use client';

import { clsx } from 'clsx';
import { useHardware } from '@/hooks/useHardware';

function GaugeBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-700 overflow-hidden">
      <div
        className={clsx('h-full rounded-full transition-all duration-700', color)}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export function HardwareMetrics() {
  const { hardware, error } = useHardware();

  if (error) return (
    <div className="text-xs text-zinc-500 px-2">Hardware metrics unavailable</div>
  );

  if (!hardware) return (
    <div className="text-xs text-zinc-600 px-2 animate-pulse">Loading hardware…</div>
  );

  const { cpu, memory, gpu, ollamaRunningOnGpu } = hardware;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Hardware</h3>
        <span className={clsx(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          ollamaRunningOnGpu
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        )}>
          {ollamaRunningOnGpu ? 'GPU' : 'CPU'}
        </span>
      </div>

      <div className="space-y-3">
        {/* CPU */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">CPU — {cpu.model.split('@')[0].trim()}</span>
            <span className="text-zinc-300 tabular-nums">{cpu.usagePct}%</span>
          </div>
          <GaugeBar pct={cpu.usagePct} color={cpu.usagePct > 85 ? 'bg-red-500' : 'bg-indigo-500'} />
        </div>

        {/* RAM */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">RAM {memory.usedGb}GB / {memory.totalGb}GB</span>
            <span className="text-zinc-300 tabular-nums">{memory.usagePct}%</span>
          </div>
          <GaugeBar pct={memory.usagePct} color={memory.usagePct > 85 ? 'bg-red-500' : 'bg-violet-500'} />
        </div>

        {/* GPU */}
        {gpu ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">GPU — {gpu.model.split(' ').slice(0, 3).join(' ')}</span>
              <span className="text-zinc-300 tabular-nums">{gpu.usagePct}%</span>
            </div>
            <GaugeBar pct={gpu.usagePct} color={gpu.usagePct > 85 ? 'bg-red-500' : 'bg-emerald-500'} />
            <div className="text-xs text-zinc-500">
              VRAM: {gpu.vramUsedMb}MB / {gpu.vramTotalMb}MB
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-600">No GPU detected</p>
        )}
      </div>
    </div>
  );
}
