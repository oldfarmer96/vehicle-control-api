import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignOwnerDto {
  @IsNotEmpty({ message: 'El ID de la persona es obligatorio' })
  @IsUUID('4', { message: 'El ID de la persona debe ser un UUID válido' })
  personaId!: string;
}
