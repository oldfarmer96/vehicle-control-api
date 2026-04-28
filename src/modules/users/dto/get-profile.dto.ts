import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RolWeb } from '@/generated/prisma/enums';

export class ProfileDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  nombre!: string;

  @ApiProperty()
  @Expose()
  apellidos!: string;

  @ApiProperty()
  @Expose()
  dni!: string;

  @ApiProperty()
  @Expose()
  username!: string;

  @ApiProperty()
  @Expose()
  rol!: RolWeb;

  @ApiProperty()
  @Expose()
  activo!: boolean;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
