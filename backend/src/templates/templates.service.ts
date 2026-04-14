import { Injectable, OnModuleInit, Logger, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(TemplatesService.name);

  async onModuleInit() {
    await this.$connect();
  }

  async create(dto: CreateTemplateDto) {
    try {
      return await this.promptTemplate.create({ data: dto });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException(`Template named "${dto.name}" already exists.`);
      }
      throw err;
    }
  }

  async findAll() {
    return this.promptTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    await this.promptTemplate.delete({ where: { id } });
  }
}
