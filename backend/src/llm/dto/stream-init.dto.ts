import { IsString, IsOptional, IsNumber, Min, Max, MinLength, MaxLength } from 'class-validator';
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

  @ApiPropertyOptional({ example: 0.7, description: 'Sampling temperature (0–2)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiPropertyOptional({ example: 0.9, description: 'Top-p nucleus sampling (0–1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  topP?: number;

  @ApiPropertyOptional({ example: 40, description: 'Top-k sampling' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  topK?: number;

  @ApiPropertyOptional({ example: 512, description: 'Max tokens to generate (-1 = unlimited)' })
  @IsOptional()
  @IsNumber()
  @Min(-1)
  numPredict?: number;
}
