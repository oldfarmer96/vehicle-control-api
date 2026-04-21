import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';
import { RolUniversitario } from '@src/generated/prisma/enums';

export class UpdatePersonDto {
  @IsOptional()
  @IsString({ message: 'El DNI debe ser un texto' })
  @MaxLength(15, { message: 'El DNI no puede superar los 15 caracteres' })
  @Matches(/^\d+$/, { message: 'El DNI solo debe contener números' })
  dni?: string;

  @IsOptional()
  @IsString({ message: 'El nombre completo debe ser un texto' })
  @MaxLength(150, {
    message: 'El nombre completo no puede superar los 150 caracteres',
  })
  nombreCompleto?: string;

  @IsOptional()
  @IsEnum(RolUniversitario, {
    message: `El rol debe ser uno de los siguientes: ${Object.values(RolUniversitario).join(', ')}`,
  })
  rol?: RolUniversitario;

  @IsOptional()
  @IsBoolean({ message: 'El acceso permitido debe ser un booleano' })
  tieneAccesoPermitido?: boolean;
}
