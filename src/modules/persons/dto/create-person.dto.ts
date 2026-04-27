import { RolUniversitario } from '@/generated/prisma/enums';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreatePersonDto {
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @IsString({ message: 'El DNI debe ser un texto' })
  @MaxLength(15, { message: 'El DNI no puede superar los 15 caracteres' })
  @Matches(/^\d+$/, { message: 'El DNI solo debe contener números' })
  dni!: string;

  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString({ message: 'El nombre completo debe ser un texto' })
  @MaxLength(150, {
    message: 'El nombre completo no puede superar los 150 caracteres',
  })
  nombreCompleto!: string;

  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(RolUniversitario, {
    message: `El rol debe ser uno de los siguientes: ${Object.values(RolUniversitario).join(', ')}`,
  })
  rol!: RolUniversitario;

  @IsOptional()
  @IsBoolean({ message: 'El acceso permitido debe ser un booleano' })
  tieneAccesoPermitido?: boolean;
}
