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
// Ollama returns exact counts in the final chunk — these are fallbacks for the display.
const CONTEXT_WINDOWS: Record<string, number> = {
  // ── Llama ──────────────────────────────────────────────────
  'llama4':             10_000_000,
  'llama4:scout':       10_000_000,
  'llama4:maverick':    10_000_000,
  'llama3.3':              131_072,
  'llama3.3:70b':          131_072,
  'llama3.2':              131_072,
  'llama3.2:1b':           131_072,
  'llama3.2:3b':           131_072,
  'llama3.2-vision':       131_072,
  'llama3.1':              131_072,
  'llama3.1:8b':           131_072,
  'llama3.1:70b':          131_072,
  'llama3.1:405b':         131_072,
  'llama3':                  8_192,
  'llama3:8b':               8_192,
  'llama3:70b':              8_192,
  'llama2':                  4_096,
  'llama2:7b':               4_096,
  'llama2:13b':              4_096,
  'llama2:70b':              4_096,
  // ── Qwen ───────────────────────────────────────────────────
  'qwen3':               32_768,
  'qwen3:0.6b':          32_768,
  'qwen3:1.7b':          32_768,
  'qwen3:4b':            32_768,
  'qwen3:8b':            32_768,
  'qwen3:14b':           32_768,
  'qwen3:32b':           32_768,
  'qwen3:30b-a3b':       32_768,
  'qwen3:235b-a22b':     32_768,
  'qwen3.5':             32_768,
  'qwen2.5':            131_072,
  'qwen2.5:0.5b':       131_072,
  'qwen2.5:1.5b':       131_072,
  'qwen2.5:3b':         131_072,
  'qwen2.5:7b':         131_072,
  'qwen2.5:14b':        131_072,
  'qwen2.5:32b':        131_072,
  'qwen2.5:72b':        131_072,
  'qwen2.5-coder':      131_072,
  'qwen2.5-coder:1.5b': 131_072,
  'qwen2.5-coder:7b':   131_072,
  'qwen2.5-coder:14b':  131_072,
  'qwen2.5-coder:32b':  131_072,
  'qwen2':              131_072,
  'qwen2:0.5b':         131_072,
  'qwen2:1.5b':         131_072,
  'qwen2:7b':           131_072,
  'qwen2:72b':          131_072,
  // ── Mistral / Mixtral ──────────────────────────────────────
  'mistral':             32_768,
  'mistral:7b':          32_768,
  'mistral-large':      131_072,
  'mistral-small':      131_072,
  'mistral-nemo':       131_072,
  'mixtral':             32_768,
  'mixtral:8x7b':        32_768,
  'mixtral:8x22b':       65_536,
  'codestral':           32_768,
  'devstral':            32_768,
  // ── Gemma ──────────────────────────────────────────────────
  'gemma3':             131_072,
  'gemma3:1b':          131_072,
  'gemma3:4b':          131_072,
  'gemma3:12b':         131_072,
  'gemma3:27b':         131_072,
  'gemma2':               8_192,
  'gemma2:2b':            8_192,
  'gemma2:9b':            8_192,
  'gemma2:27b':           8_192,
  'gemma':                8_192,
  'codegemma':            8_192,
  // ── Phi ────────────────────────────────────────────────────
  'phi4':                16_384,
  'phi4-mini':           16_384,
  'phi4-reasoning':      16_384,
  'phi3.5':             131_072,
  'phi3':               131_072,
  'phi3:mini':          131_072,
  'phi3:medium':        131_072,
  'phi3:small':         131_072,
  // ── DeepSeek ───────────────────────────────────────────────
  'deepseek-r1':        131_072,
  'deepseek-r1:1.5b':   131_072,
  'deepseek-r1:7b':     131_072,
  'deepseek-r1:8b':     131_072,
  'deepseek-r1:14b':    131_072,
  'deepseek-r1:32b':    131_072,
  'deepseek-r1:70b':    131_072,
  'deepseek-r1:671b':   131_072,
  'deepseek-v3':        131_072,
  'deepseek-v2.5':      131_072,
  'deepseek-coder-v2':  131_072,
  'deepseek-coder':      16_384,
  // ── Code models ────────────────────────────────────────────
  'codellama':           16_384,
  'codellama:7b':        16_384,
  'codellama:13b':       16_384,
  'codellama:34b':       16_384,
  'codellama:70b':       16_384,
  'starcoder2':          16_384,
  'starcoder2:3b':       16_384,
  'starcoder2:7b':       16_384,
  'starcoder2:15b':      16_384,
  // ── Small / fast ───────────────────────────────────────────
  'tinyllama':            2_048,
  'orca-mini':            4_096,
  'vicuna':               4_096,
  'falcon':               2_048,
  'neural-chat':          8_192,
  'solar':                4_096,
  'openchat':             8_192,
  'starling-lm':          8_192,
  'zephyr':               8_192,
  'smollm2':             131_072,
  'smollm2:135m':        131_072,
  'smollm2:360m':        131_072,
  'smollm2:1.7b':        131_072,
  // ── Multimodal ─────────────────────────────────────────────
  'llava':                4_096,
  'llava:7b':             4_096,
  'llava:13b':            4_096,
  'llava:34b':            4_096,
  'llava-llama3':         8_192,
  'bakllava':             4_096,
  'moondream':            2_048,
  'minicpm-v':           32_768,
  // ── Embedding ──────────────────────────────────────────────
  'nomic-embed-text':     8_192,
  'mxbai-embed-large':  512,
  'all-minilm':           512,
  'bge-m3':             8_192,
  'snowflake-arctic-embed': 8_192,
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
