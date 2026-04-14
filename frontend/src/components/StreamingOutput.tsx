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

export function StreamingOutput({ output, status, error }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied]   = useState(false);
  const [raw, setRaw]         = useState(false);

  // Auto-scroll to bottom while streaming
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

  return (
    <div className={clsx(
      'relative rounded-xl border min-h-48 max-h-[28rem] overflow-y-auto',
      'bg-zinc-900 p-4 text-sm leading-relaxed text-zinc-200',
      status === 'streaming' ? 'border-indigo-500/50 streaming-glow' : 'border-zinc-700',
    )}>
      {/* Top-right toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {/* Raw / Rendered toggle */}
        {output && status !== 'streaming' && (
          <button
            onClick={() => setRaw((v) => !v)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-0.5 rounded border border-zinc-700 hover:border-zinc-500"
          >
            {raw ? 'Rendered' : 'Raw'}
          </button>
        )}

        {/* Copy button */}
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

        {/* Status badge */}
        {status === 'streaming' && (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs text-indigo-400">streaming</span>
          </>
        )}
        {status === 'done'  && <span className="text-xs text-emerald-400">done</span>}
        {status === 'error' && <span className="text-xs text-red-400">error</span>}
      </div>

      {status === 'idle' && (
        <p className="text-zinc-500 text-sm">Output will appear here when you run a prompt.</p>
      )}

      {status === 'loading' && (
        <p className="text-zinc-400 animate-pulse">Initialising stream…</p>
      )}

      {error && <p className="text-red-400">{error}</p>}

      {output && (
        raw ? (
          <pre className="whitespace-pre-wrap break-words font-mono">
            {output}
            {status === 'streaming' && (
              <span className="cursor-blink text-indigo-400">▋</span>
            )}
          </pre>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {output + (status === 'streaming' ? ' ▋' : '')}
            </ReactMarkdown>
          </div>
        )
      )}

      <div ref={bottomRef} />
    </div>
  );
}
