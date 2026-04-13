'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import type { HardwareSnapshot } from '@/types';

export function useHardware(interval = 2000) {
  const { data, error } = useSWR<HardwareSnapshot>(
    'hardware',
    () => api.hardware(),
    { refreshInterval: interval, revalidateOnFocus: false },
  );

  return { hardware: data ?? null, error: error as Error | undefined };
}
