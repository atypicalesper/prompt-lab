import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AbTestDto {
  @ApiProperty({ example: 'llama3.2' })
  @IsString()
  model: string;

  @ApiProperty({ example: 'Explain neural networks in simple terms.' })
  @IsString()
  @MinLength(1)
  @MaxLength(32_000)
  promptA: string;

  @ApiProperty({ example: 'Describe how neural networks work step by step.' })
  @IsString()
  @MinLength(1)
  @MaxLength(32_000)
  promptB: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4_000)
  systemPrompt?: string;
}
