import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from './core/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: true,
        db: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      throw new InternalServerErrorException('unusable server');
    }
  }
}
