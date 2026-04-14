'use client';

import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { useHistory } from '@/hooks/useHistory';
import type { RequestLog } from '@/types';

interface RowProps {
  log: RequestLog;
  onRerun: (log: RequestLog) => void;
}

function ExpandedRow({ log, onRerun }: RowProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(log.response ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr>
      <td colSpan={7} className="px-4 pb-4 bg-zinc-900/60">
        <div className="space-y-3 pt-2">
          {log.systemPrompt && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">System prompt</p>
              <p className="text-xs text-zinc-400 bg-zinc-800 rounded-lg p-2 font-mono whitespace-pre-wrap">
                {log.systemPrompt}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Prompt</p>
            <p className="text-xs text-zinc-300 bg-zinc-800 rounded-lg p-2 font-mono whitespace-pre-wrap">
              {log.prompt}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-zinc-500">Response</p>
              <div className="flex gap-2">
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
                <button
                  onClick={() => onRerun(log)}
                  className="text-xs px-2 py-0.5 rounded border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  ↺ Re-run
                </button>
              </div>
            </div>
            <pre className="text-xs text-zinc-300 bg-zinc-800 rounded-lg p-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-mono">
              {log.response || <span className="text-zinc-600">No response stored</span>}
            </pre>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              ['TTFT',        `${log.ttft}ms`],
              ['Tok/sec',     log.tokensPerSec.toFixed(1)],
              ['Context %',   `${log.contextUsagePct.toFixed(1)}%`],
              ['Est. cost',   `$${log.estimatedCostUsd.toFixed(6)}`],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-zinc-800 rounded-lg px-2 py-1.5">
                <div className="text-zinc-500">{label}</div>
                <div className="text-zinc-200 font-medium tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}

function Row({ log, onRerun }: RowProps) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(log.createdAt).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      <tr
        className="border-b border-zinc-700/50 hover:bg-zinc-700/20 text-sm cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-3 py-2 text-zinc-500 text-xs tabular-nums whitespace-nowrap">
          <span className="mr-1.5 text-zinc-600">{expanded ? '▾' : '▸'}</span>
          {date}
        </td>
        <td className="px-3 py-2 font-mono text-xs text-indigo-300">{log.model}</td>
        <td className="px-3 py-2 text-zinc-400 max-w-xs truncate">{log.prompt}</td>
        <td className="px-3 py-2 text-zinc-300 tabular-nums text-center">{log.totalTokens}</td>
        <td className="px-3 py-2 text-zinc-300 tabular-nums text-center">{log.totalTime}ms</td>
        <td className="px-3 py-2 text-zinc-300 tabular-nums text-center">{log.tokensPerSec.toFixed(1)}</td>
        <td className="px-3 py-2 text-zinc-400 tabular-nums text-center">{log.contextUsagePct.toFixed(1)}%</td>
      </tr>
      {expanded && <ExpandedRow log={log} onRerun={onRerun} />}
    </>
  );
}

interface Props {
  onRerun?: (prompt: string, model: string, systemPrompt?: string) => void;
}

export function RequestHistory({ onRerun }: Props) {
  const { logs, stats, page, setPage, clearAll, refresh } = useHistory();

  const handleRerun = useCallback((log: RequestLog) => {
    onRerun?.(log.prompt, log.model, log.systemPrompt);
  }, [onRerun]);

  const exportData = useCallback((format: 'csv' | 'json') => {
    if (!logs?.items.length) return;
    const items = logs.items;

    let content: string;
    let filename: string;
    let type: string;

    if (format === 'json') {
      content = JSON.stringify(items, null, 2);
      filename = `prompt-lab-history-${Date.now()}.json`;
      type = 'application/json';
    } else {
      const headers = ['time', 'model', 'prompt', 'inputTokens', 'outputTokens', 'totalTokens', 'ttft', 'totalTime', 'tokensPerSec', 'contextUsagePct', 'estimatedCostUsd'];
      const rows = items.map((r) =>
        [
          new Date(r.createdAt).toISOString(),
          r.model,
          `"${r.prompt.replace(/"/g, '""')}"`,
          r.inputTokens, r.outputTokens, r.totalTokens,
          r.ttft, r.totalTime,
          r.tokensPerSec.toFixed(2),
          r.contextUsagePct.toFixed(2),
          r.estimatedCostUsd.toFixed(8),
        ].join(','),
      );
      content = [headers.join(','), ...rows].join('\n');
      filename = `prompt-lab-history-${Date.now()}.csv`;
      type = 'text/csv';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 overflow-hidden space-y-0">
      {/* Stats bar */}
      {stats && (
        <div className="flex flex-wrap gap-6 px-4 py-3 border-b border-zinc-700 bg-zinc-900/40">
          {[
            ['Total Requests', stats.totalRequests],
            ['Total Tokens',   stats.totalTokens.toLocaleString()],
            ['Avg Latency',    `${Math.round(stats.avgLatencyMs)}ms`],
            ['Avg Tok/sec',    stats.avgTokensPerSec.toFixed(1)],
            ['Total Cost',     `$${stats.totalCostUsd.toFixed(4)}`],
          ].map(([label, value]) => (
            <div key={String(label)} className="text-xs">
              <div className="text-zinc-500">{label}</div>
              <div className="text-zinc-200 font-semibold tabular-nums">{value}</div>
            </div>
          ))}

          <div className="ml-auto flex items-center gap-3">
            {/* Export buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-600">Export:</span>
              <button
                onClick={() => exportData('csv')}
                disabled={!logs?.items.length}
                className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40 transition-colors border border-zinc-700 hover:border-zinc-500 rounded px-2 py-0.5"
              >
                CSV
              </button>
              <button
                onClick={() => exportData('json')}
                disabled={!logs?.items.length}
                className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40 transition-colors border border-zinc-700 hover:border-zinc-500 rounded px-2 py-0.5"
              >
                JSON
              </button>
            </div>
            <button
              onClick={() => refresh()}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ↻ Refresh
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-700 bg-zinc-900/50">
              {['Time', 'Model', 'Prompt', 'Tokens', 'Latency', 'Tok/sec', 'Ctx %'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-xs font-medium text-zinc-400 text-center first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs?.items.map((log) => (
              <Row key={log.id} log={log} onRerun={handleRerun} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {logs && logs.pages > 1 && (
        <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-zinc-700">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-zinc-500">{page} / {logs.pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(logs.pages, p + 1))}
            disabled={page === logs.pages}
            className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {!logs?.items.length && (
        <p className="text-center text-sm text-zinc-500 py-8">No requests yet</p>
      )}
    </div>
  );
}
