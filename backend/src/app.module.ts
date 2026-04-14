import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LlmModule } from './llm/llm.module';
import { HardwareModule } from './hardware/hardware.module';
import { LoggingModule } from './logging/logging.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    LlmModule,
    HardwareModule,
    LoggingModule,
    TemplatesModule,
  ],
})
export class AppModule {}
