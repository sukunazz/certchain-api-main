import { HttpException } from '@nestjs/common';

export class NotFoundException extends HttpException {
  errors: Record<string, unknown> = {};

  constructor(
    message: string,
    errors: Record<string, unknown> = {},
    status: number = 404,
  ) {
    super({ message, errors }, status);
    this.errors = errors;
  }
}
