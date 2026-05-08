import { TipoEventoAcceso } from '@/generated/prisma/enums';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum GroupBy {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class GetSummaryQryDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  startDate?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  endDate?: string;

  @IsEnum(GroupBy)
  @IsOptional()
  groupBy?: GroupBy = GroupBy.DAY;
}

export class GetReportsQryDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  startDate?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  endDate?: string;

  @IsEnum(GroupBy)
  @IsOptional()
  groupBy?: GroupBy = GroupBy.DAY;

  @IsOptional()
  @IsEnum(TipoEventoAcceso)
  tipoEvento?: TipoEventoAcceso;
}
