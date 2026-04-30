import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { FindVehicleQryDto } from './dto/find-vehicle-qry.dto';
import { AssignOwnerDto } from './dto/assign-owner.dto';
import { PrismaService } from '@/core/prisma/prisma.service';
import { Prisma } from '@/generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosError } from 'axios';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

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
      const newVehicle = await this.prisma.vehiculo.create({ data: dto });

      return newVehicle;
    } catch (error) {
      this.logger.warn(`Error al crear vehiculo: ${dto.placa}`, error);
      throw new InternalServerErrorException('Ocurrio un error interno');
    }
  }

  async getAllVehicles(qry: FindVehicleQryDto) {
    const { page = 1, limit = 5, search } = qry;
    const skip = (page - 1) * limit;

    const where: Prisma.VehiculoWhereInput = search
      ? { placa: { contains: search, mode: 'insensitive' } }
      : {};

    const [total, vehicles] = await Promise.all([
      this.prisma.vehiculo.count({ where }),
      this.prisma.vehiculo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: { personas: { include: { persona: true } } },
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
      include: {
        personas: {
          include: {
            persona: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehiculo no encontrado');
    }

    return vehicle;
  }

  async assignOwner(vehiculoId: string, assignOwnerDto: AssignOwnerDto) {
    const { personaId } = assignOwnerDto;

    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
    });

    if (!vehiculo) {
      throw new NotFoundException('El vehículo no existe.');
    }

    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId },
    });

    if (!persona) {
      throw new NotFoundException('La persona no existe.');
    }

    const vinculacionExistente = await this.prisma.vehiculoPersona.findUnique({
      where: {
        vehiculoId_personaId: {
          vehiculoId: vehiculoId,
          personaId: personaId,
        },
      },
    });

    if (vinculacionExistente) {
      throw new ConflictException(
        'Esta persona ya está registrada como propietaria de este vehículo.',
      );
    }

    try {
      const nuevaVinculacion = await this.prisma.vehiculoPersona.create({
        data: {
          vehiculoId: vehiculoId,
          personaId: personaId,
        },
        include: {
          persona: {
            select: {
              dni: true,
              nombreCompleto: true,
              rol: true,
            },
          },
          vehiculo: {
            select: {
              placa: true,
              marca: true,
            },
          },
        },
      });

      return nuevaVinculacion;
    } catch (error) {
      this.logger.error('Error al vincular vehiculo', error);
      throw new InternalServerErrorException('Ocurrio un error interno');
    }
  }

  async searchVehicleApi(placa: string) {
    const vehicleDb = await this.prisma.vehiculo.findUnique({
      where: { placa },
    });

    if (vehicleDb) {
      throw new ConflictException('La placa ya esta registrada');
    }

    const apiToken = this.configService.getOrThrow<string>('TOKEN_JSON_API');
    const urlApi = this.configService.getOrThrow<string>('URL_PLACA_API');

    try {
      const response = await axios.post(
        urlApi,
        { placa },
        { headers: { Authorization: `Bearer ${apiToken}` } },
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.status == 400) {
          throw new BadRequestException(error.response?.data.message);
        }
        if (error.status == 401) {
          throw new UnauthorizedException(error.response?.data.message);
        }

        if (error.status == 404) {
          throw new NotFoundException(error.response?.data.message);
        }
      } else {
        this.logger.error('Error al llamar Api externa', error);
        throw new InternalServerErrorException('Ocurrio un error interno');
      }
    }
  }
}
