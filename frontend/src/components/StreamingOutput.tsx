'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { StreamStatus } from '@/types';

interface Props {
  output: string;
  status: StreamStatus;
  error: string | null;
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function StreamingOutput({ output, status, error }: Props) {
  const bottomRef        = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [raw, setRaw]       = useState(false);

  useEffect(() => {
    if (status === 'streaming') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [output, status]);

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const words = wordCount(output);
  const chars = output.length;

  const isStreaming = status === 'streaming';
  const isDone      = status === 'done';

  return (
    <div className={clsx(
      'relative rounded-xl border flex flex-col overflow-hidden',
      'min-h-52 max-h-[36rem]',
      isStreaming
        ? 'border-indigo-500/50 streaming-glow bg-zinc-950'
        : 'border-zinc-700/80 bg-zinc-950',
    )}>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
        <div className="flex items-center gap-2">
          {isStreaming && (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs text-indigo-400 font-medium">streaming</span>
            </>
          )}
          {isDone && <span className="text-xs text-emerald-400 font-medium">done</span>}
          {status === 'error' && <span className="text-xs text-red-400 font-medium">error</span>}
          {status === 'loading' && (
            <span className="text-xs text-zinc-500 animate-pulse">initialising…</span>
          )}
          {status === 'idle' && (
            <span className="text-xs text-zinc-600">output</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {output && (
            <span className="text-xs text-zinc-600 tabular-nums">
              {words.toLocaleString()}w · {chars.toLocaleString()}c
            </span>
          )}
          {output && !isStreaming && (
            <button
              onClick={() => setRaw((v) => !v)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-0.5 rounded border border-zinc-700 hover:border-zinc-500"
            >
              {raw ? 'Rendered' : 'Raw'}
            </button>
          )}
          {output && (
            <button
              onClick={copy}
              className={clsx(
                'text-xs px-2 py-0.5 rounded border transition-colors',
                copied
                  ? 'text-emerald-400 border-emerald-500/50'
                  : 'text-zinc-500 hover:text-zinc-300 border-zinc-700 hover:border-zinc-500',
              )}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-zinc-300 min-h-0">
        {status === 'idle' && (
          <p className="text-zinc-600 text-sm mt-1">Output will appear here when you run a prompt.</p>
        )}

        {error && (
          <div className="flex items-start gap-2 text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2.5 text-sm">
            <span className="mt-0.5 shrink-0">✕</span>
            <span>{error}</span>
          </div>
        )}

        {output && (
          raw ? (
            <pre className="whitespace-pre-wrap break-words font-mono text-xs text-zinc-300 leading-relaxed">
              {output}
              {isStreaming && <span className="cursor-blink text-indigo-400">▋</span>}
            </pre>
          ) : (
            <div className="output-prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {output + (isStreaming ? ' ▋' : '')}
              </ReactMarkdown>
            </div>
          )
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
