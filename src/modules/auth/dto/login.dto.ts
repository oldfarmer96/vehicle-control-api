import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString({ message: 'El nombre de usuario debe ser un texto' })
  userName!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, {
    message: 'La contraseña debe tener al menos $constraint1 caracteres',
  })
  password!: string;
}
