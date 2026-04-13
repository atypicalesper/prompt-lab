import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { OllamaClient } from './ollama.client';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [LoggingModule],
  controllers: [LlmController],
  providers: [LlmService, OllamaClient],
})
export class LlmModule {}
