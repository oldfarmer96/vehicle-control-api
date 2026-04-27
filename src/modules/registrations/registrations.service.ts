import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFullRegistrationDto } from './dto/create-full-registration.dto';
import { PrismaService } from '@/core/prisma/prisma.service';

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerFull(dto: CreateFullRegistrationDto) {
    const { persona, vehiculo } = dto;

    return this.prisma.$transaction(async (tx) => {
      const existingVehicle = await tx.vehiculo.findUnique({
        where: { placa: vehiculo.placa },
      });

      if (existingVehicle) {
        throw new BadRequestException(
          `El vehículo con placa ${vehiculo.placa} ya está registrado. Use el módulo de asignación.`,
        );
      }

      let personaRecord = await tx.persona.findUnique({
        where: { dni: persona.dni },
      });

      if (!personaRecord) {
        personaRecord = await tx.persona.create({
          data: {
            dni: persona.dni,
            nombreCompleto: persona.nombreCompleto,
            rol: persona.rol,
            tieneAccesoPermitido: true,
          },
        });
      } else {
        throw new BadRequestException('El dni ya esta registraddo');
        // Opcional: Actualizar datos de la persona si ya existía
        // personaRecord = await tx.persona.update({
        //   where: { id: personaRecord.id },
        //   data: {
        //     nombreCompleto: persona.nombreCompleto,
        //     rol: persona.rol,
        //   },
        // });
      }

      const vehiculoRecord = await tx.vehiculo.create({
        data: {
          placa: vehiculo.placa,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          color: vehiculo.color,
        },
      });

      const vinculacion = await tx.vehiculoPersona.create({
        data: {
          personaId: personaRecord.id,
          vehiculoId: vehiculoRecord.id,
        },
      });

      return {
        mensaje: 'Registro y vinculación exitosos',
        persona: personaRecord,
        vehiculo: vehiculoRecord,
        vinculacionId: vinculacion.id,
      };
    });
  }
}
