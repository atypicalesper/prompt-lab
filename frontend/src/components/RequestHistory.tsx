'use client';

import { useHistory } from '@/hooks/useHistory';
import type { RequestLog } from '@/types';

function Row({ log }: { log: RequestLog }) {
  const date = new Date(log.createdAt).toLocaleTimeString();
  return (
    <tr className="border-b border-zinc-700/50 hover:bg-zinc-700/20 text-sm">
      <td className="px-3 py-2 text-zinc-500 text-xs tabular-nums whitespace-nowrap">{date}</td>
      <td className="px-3 py-2 font-mono text-xs text-indigo-300">{log.model}</td>
      <td className="px-3 py-2 text-zinc-400 max-w-xs truncate">{log.prompt}</td>
      <td className="px-3 py-2 text-zinc-300 tabular-nums text-center">{log.totalTokens}</td>
      <td className="px-3 py-2 text-zinc-300 tabular-nums text-center">{log.totalTime}ms</td>
      <td className="px-3 py-2 text-zinc-300 tabular-nums text-center">{log.tokensPerSec.toFixed(1)}</td>
      <td className="px-3 py-2 text-zinc-400 tabular-nums text-center">{log.contextUsagePct.toFixed(1)}%</td>
    </tr>
  );
}

export function RequestHistory() {
  const { logs, stats, page, setPage, clearAll } = useHistory();

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 overflow-hidden space-y-0">
      {/* Stats bar */}
      {stats && (
        <div className="flex gap-6 px-4 py-3 border-b border-zinc-700 bg-zinc-900/40">
          {[
            ['Total Requests', stats.totalRequests],
            ['Total Tokens', stats.totalTokens.toLocaleString()],
            ['Avg Latency', `${Math.round(stats.avgLatencyMs)}ms`],
            ['Avg Tok/sec', stats.avgTokensPerSec.toFixed(1)],
            ['Total Cost', `$${stats.totalCostUsd.toFixed(4)}`],
          ].map(([label, value]) => (
            <div key={String(label)} className="text-xs">
              <div className="text-zinc-500">{label}</div>
              <div className="text-zinc-200 font-semibold tabular-nums">{value}</div>
            </div>
          ))}
          <div className="ml-auto">
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
            {logs?.items.map((log) => <Row key={log.id} log={log} />)}
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
          <span className="text-xs text-zinc-500">
            {page} / {logs.pages}
          </span>
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
