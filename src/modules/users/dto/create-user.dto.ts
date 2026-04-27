import { RolWeb } from '@/generated/prisma/enums';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  nombre!: string;

  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @IsString({ message: 'Los apellidos deben ser un texto' })
  @MaxLength(50, {
    message: 'Los apellidos no pueden superar los 50 caracteres',
  })
  apellidos!: string;

  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @IsString({ message: 'El DNI debe ser un texto' })
  @MaxLength(15, { message: 'El DNI no puede superar los 15 caracteres' })
  @Matches(/^\d+$/, { message: 'El DNI solo debe contener números' })
  dni!: string;

  @IsNotEmpty({ message: 'El username es obligatorio' })
  @IsString({ message: 'El username debe ser un texto' })
  @MaxLength(15, { message: 'El username no puede superar los 15 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El username solo puede contener letras, números y guiones bajos',
  })
  username!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, {
    message: 'La contraseña debe tener al menos $constraint1 caracteres',
  })
  password!: string;

  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(RolWeb, {
    message: `El rol debe ser uno de los siguientes: ${Object.values(RolWeb).join(', ')}`,
  })
  rol!: RolWeb;
}
