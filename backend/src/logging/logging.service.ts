import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

interface SaveParams {
  model: string;
  systemPrompt?: string;
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  ttft: number;
  totalTime: number;
  tokensPerSec: number;
  contextWindow: number;
  contextUsagePct: number;
  estimatedCostUsd: number;
}

@Injectable()
export class LoggingService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(LoggingService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to SQLite database');
  }

  async save(params: SaveParams) {
    try {
      await this.requestLog.create({ data: params });
    } catch (err) {
      this.logger.error('Failed to persist request log', err);
    }
  }

  async findAll(page = 1, limit = 20) {
    const skip  = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.requestLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.requestLog.count(),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async deleteAll() {
    await this.requestLog.deleteMany();
  }

  async getStats() {
    const [count, agg] = await Promise.all([
      this.requestLog.count(),
      this.requestLog.aggregate({
        _avg: { totalTime: true, tokensPerSec: true, estimatedCostUsd: true },
        _sum: { totalTokens: true, estimatedCostUsd: true },
      }),
    ]);
    return {
      totalRequests:    count,
      totalTokens:      agg._sum.totalTokens ?? 0,
      totalCostUsd:     agg._sum.estimatedCostUsd ?? 0,
      avgLatencyMs:     agg._avg.totalTime ?? 0,
      avgTokensPerSec:  agg._avg.tokensPerSec ?? 0,
    };
  }
}
