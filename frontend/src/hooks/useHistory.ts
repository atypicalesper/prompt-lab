'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { LogsResponse, LogStats } from '@/types';

export function useHistory() {
  const [page, setPage] = useState(1);

  const { data: logs, mutate: mutateLogs } = useSWR<LogsResponse>(
    ['logs', page],
    () => api.logs.list(page),
    { revalidateOnFocus: false },
  );

  const { data: stats, mutate: mutateStats } = useSWR<LogStats>(
    'logs-stats',
    () => api.logs.stats(),
    { revalidateOnFocus: false },
  );

  const clearAll = async () => {
    await api.logs.clear();
    await Promise.all([mutateLogs(), mutateStats()]);
  };

  return {
    logs:    logs ?? null,
    stats:   stats ?? null,
    page,
    setPage,
    clearAll,
    refresh: () => Promise.all([mutateLogs(), mutateStats()]),
  };
}
