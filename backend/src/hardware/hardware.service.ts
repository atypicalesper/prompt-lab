import { Injectable, Logger } from '@nestjs/common';
import si from 'systeminformation';

export interface HardwareSnapshot {
  cpu: {
    usagePct: number;
    cores: number;
    speed: number;
    model: string;
  };
  memory: {
    totalGb: number;
    usedGb: number;
    freeGb: number;
    usagePct: number;
  };
  gpu: {
    available: boolean;
    model: string;
    vramTotalMb: number;
    vramUsedMb: number;
    usagePct: number;
  } | null;
  ollamaRunningOnGpu: boolean;
}

@Injectable()
export class HardwareService {
  private readonly logger = new Logger(HardwareService.name);

  async getSnapshot(): Promise<HardwareSnapshot> {
    const [cpuLoad, cpuData, mem, gpuData] = await Promise.all([
      si.currentLoad(),
      si.cpu(),
      si.mem(),
      si.graphics().catch(() => null),
    ]);

    const toGb = (bytes: number) => Math.round((bytes / 1024 ** 3) * 100) / 100;

    const gpu = gpuData?.controllers?.[0]
      ? {
          available:    true,
          model:        gpuData.controllers[0].model ?? 'Unknown GPU',
          vramTotalMb:  gpuData.controllers[0].vram ?? 0,
          vramUsedMb:   gpuData.controllers[0].memoryUsed ?? 0,
          usagePct:     gpuData.controllers[0].utilizationGpu ?? 0,
        }
      : null;

    // Heuristic: if GPU VRAM usage > 500 MB, Ollama is likely on GPU
    const ollamaRunningOnGpu = !!gpu && gpu.vramUsedMb > 500;

    return {
      cpu: {
        usagePct: Math.round(cpuLoad.currentLoad),
        cores:    cpuData.cores,
        speed:    cpuData.speed,
        model:    cpuData.brand,
      },
      memory: {
        totalGb:  toGb(mem.total),
        usedGb:   toGb(mem.used),
        freeGb:   toGb(mem.free),
        usagePct: Math.round((mem.used / mem.total) * 100),
      },
      gpu,
      ollamaRunningOnGpu,
    };
  }
}
