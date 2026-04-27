import { TipoEventoAcceso } from '@/generated/prisma/enums';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, IsEnum } from 'class-validator';

export class FindAccessEventsQryDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(TipoEventoAcceso)
  tipoEvento?: TipoEventoAcceso;
}
