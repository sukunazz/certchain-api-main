import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CurrentOrganizer } from './auth/decorators/current-organizer';
import { OrganizerJwtAuthGuard } from './auth/guards/jwt.guard';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { OrganizerService } from './organizer.service';
import { TeamMemberWithoutPassword } from './team-member/team-member.service';

@Controller('organizer')
@ApiTags('Organizer')
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  @Get('by-domain/:domain')
  @ApiProperty({
    description: 'Get an organizer by domain',
  })
  public async getByDomain(@Param('domain') domain: string) {
    const organizer = await this.organizerService.oneByDomain(domain);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    return {
      data: organizer,
    };
  }

  @Get('profile')
  @ApiProperty({
    description: 'Get an organizer by id',
  })
  @UseGuards(OrganizerJwtAuthGuard)
  public async getProfile(
    @CurrentOrganizer() teamMember: TeamMemberWithoutPassword,
  ) {
    const organizer = await this.organizerService.one(teamMember.organizerId);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    return {
      data: organizer,
    };
  }

  @Get(':id')
  @ApiProperty({
    description: 'Get an organizer by id',
  })
  public async get(@Param('id') id: string) {
    const organizer = await this.organizerService.one(id);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    return {
      data: organizer,
    };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update organizer profile' })
  @UseGuards(OrganizerJwtAuthGuard)
  public async updateProfile(
    @CurrentOrganizer() teamMember: TeamMemberWithoutPassword,
    @Body() data: UpdateOrganizerDto,
  ) {
    const updatedOrganizer = await this.organizerService.update(
      teamMember.organizerId,
      data,
    );
    return {
      data: updatedOrganizer,
    };
  }
}
