import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prompt template' })
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all prompt templates' })
  findAll() {
    return this.templatesService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prompt template by ID' })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
