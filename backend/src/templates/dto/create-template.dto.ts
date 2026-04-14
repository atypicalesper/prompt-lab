import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Code Reviewer' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Review this code for issues: {{code}}' })
  @IsString()
  @MinLength(1)
  @MaxLength(32_000)
  prompt: string;

  @ApiPropertyOptional({ example: 'You are an expert coder.' })
  @IsOptional()
  @IsString()
  @MaxLength(4_000)
  systemPrompt?: string;
}
