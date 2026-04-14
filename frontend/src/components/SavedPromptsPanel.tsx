'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useTemplates } from '@/hooks/useTemplates';
import type { PromptTemplate } from '@/types';

interface Props {
  currentPrompt: string;
  currentSystemPrompt: string;
  onSelect: (prompt: string, systemPrompt?: string) => void;
}

export function SavedPromptsPanel({ currentPrompt, currentSystemPrompt, onSelect }: Props) {
  const { templates, isLoading, create, remove } = useTemplates();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !currentPrompt) return;
    setIsSaving(true);
    setError(null);
    const res = await create(name, currentPrompt, currentSystemPrompt);
    setIsSaving(false);
    if (!res.success) {
      setError(res.error || 'Failed to save');
    } else {
      setName('');
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 mb-2"
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>Saved prompts ({templates.length})</span>
      </button>

      {open && (
        <div className="space-y-3 p-3 rounded-lg border border-zinc-700 bg-zinc-900/60 max-h-64 overflow-y-auto">
          {/* Save current prompt form */}
          {currentPrompt && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name this prompt..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 text-xs p-2 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSave}
                disabled={isSaving || !name}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white text-xs rounded-lg transition-colors"
              >
                {isSaving ? 'Saving' : 'Save'}
              </button>
            </div>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* List templates */}
          {isLoading ? (
            <p className="text-xs text-zinc-500">Loading...</p>
          ) : templates.length === 0 ? (
            <p className="text-xs text-zinc-500">No saved prompts yet.</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {templates.map((t: PromptTemplate) => (
                <li key={t.id} className="group flex items-start justify-between p-2 rounded bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-500 transition-colors cursor-pointer" onClick={() => onSelect(t.prompt, t.systemPrompt)}>
                  <div className="flex-1 w-0 pr-2">
                    <p className="text-xs font-semibold text-zinc-300 truncate">{t.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{t.prompt}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(t.id); }}
                    className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 p-1"
                    title="Delete"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
