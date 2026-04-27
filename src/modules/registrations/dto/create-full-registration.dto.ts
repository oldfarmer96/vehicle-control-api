import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RolUniversitario } from '@/generated/prisma/enums';

class PersonRegistrationDto {
  @IsString()
  @IsNotEmpty()
  dni!: string;

  @IsString()
  @IsNotEmpty()
  nombreCompleto!: string;

  @IsEnum(RolUniversitario)
  rol!: RolUniversitario;
}

class VehicleRegistrationDto {
  @IsString()
  @IsNotEmpty()
  placa!: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateFullRegistrationDto {
  @ValidateNested()
  @Type(() => PersonRegistrationDto)
  @IsNotEmpty()
  persona!: PersonRegistrationDto;

  @ValidateNested()
  @Type(() => VehicleRegistrationDto)
  @IsNotEmpty()
  vehiculo!: VehicleRegistrationDto;
}
