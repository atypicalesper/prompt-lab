import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, Subject } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { OllamaClient } from './ollama.client';
import { LoggingService } from '../logging/logging.service';
import { StreamInitDto } from './dto/stream-init.dto';
import { CompareDto } from './dto/compare.dto';
import { AbTestDto } from './dto/ab-test.dto';
import {
  countTokens,
  getContextWindow,
  simulateCost,
} from '../common/utils/token-counter';

// Per-session state stored in memory with TTL cleanup
interface Session {
  id: string;
  params: StreamInitDto;
  createdAt: number;
}

export interface StreamTokenEvent {
  type: 'token';
  token: string;
  index: number;
}

export interface StreamMetricsEvent {
  type: 'metrics';
  ttft: number | null;
  outputTokens: number;
  tokensPerSec: number;
  elapsedMs: number;
}

export interface StreamDoneEvent {
  type: 'done';
  ttft: number;
  totalMs: number;
  inputTokens: number;
  outputTokens: number;
  tokensPerSec: number;
  contextWindow: number;
  contextUsagePct: number;
  estimatedCostUsd: number;
  response: string;
}

export interface StreamErrorEvent {
  type: 'error';
  message: string;
}

export type SsePayload =
  | StreamTokenEvent
  | StreamMetricsEvent
  | StreamDoneEvent
  | StreamErrorEvent;

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly sessions = new Map<string, Session>();

  constructor(
    private readonly ollama: OllamaClient,
    private readonly logging: LoggingService,
  ) {
    // Clean up sessions older than 5 minutes every minute
    setInterval(() => this.pruneSessions(), 60_000);
  }

  listModels() {
    return this.ollama.listModels();
  }

  initSession(dto: StreamInitDto): { sessionId: string } {
    const sessionId = randomUUID();
    this.sessions.set(sessionId, { id: sessionId, params: dto, createdAt: Date.now() });
    return { sessionId };
  }

  // Returns an RxJS Observable that bridges the async Ollama generator to NestJS SSE
  streamSession(sessionId: string): Observable<MessageEvent> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new NotFoundException('Session not found or expired');

    this.sessions.delete(sessionId); // single-use

    return new Observable<MessageEvent>((subscriber) => {
      void this.runStream(session, subscriber);
    });
  }

  private async runStream(
    session: Session,
    subscriber: {
      next: (event: MessageEvent) => void;
      error: (err: unknown) => void;
      complete: () => void;
    },
  ) {
    const { params } = session;
    const startMs = Date.now();
    let firstTokenMs: number | null = null;
    let outputTokenIndex = 0;
    let fullResponse = '';

    const emit = (type: string, data: SsePayload) =>
      subscriber.next({ data, type } as MessageEvent);

    try {
      for await (const chunk of this.ollama.generateStream({
        model:  params.model,
        prompt: params.prompt,
        system: params.systemPrompt,
      })) {
        if (!chunk.done && chunk.response) {
          if (firstTokenMs === null) firstTokenMs = Date.now() - startMs;

          outputTokenIndex++;
          fullResponse += chunk.response;

          emit('token', {
            type:  'token',
            token: chunk.response,
            index: outputTokenIndex,
          } satisfies StreamTokenEvent);

          // Emit live metrics every 5 tokens
          if (outputTokenIndex % 5 === 0) {
            const elapsedMs  = Date.now() - startMs;
            const elapsedSec = elapsedMs / 1000;
            emit('metrics', {
              type:        'metrics',
              ttft:        firstTokenMs,
              outputTokens: outputTokenIndex,
              tokensPerSec: elapsedSec > 0 ? outputTokenIndex / elapsedSec : 0,
              elapsedMs,
            } satisfies StreamMetricsEvent);
          }
        }

        if (chunk.done) {
          const totalMs      = Date.now() - startMs;
          const inputTokens  = chunk.prompt_eval_count ?? countTokens(params.prompt);
          const outputTokens = chunk.eval_count ?? outputTokenIndex;
          const evalSec      = (chunk.eval_duration ?? 0) / 1e9;
          const tokensPerSec = evalSec > 0 ? outputTokens / evalSec : outputTokenIndex / (totalMs / 1000);
          const contextWindow    = getContextWindow(params.model);
          const totalTokens      = inputTokens + outputTokens;
          const contextUsagePct  = (totalTokens / contextWindow) * 100;
          const estimatedCostUsd = simulateCost(inputTokens, outputTokens);

          emit('done', {
            type: 'done',
            ttft:             firstTokenMs ?? totalMs,
            totalMs,
            inputTokens,
            outputTokens,
            tokensPerSec,
            contextWindow,
            contextUsagePct:  Math.min(contextUsagePct, 100),
            estimatedCostUsd,
            response:         fullResponse,
          } satisfies StreamDoneEvent);

          // Persist to DB in the background
          void this.logging.save({
            model:          params.model,
            systemPrompt:   params.systemPrompt,
            prompt:         params.prompt,
            response:       fullResponse,
            inputTokens,
            outputTokens,
            totalTokens,
            ttft:           firstTokenMs ?? totalMs,
            totalTime:      totalMs,
            tokensPerSec,
            contextWindow,
            contextUsagePct: Math.min(contextUsagePct, 100),
            estimatedCostUsd,
          });
        }
      }

      subscriber.complete();
    } catch (err) {
      this.logger.error('Stream error', err);
      emit('error', { type: 'error', message: String(err) } satisfies StreamErrorEvent);
      subscriber.complete();
    }
  }

  // Run same prompt across multiple models concurrently and return metrics for each
  async compare(dto: CompareDto) {
    const results = await Promise.allSettled(
      dto.models.map(async (model) => {
        const start  = Date.now();
        const result = await this.ollama.generateComplete({
          model,
          prompt: dto.prompt,
          system: dto.systemPrompt,
        });
        const totalMs      = Date.now() - start;
        const contextWindow   = getContextWindow(model);
        const totalTokens     = result.inputTokens + result.outputTokens;
        const contextUsagePct = (totalTokens / contextWindow) * 100;
        const tokensPerSec    = result.evalDurationMs > 0
          ? result.outputTokens / (result.evalDurationMs / 1000)
          : 0;

        return {
          model,
          response:        result.response,
          inputTokens:     result.inputTokens,
          outputTokens:    result.outputTokens,
          totalTokens,
          totalMs,
          loadMs:          result.loadDurationMs,
          inferenceMs:     result.evalDurationMs,
          tokensPerSec,
          contextWindow,
          contextUsagePct: Math.min(contextUsagePct, 100),
          estimatedCostUsd: simulateCost(result.inputTokens, result.outputTokens),
        };
      }),
    );

    return results.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : { model: dto.models[i], error: String((r as PromiseRejectedResult).reason) },
    );
  }

  // Run two prompts against one model concurrently
  async abTest(dto: AbTestDto) {
    const [a, b] = await Promise.all([
      this.runSingle(dto.model, dto.promptA, dto.systemPrompt),
      this.runSingle(dto.model, dto.promptB, dto.systemPrompt),
    ]);
    return { a: { label: 'Prompt A', prompt: dto.promptA, ...a }, b: { label: 'Prompt B', prompt: dto.promptB, ...b } };
  }

  private async runSingle(model: string, prompt: string, systemPrompt?: string) {
    const start  = Date.now();
    const result = await this.ollama.generateComplete({ model, prompt, system: systemPrompt });
    const totalMs      = Date.now() - start;
    const contextWindow   = getContextWindow(model);
    const totalTokens     = result.inputTokens + result.outputTokens;
    const contextUsagePct = (totalTokens / contextWindow) * 100;
    const tokensPerSec    = result.evalDurationMs > 0
      ? result.outputTokens / (result.evalDurationMs / 1000)
      : 0;

    return {
      response:        result.response,
      inputTokens:     result.inputTokens,
      outputTokens:    result.outputTokens,
      totalTokens,
      totalMs,
      tokensPerSec,
      contextWindow,
      contextUsagePct: Math.min(contextUsagePct, 100),
      estimatedCostUsd: simulateCost(result.inputTokens, result.outputTokens),
    };
  }

  private pruneSessions() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.createdAt > 5 * 60_000) this.sessions.delete(id);
    }
  }
}
