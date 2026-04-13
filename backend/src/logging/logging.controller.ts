import { Controller, Get, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LoggingService } from './logging.service';

@ApiTags('Logs')
@Controller('logs')
export class LoggingController {
  constructor(private readonly logging: LoggingService) {}

  @Get()
  @ApiOperation({ summary: 'Paginated request history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.logging.findAll(Number(page), Number(limit));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Aggregate stats across all requests' })
  getStats() {
    return this.logging.getStats();
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all request logs' })
  deleteAll() {
    return this.logging.deleteAll();
  }
}
