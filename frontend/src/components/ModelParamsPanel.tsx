'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import type { ModelParams } from '@/types';

interface Props {
  params: ModelParams;
  onChange: (params: ModelParams) => void;
}

function Slider({
  label, value, min, max, step, onChange, format,
}: {
  label: string;
  value: number | undefined;
  min: number;
  max: number;
  step: number;
  onChange: (v: number | undefined) => void;
  format?: (v: number) => string;
}) {
  const enabled = value !== undefined;
  const display = format ? format(value ?? min) : String(value ?? min);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-400">{label}</label>
        <div className="flex items-center gap-1.5">
          {enabled && (
            <span className="text-xs font-mono text-indigo-300 tabular-nums">{display}</span>
          )}
          <button
            onClick={() => onChange(enabled ? undefined : (min + max) / 2)}
            className={clsx(
              'text-xs px-1.5 py-0.5 rounded transition-colors',
              enabled
                ? 'text-indigo-400 hover:text-indigo-300'
                : 'text-zinc-600 hover:text-zinc-400',
            )}
          >
            {enabled ? 'reset' : 'set'}
          </button>
        </div>
      </div>
      {enabled && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 rounded-full accent-indigo-500 bg-zinc-700 cursor-pointer"
        />
      )}
    </div>
  );
}

export function ModelParamsPanel({ params, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const hasCustom = Object.values(params).some((v) => v !== undefined);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>Parameters</span>
        {hasCustom && !open && (
          <span className="ml-1 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            custom
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-4 p-3 rounded-lg border border-zinc-700 bg-zinc-900/60">
          <Slider
            label="Temperature"
            value={params.temperature}
            min={0} max={2} step={0.05}
            onChange={(v) => onChange({ ...params, temperature: v })}
            format={(v) => v.toFixed(2)}
          />
          <Slider
            label="Top-P"
            value={params.topP}
            min={0} max={1} step={0.05}
            onChange={(v) => onChange({ ...params, topP: v })}
            format={(v) => v.toFixed(2)}
          />
          <Slider
            label="Top-K"
            value={params.topK}
            min={0} max={100} step={1}
            onChange={(v) => onChange({ ...params, topK: v })}
          />
          <Slider
            label="Max tokens"
            value={params.numPredict}
            min={64} max={4096} step={64}
            onChange={(v) => onChange({ ...params, numPredict: v })}
          />
        </div>
      )}
    </div>
  );
}
