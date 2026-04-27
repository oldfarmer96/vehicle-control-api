import { TipoEventoAcceso } from '@/generated/prisma/enums';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class ReceiveEventDto {
  @IsNotEmpty({ message: 'La placa es obligatoria' })
  @IsString({ message: 'La placa debe ser un texto' })
  @MaxLength(15, { message: 'La placa no puede superar los 15 caracteres' })
  placa!: string;

  @IsNotEmpty({ message: 'El evento es obligatorio' })
  @IsEnum(TipoEventoAcceso, {
    message: 'El evento debe ser ENTRADA o SALIDA',
  })
  evento!: TipoEventoAcceso;

  @IsNotEmpty({ message: 'La confianza OCR es obligatoria' })
  @IsNumber({}, { message: 'La confianza OCR debe ser un número' })
  @Min(0, { message: 'La confianza OCR no puede ser menor a 0' })
  @Max(100, { message: 'La confianza OCR no puede ser mayor a 100' })
  confianzaOcr!: number;

  @IsNotEmpty({ message: 'El punto de control es obligatorio' })
  @IsString({ message: 'El punto de control debe ser un texto' })
  @MaxLength(50, {
    message: 'El punto de control no puede superar los 50 caracteres',
  })
  puntoControl!: string;
}
