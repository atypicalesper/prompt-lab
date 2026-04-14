'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import type { PromptTemplate } from '@/types';

export function useTemplates() {
  const { data: templates, mutate, error } = useSWR<PromptTemplate[]>(
    '/templates',
    () => api.templates.list(),
    { revalidateOnFocus: false }
  );

  const create = async (name: string, prompt: string, systemPrompt?: string) => {
    try {
      const created = await api.templates.create({ name, prompt, systemPrompt });
      await mutate((prev) => [created, ...(prev || [])], false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const remove = async (id: string) => {
    try {
      await api.templates.remove(id);
      await mutate((prev) => (prev || []).filter(t => t.id !== id), false);
    } catch (err) {
      console.error('Failed to remove template', err);
    }
  };

  return {
    templates: templates || [],
    isLoading: !templates && !error,
    create,
    remove,
    refresh: () => mutate(),
  };
}
