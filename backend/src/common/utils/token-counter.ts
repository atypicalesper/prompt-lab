import { encode } from 'gpt-tokenizer';

// Uses GPT tokenizer (cl100k_base) as an approximation for all Ollama models.
// Ollama returns exact counts in the final chunk via prompt_eval_count / eval_count.
export function countTokens(text: string): number {
  try {
    return encode(text).length;
  } catch {
    // Fallback: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}

// Context window sizes per model family. Used for usage % calculation.
const CONTEXT_WINDOWS: Record<string, number> = {
  'llama3.2':      131_072,
  'llama3.2:1b':   131_072,
  'llama3.2:3b':   131_072,
  'llama3.1':      131_072,
  'llama3.1:8b':   131_072,
  'llama3':          8_192,
  'llama3:8b':       8_192,
  'mistral':        32_768,
  'mistral-nemo':  131_072,
  'qwen2.5':       131_072,
  'qwen2.5:7b':    131_072,
  'qwen3':          32_768,
  'qwen3.5':        32_768,
  'phi4':           16_384,
  'gemma3':          8_192,
  'deepseek-r1':   131_072,
  'codellama':      16_384,
  'nomic-embed-text': 8_192,
};

export function getContextWindow(model: string): number {
  // Try exact match, then prefix match
  if (CONTEXT_WINDOWS[model]) return CONTEXT_WINDOWS[model];
  const prefix = Object.keys(CONTEXT_WINDOWS).find((k) => model.startsWith(k));
  return prefix ? CONTEXT_WINDOWS[prefix] : 32_768;
}

// OpenAI GPT-4o-mini pricing used for simulation (local Ollama has no real cost)
const INPUT_COST_PER_TOKEN  = 0.00000015; // $0.15 / 1M tokens
const OUTPUT_COST_PER_TOKEN = 0.00000060; // $0.60 / 1M tokens

export function simulateCost(inputTokens: number, outputTokens: number): number {
  return (
    inputTokens  * INPUT_COST_PER_TOKEN +
    outputTokens * OUTPUT_COST_PER_TOKEN
  );
}
