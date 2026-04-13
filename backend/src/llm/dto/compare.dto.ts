import { IsString, IsArray, ArrayMinSize, ArrayMaxSize, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompareDto {
  @ApiProperty({ example: ['llama3.2', 'mistral'], description: 'Models to compare (max 4)' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  models: string[];

  @ApiProperty({ example: 'What is gradient descent?' })
  @IsString()
  @MaxLength(32_000)
  prompt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4_000)
  systemPrompt?: string;
}
