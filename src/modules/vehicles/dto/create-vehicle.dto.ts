import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateVehicleDto {
  @IsNotEmpty({ message: 'La placa es obligatoria' })
  @IsString({ message: 'La placa debe ser un texto' })
  @MaxLength(15, { message: 'La placa no puede superar los 15 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, {
    message:
      'La placa solo puede contener letras mayúsculas, números y guiones',
  })
  placa!: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' ? undefined : value,
  )
  @IsString({ message: 'La marca debe ser un texto' })
  @MaxLength(50, { message: 'La marca no puede superar los 50 caracteres' })
  marca?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' ? undefined : value,
  )
  @IsString({ message: 'El modelo debe ser un texto' })
  @MaxLength(50, { message: 'El modelo no puede superar los 50 caracteres' })
  modelo?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' ? undefined : value,
  )
  @IsString({ message: 'El color debe ser un texto' })
  @MaxLength(50, { message: 'El color no puede superar los 50 caracteres' })
  color?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' ? undefined : value,
  )
  @IsString({ message: 'El VIN debe ser un texto' })
  @MaxLength(50, { message: 'El VIN no puede superar los 50 caracteres' })
  vin?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' ? undefined : value,
  )
  @IsString({ message: 'El motor debe ser un texto' })
  @MaxLength(50, { message: 'El motor no puede superar los 50 caracteres' })
  motor?: string;
}
