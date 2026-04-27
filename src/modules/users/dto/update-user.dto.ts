import { RolWeb } from '@/generated/prisma/enums';
import {
  IsString,
  IsEnum,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'Los apellidos deben ser un texto' })
  @MaxLength(50, {
    message: 'Los apellidos no pueden superar los 50 caracteres',
  })
  apellidos?: string;

  @IsOptional()
  @IsString({ message: 'El DNI debe ser un texto' })
  @MaxLength(15, { message: 'El DNI no puede superar los 15 caracteres' })
  @Matches(/^\d+$/, { message: 'El DNI solo debe contener números' })
  dni?: string;

  @IsOptional()
  @IsString({ message: 'El username debe ser un texto' })
  @MaxLength(15, { message: 'El username no puede superar los 15 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El username solo puede contener letras, números y guiones bajos',
  })
  username?: string;

  @IsOptional()
  @IsEnum(RolWeb, {
    message: `El rol debe ser uno de los siguientes: ${Object.values(RolWeb).join(', ')}`,
  })
  rol?: RolWeb;
}
