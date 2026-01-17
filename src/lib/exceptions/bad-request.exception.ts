import { HttpException } from '@nestjs/common';

export class BadRequestException extends HttpException {
  errors: Record<string, unknown> = {};

  constructor(
    message: string,
    errors: Record<string, unknown> = {},
    status: number = 400,
  ) {
    super({ message, errors }, status);
    this.errors = errors;
  }
}
