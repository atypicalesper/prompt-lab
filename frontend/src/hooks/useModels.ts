'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import type { OllamaModel } from '@/types';

export function useModels() {
  const { data, error, isLoading } = useSWR<OllamaModel[]>(
    'models',
    () => api.models.list(),
    { revalidateOnFocus: false },
  );

  return {
    models:    data ?? [],
    isLoading,
    error:     error as Error | undefined,
  };
}
