import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsBoolean({ message: 'El estado debe ser un booleano' })
  status!: boolean;
}
