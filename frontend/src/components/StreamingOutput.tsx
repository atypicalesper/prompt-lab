'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import type { StreamStatus } from '@/types';

interface Props {
  output: string;
  status: StreamStatus;
  error: string | null;
}

export function StreamingOutput({ output, status, error }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (status === 'streaming') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [output, status]);

  return (
    <div className={clsx(
      'relative rounded-xl border min-h-48 max-h-[28rem] overflow-y-auto',
      'bg-zinc-900 p-4 font-mono text-sm leading-relaxed text-zinc-200',
      status === 'streaming' ? 'border-indigo-500/50 streaming-glow' : 'border-zinc-700',
    )}>
      {/* Status badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {status === 'streaming' && (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs text-indigo-400">streaming</span>
          </>
        )}
        {status === 'done' && (
          <span className="text-xs text-emerald-400">done</span>
        )}
        {status === 'error' && (
          <span className="text-xs text-red-400">error</span>
        )}
      </div>

      {status === 'idle' && (
        <p className="text-zinc-500 text-sm">
          Output will appear here when you run a prompt.
        </p>
      )}

      {status === 'loading' && (
        <p className="text-zinc-400 animate-pulse">Initialising stream…</p>
      )}

      {error && (
        <p className="text-red-400">{error}</p>
      )}

      {output && (
        <pre className="whitespace-pre-wrap break-words">
          {output}
          {status === 'streaming' && (
            <span className="cursor-blink text-indigo-400">▋</span>
          )}
        </pre>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
