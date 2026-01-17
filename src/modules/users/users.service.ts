import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';
import { HashService } from 'src/lib/hash/hash.service';
import { UserRegisteredEvent } from './auth/events/UserRegistered';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly db: DbService,
    private readonly hash: HashService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const existingUser = await this.db.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists', {
        email: 'The email is already in use',
      });
    }

    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('The passwords do not match', {
        confirmPassword: 'The passwords do not match',
      });
    }

    const hashedPassword = await this.hash.hash(createUserDto.password);

    const user = await this.db.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        isVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isVerified: true,
        verificationToken: true,
        resetPasswordToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.eventEmitter.emit('user.registered', new UserRegisteredEvent(user));

    return user;
  }

  async findById(id: string): Promise<UserWithoutPassword> {
    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isVerified: true,
        verificationToken: true,
        resetPasswordToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found', {
        email: 'The user with this email does not exist',
      });
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.db.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isVerified: true,
        verificationToken: true,
        resetPasswordToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async delete(id: string): Promise<boolean> {
    await this.db.user.delete({
      where: { id },
    });

    return true;
  }
}
