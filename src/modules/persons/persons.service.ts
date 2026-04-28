import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { FindPersonsQryDto } from './dto/find-persons-qry.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PrismaService } from '@/core/prisma/prisma.service';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class PersonsService {
  private readonly logger = new Logger(PersonsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createPerson(dto: CreatePersonDto) {
    const personFound = await this.prisma.persona.findUnique({
      where: { dni: dto.dni },
    });

    if (personFound) {
      throw new ConflictException('DNI ya esta registrado');
    }

    try {
      const newPerson = await this.prisma.persona.create({ data: dto });

      return newPerson;
    } catch (error) {
      this.logger.warn(
        `Error al crear la persona ${dto.nombreCompleto}`,
        error,
      );
      throw new InternalServerErrorException('Ocurrio un error interno');
    }
  }

  async getAllPersons(qry: FindPersonsQryDto) {
    const { page = 1, limit = 5, search } = qry;
    const skip = (page - 1) * limit;

    const where: Prisma.PersonaWhereInput = search
      ? {
          OR: [
            { nombreCompleto: { contains: search, mode: 'insensitive' } },
            { dni: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, persons] = await Promise.all([
      this.prisma.persona.count({ where }),
      this.prisma.persona.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: { vehiculos: { include: { vehiculo: true } } },
      }),
    ]);

    const lastPage = Math.ceil(total / limit);
    const next = page < lastPage ? page + 1 : null;
    const prev = page > 1 ? page - 1 : null;

    return {
      data: persons,
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

  async updateAccessStatus(id: string, status: boolean) {
    const personFound = await this.prisma.persona.findUnique({ where: { id } });

    if (!personFound) throw new NotFoundException('persona no encontrada');

    try {
      const updatedPersona = await this.prisma.persona.update({
        where: { id },
        data: { tieneAccesoPermitido: status },
      });

      return updatedPersona;
    } catch (error) {
      this.logger.error('Error al actulizar estado de la persona', error);
      throw new InternalServerErrorException('Ocurrio un error interno');
    }
  }

  async updatePerson(id: string, dto: UpdatePersonDto) {
    const personFind = await this.prisma.persona.findUnique({ where: { id } });

    if (!personFind) {
      throw new NotFoundException('persona no econtrada');
    }

    if (dto.dni && dto.dni !== personFind.dni) {
      const dniExists = await this.prisma.persona.findUnique({
        where: { dni: dto.dni },
      });

      if (dniExists) throw new ConflictException('El DNI ya esta en uso');
    }

    try {
      const personUpdate = await this.prisma.persona.update({
        where: { id },
        data: dto,
      });

      return personUpdate;
    } catch (error) {
      this.logger.error('Error al actulizar persona', error);
      throw new InternalServerErrorException('Ocurrio un error interno');
    }
  }
}
