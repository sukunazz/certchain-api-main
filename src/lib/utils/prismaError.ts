import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const isPrismaNotFound = (error: any) => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
};

export const isPrismaUniqueConstraintViolation = (error: any) => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
};

export const getPrismaError = (error: any): PrismaClientKnownRequestError => {
  return error as PrismaClientKnownRequestError;
};
