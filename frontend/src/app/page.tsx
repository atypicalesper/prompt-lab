'use client';

import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { encode } from 'gpt-tokenizer';
import { useStream } from '@/hooks/useStream';
import { useModels } from '@/hooks/useModels';
import { StreamingOutput } from '@/components/StreamingOutput';
import { MetricsCards } from '@/components/MetricsCards';
import { ContextWindowViz } from '@/components/ContextWindowViz';
import { HardwareMetrics } from '@/components/HardwareMetrics';
import { ComparisonTable } from '@/components/ComparisonTable';
import { AbTestPanel } from '@/components/AbTestPanel';
import { RequestHistory } from '@/components/RequestHistory';
import { ModelParamsPanel } from '@/components/ModelParamsPanel';
import { SavedPromptsPanel } from '@/components/SavedPromptsPanel';
import type { DashboardMode, ModelParams } from '@/types';

const MODES: { id: DashboardMode; label: string }[] = [
  { id: 'single',  label: 'Single' },
  { id: 'compare', label: 'Compare' },
  { id: 'abtest',  label: 'A/B Test' },
];

export default function DashboardPage() {
  const stream = useStream();
  const { models, isLoading: modelsLoading } = useModels();

  const [mode, setMode]                 = useState<DashboardMode>('single');
  const [prompt, setPrompt]             = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [model, setModel]               = useState('');
  const [compareModels, setCompareModels] = useState<string[]>([]);
  const [tab, setTab]                   = useState<'output' | 'history'>('output');
  const [showSystem, setShowSystem]     = useState(false);
  const [modelParams, setModelParams]   = useState<ModelParams>({});

  // Live token count using gpt-tokenizer (cl100k_base)
  const tokenCount = useMemo(() => {
    if (!prompt) return 0;
    try { return encode(prompt).length; } catch { return 0; }
  }, [prompt]);

  const handleModelSelect = (m: string) => {
    if (mode !== 'compare') {
      setModel(m);
      return;
    }
    setCompareModels((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : prev.length < 4 ? [...prev, m] : prev,
    );
  };

  const handleRun = () => {
    if (!prompt || (!model && mode !== 'compare') || stream.status === 'streaming') return;
    stream.run({
      model: model || compareModels[0],
      prompt,
      systemPrompt: systemPrompt || undefined,
      ...modelParams,
    });
  };

  // Called from history "Re-run" button
  const handleRerun = (rePrompt: string, reModel: string, reSystem?: string) => {
    setPrompt(rePrompt);
    setModel(reModel);
    if (reSystem) { setSystemPrompt(reSystem); setShowSystem(true); }
    setMode('single');
    setTab('output');
    stream.reset();
  };

  const selectedModels = mode === 'compare' ? compareModels : model ? [model] : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold">P</div>
            <span className="font-semibold text-zinc-100">Prompt Lab</span>
            <span className="text-xs text-zinc-500 hidden sm:inline">local Ollama observability</span>
          </div>

          {/* Mode selector */}
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); stream.reset(); }}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  mode === m.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-6 grid grid-cols-[320px_1fr_260px] gap-6">
        {/* ─── LEFT: Input panel ─── */}
        <aside className="space-y-4">
          {/* System prompt */}
          <div>
            <button
              onClick={() => setShowSystem((v) => !v)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-1 flex items-center gap-1"
            >
              <span>{showSystem ? '▾' : '▸'}</span> System prompt
            </button>
            {showSystem && (
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant…"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm p-3 resize-none focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
              />
            )}
          </div>

          {/* Saved Prompts panel */}
          <SavedPromptsPanel
            currentPrompt={prompt}
            currentSystemPrompt={systemPrompt}
            onSelect={(p, sp) => {
              setPrompt(p);
              if (sp) { setSystemPrompt(sp); setShowSystem(true); }
            }}
          />

          {/* Prompt */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">Prompt</label>
              {tokenCount > 0 && (
                <span className="text-xs tabular-nums text-zinc-600">
                  ~{tokenCount.toLocaleString()} tokens
                </span>
              )}
            </div>
            <textarea
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt…"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm p-3 resize-none focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleRun();
              }}
            />
            <p className="text-xs text-zinc-600">⌘ Enter to run</p>
          </div>

          {/* Model selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              {mode === 'compare' ? `Models (${compareModels.length}/4 selected)` : 'Model'}
            </label>
            {modelsLoading ? (
              <p className="text-xs text-zinc-600 animate-pulse">Loading models…</p>
            ) : models.length === 0 ? (
              <p className="text-xs text-red-400">No models found — is Ollama running?</p>
            ) : (
              <div className="space-y-1">
                {models.map((m) => {
                  const isSelected = selectedModels.includes(m.name);
                  return (
                    <button
                      key={m.name}
                      onClick={() => handleModelSelect(m.name)}
                      className={clsx(
                        'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors',
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                          : 'border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-zinc-500',
                      )}
                    >
                      <div className="font-mono">{m.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {m.details?.parameter_size} · {(m.size / 1e9).toFixed(1)}GB
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Model parameters panel */}
          {mode === 'single' && (
            <ModelParamsPanel params={modelParams} onChange={setModelParams} />
          )}

          {/* Run button */}
          {mode === 'single' && (
            <button
              onClick={handleRun}
              disabled={!prompt || !model || stream.status === 'streaming'}
              className={clsx(
                'w-full py-2.5 rounded-lg font-medium text-sm transition-colors',
                !prompt || !model || stream.status === 'streaming'
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white',
              )}
            >
              {stream.status === 'loading'    ? 'Initialising…'
                : stream.status === 'streaming' ? 'Streaming…'
                : 'Run'}
            </button>
          )}

          {stream.status === 'streaming' && (
            <button
              onClick={stream.stop}
              className="w-full py-2 rounded-lg border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
            >
              Stop
            </button>
          )}

          {/* Context viz */}
          {mode === 'single' && <ContextWindowViz final={stream.final} />}
        </aside>

        {/* ─── CENTER: Output area ─── */}
        <section className="space-y-4 min-w-0">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-zinc-800/60 rounded-lg p-1 w-fit">
            {(['output', 'history'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors',
                  tab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'output' && (
            <>
              {/* Single mode */}
              {mode === 'single' && (
                <>
                  <StreamingOutput
                    output={stream.output}
                    status={stream.status}
                    error={stream.error}
                  />
                  <MetricsCards
                    status={stream.status}
                    live={stream.live}
                    final={stream.final}
                  />
                </>
              )}

              {/* Compare mode */}
              {mode === 'compare' && (
                <ComparisonTable
                  models={compareModels}
                  prompt={prompt}
                  systemPrompt={systemPrompt || undefined}
                />
              )}

              {/* A/B test mode */}
              {mode === 'abtest' && (
                <AbTestPanel
                  model={model}
                  systemPrompt={systemPrompt || undefined}
                />
              )}
            </>
          )}

          {tab === 'history' && (
            <RequestHistory onRerun={handleRerun} />
          )}
        </section>

        {/* ─── RIGHT: Hardware sidebar ─── */}
        <aside>
          <HardwareMetrics />
        </aside>
      </main>
    </div>
  );
}
