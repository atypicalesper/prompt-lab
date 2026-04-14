export interface PricingModel {
  id: string;
  label: string;
  provider: string;
  inputPer1M: number;
  outputPer1M: number;
}

export const PRICING_MODELS: PricingModel[] = [
  // ── Anthropic ──────────────────────────────────────────────
  { id: 'claude-haiku-4-5',         label: 'Claude Haiku 4.5',          provider: 'Anthropic', inputPer1M: 0.80,   outputPer1M: 4.00   },
  { id: 'claude-sonnet-4-6',        label: 'Claude Sonnet 4.6',         provider: 'Anthropic', inputPer1M: 3.00,   outputPer1M: 15.00  },
  { id: 'claude-opus-4-6',          label: 'Claude Opus 4.6',           provider: 'Anthropic', inputPer1M: 15.00,  outputPer1M: 75.00  },
  { id: 'claude-3-7-sonnet',        label: 'Claude 3.7 Sonnet',         provider: 'Anthropic', inputPer1M: 3.00,   outputPer1M: 15.00  },
  { id: 'claude-3-5-sonnet-v2',     label: 'Claude 3.5 Sonnet v2',      provider: 'Anthropic', inputPer1M: 3.00,   outputPer1M: 15.00  },
  { id: 'claude-3-5-sonnet',        label: 'Claude 3.5 Sonnet',         provider: 'Anthropic', inputPer1M: 3.00,   outputPer1M: 15.00  },
  { id: 'claude-3-5-haiku',         label: 'Claude 3.5 Haiku',          provider: 'Anthropic', inputPer1M: 0.80,   outputPer1M: 4.00   },
  { id: 'claude-3-opus',            label: 'Claude 3 Opus',             provider: 'Anthropic', inputPer1M: 15.00,  outputPer1M: 75.00  },
  { id: 'claude-3-sonnet',          label: 'Claude 3 Sonnet',           provider: 'Anthropic', inputPer1M: 3.00,   outputPer1M: 15.00  },
  { id: 'claude-3-haiku',           label: 'Claude 3 Haiku',            provider: 'Anthropic', inputPer1M: 0.25,   outputPer1M: 1.25   },
  // ── OpenAI ─────────────────────────────────────────────────
  { id: 'gpt-4.1-nano',             label: 'GPT-4.1 nano',              provider: 'OpenAI',    inputPer1M: 0.10,   outputPer1M: 0.40   },
  { id: 'gpt-4.1-mini',             label: 'GPT-4.1 mini',              provider: 'OpenAI',    inputPer1M: 0.40,   outputPer1M: 1.60   },
  { id: 'gpt-4.1',                  label: 'GPT-4.1',                   provider: 'OpenAI',    inputPer1M: 2.00,   outputPer1M: 8.00   },
  { id: 'gpt-4o-mini',              label: 'GPT-4o mini',               provider: 'OpenAI',    inputPer1M: 0.15,   outputPer1M: 0.60   },
  { id: 'gpt-4o',                   label: 'GPT-4o',                    provider: 'OpenAI',    inputPer1M: 2.50,   outputPer1M: 10.00  },
  { id: 'gpt-4-turbo',              label: 'GPT-4 Turbo',               provider: 'OpenAI',    inputPer1M: 10.00,  outputPer1M: 30.00  },
  { id: 'o1-mini',                  label: 'o1-mini',                   provider: 'OpenAI',    inputPer1M: 1.10,   outputPer1M: 4.40   },
  { id: 'o1',                       label: 'o1',                        provider: 'OpenAI',    inputPer1M: 15.00,  outputPer1M: 60.00  },
  { id: 'o3-mini',                  label: 'o3-mini',                   provider: 'OpenAI',    inputPer1M: 1.10,   outputPer1M: 4.40   },
  { id: 'o3',                       label: 'o3',                        provider: 'OpenAI',    inputPer1M: 10.00,  outputPer1M: 40.00  },
  { id: 'o4-mini',                  label: 'o4-mini',                   provider: 'OpenAI',    inputPer1M: 1.10,   outputPer1M: 4.40   },
  // ── Google ─────────────────────────────────────────────────
  { id: 'gemini-1.5-flash-8b',      label: 'Gemini 1.5 Flash 8B',       provider: 'Google',    inputPer1M: 0.0375, outputPer1M: 0.15   },
  { id: 'gemini-1.5-flash',         label: 'Gemini 1.5 Flash',          provider: 'Google',    inputPer1M: 0.075,  outputPer1M: 0.30   },
  { id: 'gemini-1.5-pro',           label: 'Gemini 1.5 Pro',            provider: 'Google',    inputPer1M: 1.25,   outputPer1M: 5.00   },
  { id: 'gemini-2.0-flash-lite',    label: 'Gemini 2.0 Flash Lite',     provider: 'Google',    inputPer1M: 0.075,  outputPer1M: 0.30   },
  { id: 'gemini-2.0-flash',         label: 'Gemini 2.0 Flash',          provider: 'Google',    inputPer1M: 0.10,   outputPer1M: 0.40   },
  { id: 'gemini-2.5-flash',         label: 'Gemini 2.5 Flash',          provider: 'Google',    inputPer1M: 0.15,   outputPer1M: 0.60   },
  { id: 'gemini-2.5-pro',           label: 'Gemini 2.5 Pro',            provider: 'Google',    inputPer1M: 1.25,   outputPer1M: 10.00  },
  // ── xAI ────────────────────────────────────────────────────
  { id: 'grok-2-mini',              label: 'Grok 2 mini',               provider: 'xAI',       inputPer1M: 0.20,   outputPer1M: 0.40   },
  { id: 'grok-2',                   label: 'Grok 2',                    provider: 'xAI',       inputPer1M: 2.00,   outputPer1M: 10.00  },
  { id: 'grok-3-mini',              label: 'Grok 3 mini',               provider: 'xAI',       inputPer1M: 0.30,   outputPer1M: 0.50   },
  { id: 'grok-3',                   label: 'Grok 3',                    provider: 'xAI',       inputPer1M: 3.00,   outputPer1M: 15.00  },
  { id: 'grok-3-mini-fast',         label: 'Grok 3 mini Fast',          provider: 'xAI',       inputPer1M: 0.60,   outputPer1M: 4.00   },
  { id: 'grok-3-fast',              label: 'Grok 3 Fast',               provider: 'xAI',       inputPer1M: 5.00,   outputPer1M: 25.00  },
  // ── DeepSeek ───────────────────────────────────────────────
  { id: 'deepseek-r1-distill-qwen', label: 'DeepSeek R1 Distill Qwen',  provider: 'DeepSeek',  inputPer1M: 0.14,   outputPer1M: 0.55   },
  { id: 'deepseek-r1-distill-llama',label: 'DeepSeek R1 Distill Llama', provider: 'DeepSeek',  inputPer1M: 0.14,   outputPer1M: 0.55   },
  { id: 'deepseek-r1',              label: 'DeepSeek R1',               provider: 'DeepSeek',  inputPer1M: 0.55,   outputPer1M: 2.19   },
  { id: 'deepseek-v3',              label: 'DeepSeek V3',               provider: 'DeepSeek',  inputPer1M: 0.27,   outputPer1M: 1.10   },
  { id: 'deepseek-v2.5',            label: 'DeepSeek V2.5',             provider: 'DeepSeek',  inputPer1M: 0.14,   outputPer1M: 0.28   },
  // ── Mistral ────────────────────────────────────────────────
  { id: 'mistral-small-3.1',        label: 'Mistral Small 3.1',         provider: 'Mistral',   inputPer1M: 0.10,   outputPer1M: 0.30   },
  { id: 'mistral-small',            label: 'Mistral Small',             provider: 'Mistral',   inputPer1M: 0.10,   outputPer1M: 0.30   },
  { id: 'codestral',                label: 'Codestral',                 provider: 'Mistral',   inputPer1M: 0.30,   outputPer1M: 0.90   },
  { id: 'devstral',                 label: 'Devstral',                  provider: 'Mistral',   inputPer1M: 0.30,   outputPer1M: 0.90   },
  { id: 'mistral-medium',           label: 'Mistral Medium 3',          provider: 'Mistral',   inputPer1M: 0.40,   outputPer1M: 2.00   },
  { id: 'mistral-large',            label: 'Mistral Large',             provider: 'Mistral',   inputPer1M: 2.00,   outputPer1M: 6.00   },
  { id: 'pixtral-12b',              label: 'Pixtral 12B',               provider: 'Mistral',   inputPer1M: 0.15,   outputPer1M: 0.15   },
  { id: 'pixtral-large',            label: 'Pixtral Large',             provider: 'Mistral',   inputPer1M: 2.00,   outputPer1M: 6.00   },
  { id: 'mixtral-8x7b',             label: 'Mixtral 8×7B',              provider: 'Mistral',   inputPer1M: 0.70,   outputPer1M: 0.70   },
  { id: 'mixtral-8x22b',            label: 'Mixtral 8×22B',             provider: 'Mistral',   inputPer1M: 2.00,   outputPer1M: 6.00   },
  // ── Meta (via Groq) ────────────────────────────────────────
  { id: 'llama-3.1-8b-groq',        label: 'Llama 3.1 8B',              provider: 'Groq',      inputPer1M: 0.05,   outputPer1M: 0.08   },
  { id: 'llama-3.1-70b-groq',       label: 'Llama 3.1 70B',             provider: 'Groq',      inputPer1M: 0.59,   outputPer1M: 0.79   },
  { id: 'llama-3.3-70b-groq',       label: 'Llama 3.3 70B',             provider: 'Groq',      inputPer1M: 0.59,   outputPer1M: 0.79   },
  { id: 'llama-4-scout-groq',        label: 'Llama 4 Scout',            provider: 'Groq',      inputPer1M: 0.11,   outputPer1M: 0.34   },
  { id: 'llama-4-maverick-groq',     label: 'Llama 4 Maverick',         provider: 'Groq',      inputPer1M: 0.50,   outputPer1M: 0.77   },
  { id: 'deepseek-r1-distill-groq',  label: 'DeepSeek R1 Distill 70B',  provider: 'Groq',      inputPer1M: 0.75,   outputPer1M: 0.99   },
  { id: 'gemma2-9b-groq',            label: 'Gemma 2 9B',               provider: 'Groq',      inputPer1M: 0.20,   outputPer1M: 0.20   },
  { id: 'mixtral-8x7b-groq',         label: 'Mixtral 8×7B',             provider: 'Groq',      inputPer1M: 0.24,   outputPer1M: 0.24   },
  // ── Cohere ─────────────────────────────────────────────────
  { id: 'command-r7b',              label: 'Command R 7B',              provider: 'Cohere',    inputPer1M: 0.0375, outputPer1M: 0.15   },
  { id: 'command-r',                label: 'Command R',                 provider: 'Cohere',    inputPer1M: 0.15,   outputPer1M: 0.60   },
  { id: 'command-r-plus',           label: 'Command R+',                provider: 'Cohere',    inputPer1M: 2.50,   outputPer1M: 10.00  },
  { id: 'command-a',                label: 'Command A',                 provider: 'Cohere',    inputPer1M: 2.50,   outputPer1M: 10.00  },
  // ── Amazon ─────────────────────────────────────────────────
  { id: 'nova-micro',               label: 'Nova Micro',                provider: 'Amazon',    inputPer1M: 0.035,  outputPer1M: 0.14   },
  { id: 'nova-lite',                label: 'Nova Lite',                 provider: 'Amazon',    inputPer1M: 0.06,   outputPer1M: 0.24   },
  { id: 'nova-pro',                 label: 'Nova Pro',                  provider: 'Amazon',    inputPer1M: 0.80,   outputPer1M: 3.20   },
  // ── Perplexity ─────────────────────────────────────────────
  { id: 'sonar',                    label: 'Sonar',                     provider: 'Perplexity',inputPer1M: 1.00,   outputPer1M: 1.00   },
  { id: 'sonar-pro',                label: 'Sonar Pro',                 provider: 'Perplexity',inputPer1M: 3.00,   outputPer1M: 15.00  },
  { id: 'sonar-reasoning',          label: 'Sonar Reasoning',           provider: 'Perplexity',inputPer1M: 1.00,   outputPer1M: 5.00   },
  { id: 'sonar-reasoning-pro',      label: 'Sonar Reasoning Pro',       provider: 'Perplexity',inputPer1M: 2.00,   outputPer1M: 8.00   },
  // ── Together AI ────────────────────────────────────────────
  { id: 'llama-3.1-405b-together',  label: 'Llama 3.1 405B',           provider: 'Together',  inputPer1M: 3.50,   outputPer1M: 3.50   },
  { id: 'qwen2.5-72b-together',     label: 'Qwen 2.5 72B',             provider: 'Together',  inputPer1M: 1.20,   outputPer1M: 1.20   },
  { id: 'deepseek-v3-together',     label: 'DeepSeek V3',               provider: 'Together',  inputPer1M: 1.25,   outputPer1M: 1.25   },
];

export const DEFAULT_PRICING_ID = 'gpt-4o-mini';

export function calcCost(inputTokens: number, outputTokens: number, model: PricingModel): number {
  return (
    (inputTokens  / 1_000_000) * model.inputPer1M +
    (outputTokens / 1_000_000) * model.outputPer1M
  );
}
