import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HardwareService } from './hardware.service';

@ApiTags('Hardware')
@Controller('hardware')
export class HardwareController {
  constructor(private readonly hardware: HardwareService) {}

  @Get()
  @ApiOperation({ summary: 'Current CPU / RAM / GPU snapshot' })
  getSnapshot() {
    return this.hardware.getSnapshot();
  }
}
