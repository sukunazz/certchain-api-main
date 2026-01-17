import { Injectable, NotFoundException } from '@nestjs/common';
import { TeamMember } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';
import { HashService } from 'src/lib/hash/hash.service';
import { Pagination } from 'src/lib/pagination/paginate';
import { ResetPasswordByEmailDto } from '../auth/dto/reset-password.dto';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';

export type TeamMemberWithoutPassword = Omit<TeamMember, 'password'>;

@Injectable()
export class TeamMemberService {
  constructor(
    protected readonly db: DbService,
    private readonly hashService: HashService,
  ) {}

  public async create(
    data: CreateTeamMemberDto,
  ): Promise<TeamMemberWithoutPassword> {
    const hashedPassword = await this.hashService.hash(data.password);
    const teamMember = await this.db.teamMember.create({
      data: {
        ...data,
        password: hashedPassword,
        organizerId: data.organizerId,
      },
      omit: {
        password: true,
      },
    });
    return teamMember;
  }

  public async all(
    params: Pagination,
  ): Promise<[TeamMemberWithoutPassword[], number]> {
    const [items, count] = await this.db.$transaction([
      this.db.teamMember.findMany({
        ...params,
        where: params.where,
      }),
      this.db.teamMember.count({
        where: params.where,
      }),
    ]);
    return [items, count];
  }

  public async one(id: string): Promise<TeamMember | null> {
    return await this.db.teamMember.findUnique({
      where: { id },
    });
  }

  public async oneByEmail(email: string): Promise<TeamMember | null> {
    return await this.db.teamMember.findUnique({
      where: { email },
    });
  }

  public async update<K extends Partial<TeamMember>>(
    id: string,
    data: K,
  ): Promise<TeamMember> {
    return await this.db.teamMember.update({
      where: { id },
      data,
    });
  }

  public async remove(id: string): Promise<TeamMember> {
    return await this.db.teamMember.delete({
      where: { id },
    });
  }

  public async validateEmailPassword(
    email: string,
    password: string,
    organizerId: string,
  ): Promise<TeamMemberWithoutPassword> {
    const teamMember = await this.db.teamMember.findUnique({
      where: { email, organizerId },
    });
    if (!teamMember) {
      throw new BadRequestException('Invalid email or password', {
        email: 'The email or password is invalid',
      });
    }
    const isPasswordValid = await this.hashService.verify(
      teamMember.password,
      password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password', {
        email: 'The email or password is invalid',
      });
    }
    delete teamMember.password;
    return teamMember;
  }

  public async resetPassword(
    data: ResetPasswordByEmailDto,
  ): Promise<TeamMember> {
    const teamMember = await this.db.teamMember.findUnique({
      where: { email: data.email },
    });
    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }
    return await this.db.teamMember.update({
      where: { id: teamMember.id },
      data: { password: await this.hashService.hash(data.password) },
    });
  }
}
