import { ParseUUIDPipe, BadRequestException, HttpStatus } from '@nestjs/common';

export const UUIDPipe = new ParseUUIDPipe({
  errorHttpStatusCode: HttpStatus.BAD_REQUEST,
  exceptionFactory: () => new BadRequestException('invalid id'),
});
