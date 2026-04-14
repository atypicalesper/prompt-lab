'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import type { ModelParams } from '@/types';

interface Props {
  params: ModelParams;
  onChange: (params: ModelParams) => void;
}

const PARAM_INFO: Record<string, string> = {
  Temperature:      'Controls randomness. Lower (0.1) = focused and deterministic. Higher (1.5+) = creative and unpredictable. Default is ~0.7–1.0.',
  'Top-P':          'Nucleus sampling. Only considers tokens whose cumulative probability ≤ P. Lower = safer vocabulary, higher = broader word choice. Use with Temperature, not instead of it.',
  'Top-K':          'Limits the next token to the K most likely choices. Lower (10) = conservative, higher (100) = more varied. 0 disables it.',
  'Max tokens':     'Maximum number of tokens the model can generate in one response. Does not affect input. -1 means unlimited.',
  'Context window': 'Total token budget for prompt + response combined (num_ctx). Larger windows let the model see more context but use more RAM and slow generation.',
};

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-3.5 h-3.5 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-zinc-200 text-[9px] font-bold flex items-center justify-center transition-colors leading-none"
        aria-label="More info"
      >
        i
      </button>
      {visible && (
        <span className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 leading-relaxed shadow-xl z-50 pointer-events-none">
          {text}
          <span className="absolute top-full left-2 border-4 border-transparent border-t-zinc-600" />
        </span>
      )}
    </span>
  );
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
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-zinc-400">{label}</label>
          {PARAM_INFO[label] && <Tooltip text={PARAM_INFO[label]} />}
        </div>
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
          <Slider
            label="Context window"
            value={params.numCtx}
            min={512} max={131_072} step={512}
            onChange={(v) => onChange({ ...params, numCtx: v })}
            format={(v) => v >= 1024 ? `${(v / 1024).toFixed(0)}k` : String(v)}
          />
        </div>
      )}
    </div>
  );
}
