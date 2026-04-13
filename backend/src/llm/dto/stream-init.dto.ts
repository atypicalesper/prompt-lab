import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StreamInitDto {
  @ApiProperty({ example: 'llama3.2' })
  @IsString()
  model: string;

  @ApiProperty({ example: 'Explain how HNSW indexing works.' })
  @IsString()
  @MinLength(1)
  @MaxLength(32_000)
  prompt: string;

  @ApiPropertyOptional({ example: 'You are a concise technical assistant.' })
  @IsOptional()
  @IsString()
  @MaxLength(4_000)
  systemPrompt?: string;
}
