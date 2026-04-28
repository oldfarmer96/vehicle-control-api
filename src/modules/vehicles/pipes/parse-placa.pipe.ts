import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParsePlacaPipe implements PipeTransform {
  transform(value: string) {
    if (!value) {
      throw new BadRequestException('La placa es obligatoria');
    }

    const normalizada = value.toUpperCase().trim();

    const formatos = [
      /^[A-Z0-9]{3}-\d{3}$/, // ABC-123 o F7K-455
      /^[A-Z0-9]{2}-\d{4}$/, // AB-1234
      /^[A-Z0-9]{3}\d{3}$/, // ABC123
      /^[A-Z0-9]{2}\d{4}$/, // AB1234
    ];

    const esValida = formatos.some((regex) => regex.test(normalizada));

    if (!esValida) {
      throw new BadRequestException(
        'Placa inválida. Formatos aceptados: ABC-123, AB-1234, ABC123, AB1234 y A2C-123',
      );
    }

    return normalizada;
  }
}
