import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OllamaStreamChunk {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  // Present only on the final chunk (done: true)
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details: {
    parameter_size: string;
    quantization_level: string;
  };
}

export interface GenerateParams {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  numPredict?: number;
  numCtx?: number;
}

@Injectable()
export class OllamaClient {
  private readonly logger = new Logger(OllamaClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = config.get('OLLAMA_BASE_URL') ?? 'http://localhost:11434';
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (!res.ok) throw new Error(`Ollama responded ${res.status}`);
      const data = await res.json() as { models: OllamaModel[] };
      return data.models ?? [];
    } catch (err) {
      const cause = err instanceof Error ? ((err as Error & { cause?: Error }).cause) : undefined;
      this.logger.error(
        `Failed to fetch Ollama models from ${this.baseUrl} — ${cause?.message ?? String(err)}`,
      );
      throw new ServiceUnavailableException('Cannot reach Ollama. Is it running?');
    }
  }

  // Async generator: yields parsed OllamaStreamChunk objects as they arrive.
  // The final chunk has done: true and contains timing/token metadata.
  async *generateStream(params: GenerateParams): AsyncGenerator<OllamaStreamChunk> {
    let response: Response;
    try {
      const options: Record<string, number> = {};
      if (params.temperature !== undefined) options['temperature'] = params.temperature;
      if (params.topP        !== undefined) options['top_p']       = params.topP;
      if (params.topK        !== undefined) options['top_k']       = params.topK;
      if (params.numPredict  !== undefined) options['num_predict'] = params.numPredict;
      if (params.numCtx      !== undefined) options['num_ctx']     = params.numCtx;

      response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:   params.model,
          prompt:  params.prompt,
          system:  params.system,
          stream:  true,
          ...(Object.keys(options).length > 0 ? { options } : {}),
        }),
      });
    } catch (err) {
      const cause = err instanceof Error ? ((err as Error & { cause?: Error }).cause) : undefined;
      this.logger.error(
        `Ollama generate request failed (${this.baseUrl}) — ${cause?.message ?? String(err)}`,
      );
      throw new ServiceUnavailableException('Cannot reach Ollama. Is it running?');
    }

    if (!response.ok) {
      const body = await response.text();
      throw new ServiceUnavailableException(`Ollama error ${response.status}: ${body}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          yield JSON.parse(trimmed) as OllamaStreamChunk;
        } catch {
          this.logger.warn(`Could not parse Ollama chunk: ${trimmed}`);
        }
      }
    }
  }

  // Convenience: collect full response without streaming
  async generateComplete(params: GenerateParams): Promise<{
    response: string;
    inputTokens: number;
    outputTokens: number;
    totalDurationMs: number;
    evalDurationMs: number;
    loadDurationMs: number;
  }> {
    let fullResponse = '';
    let finalChunk: OllamaStreamChunk | null = null;

    for await (const chunk of this.generateStream(params)) {
      if (!chunk.done) {
        fullResponse += chunk.response;
      } else {
        finalChunk = chunk;
      }
    }

    return {
      response:       fullResponse,
      inputTokens:    finalChunk?.prompt_eval_count ?? 0,
      outputTokens:   finalChunk?.eval_count ?? 0,
      totalDurationMs: Math.round((finalChunk?.total_duration ?? 0) / 1e6),
      evalDurationMs:  Math.round((finalChunk?.eval_duration ?? 0) / 1e6),
      loadDurationMs:  Math.round((finalChunk?.load_duration ?? 0) / 1e6),
    };
  }
}
