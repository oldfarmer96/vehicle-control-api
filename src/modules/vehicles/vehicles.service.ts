import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { FindVehicleQryDto } from './dto/find-vehicle-qry.dto';
import { Prisma } from '@src/generated/prisma/client';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createVehicle(dto: CreateVehicleDto) {
    const vehicleFind = await this.prisma.vehiculo.findUnique({
      where: {
        placa: dto.placa,
      },
    });

    if (vehicleFind) {
      throw new ConflictException('La placa ya esta registrada');
    }

    try {
      const newVehicle = await this.prisma.vehiculo.create({
        data: dto,
      });

      return newVehicle;
    } catch (error) {
      this.logger.warn(`Error al crear vehiculo: ${dto.placa}`, error);
      throw new InternalServerErrorException('Error interno');
    }
  }

  async getAllVehicles(qry: FindVehicleQryDto) {
    const { page = 1, limit = 5, search } = qry;
    const skip = (page - 1) * limit;

    const where: Prisma.VehiculoWhereInput = search
      ? {
          placa: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const [total, vehicles] = await Promise.all([
      this.prisma.vehiculo.count({ where }),
      this.prisma.vehiculo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const lastPage = Math.ceil(total / limit);
    const next = page < lastPage ? page + 1 : null;
    const prev = page > 1 ? page - 1 : null;

    return {
      data: vehicles,
      meta: {
        total,
        isEmpty: total == 0,
        page,
        limit,
        lastPage,
        hasNext: page < lastPage,
        hasPrev: page > 1,
        nextPage: next,
        prevPage: prev,
      },
    };
  }

  async getVehicleByPlaca(placa: string) {
    const vehicle = await this.prisma.vehiculo.findUnique({
      where: { placa },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehiculo no encontrado');
    }

    return vehicle;
  }
}
