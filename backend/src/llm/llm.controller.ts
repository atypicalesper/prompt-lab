import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Sse,
  MessageEvent,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { LlmService } from './llm.service';
import { StreamInitDto } from './dto/stream-init.dto';
import { CompareDto } from './dto/compare.dto';
import { AbTestDto } from './dto/ab-test.dto';
import { LatencyInterceptor } from '../common/interceptors/latency.interceptor';

@ApiTags('LLM')
@UseInterceptors(LatencyInterceptor)
@Controller('llm')
export class LlmController {
  constructor(private readonly llm: LlmService) {}

  @Get('models')
  @ApiOperation({ summary: 'List installed Ollama models' })
  listModels() {
    return this.llm.listModels();
  }

  @Post('stream/init')
  @ApiOperation({ summary: 'Create a streaming session; returns sessionId' })
  initStream(@Body() dto: StreamInitDto) {
    return this.llm.initSession(dto);
  }

  // SSE endpoint — client opens this after receiving sessionId
  @Sse('stream/:sessionId')
  @ApiOperation({ summary: 'SSE stream for a previously initialised session' })
  stream(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    return this.llm.streamSession(sessionId);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Run same prompt across multiple models, return comparison' })
  compare(@Body() dto: CompareDto) {
    return this.llm.compare(dto);
  }

  @Post('ab-test')
  @ApiOperation({ summary: 'Run two prompts against one model, return side-by-side comparison' })
  abTest(@Body() dto: AbTestDto) {
    return this.llm.abTest(dto);
  }
}
