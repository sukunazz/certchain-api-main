import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Certificate, Event, UserEvent } from '@prisma/client';
import { PaginateQueryDto } from 'src/lib/pagination/dto/paginate-query.dto';
import { Paginate } from 'src/lib/pagination/paginate';
import { CurrentOrganizer } from '../auth/decorators/current-organizer';
import { OrganizerJwtAuthGuard } from '../auth/guards/jwt.guard';
import { TeamMemberWithoutPassword } from '../team-member/team-member.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@Controller('organizers/event')
@ApiTags('Organizer Events')
export class EventController {
  logger = new Logger(EventController.name);
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  @UseGuards(OrganizerJwtAuthGuard)
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentOrganizer() user: TeamMemberWithoutPassword,
  ) {
    this.logger.log(`Creating event for organizer ${user.organizerId}`);
    const event = await this.eventService.create(
      createEventDto,
      user.organizerId,
    );
    return {
      data: event,
      message: 'Event created',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @UseGuards(OrganizerJwtAuthGuard)
  async findAll(
    @Query() paginateQueryDto: PaginateQueryDto,
    @CurrentOrganizer() user: TeamMemberWithoutPassword,
  ) {
    const paginate = new Paginate<Partial<Event>>(paginateQueryDto);
    const [data, total] = await this.eventService.getAll(
      paginate.params(),
      user.organizerId,
    );
    return paginate.response(data, total);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventService.findOne(id);
    return {
      data: event,
      message: 'Event fetched',
    };
  }

  @Get(':id/joinees')
  @UseGuards(OrganizerJwtAuthGuard)
  async getJoinees(
    @Param('id') id: string,
    @Query() paginateQueryDto: PaginateQueryDto,
  ) {
    const paginate = new Paginate<Partial<UserEvent>>(paginateQueryDto);
    const [data, total] = await this.eventService.getJoinees(
      id,
      paginate.params(),
    );
    return paginate.response(data, total);
  }

  @Get(':id/certificates')
  @UseGuards(OrganizerJwtAuthGuard)
  async getCertificates(
    @Param('id') id: string,
    @Query() paginateQueryDto: PaginateQueryDto,
  ) {
    const paginate = new Paginate<Partial<Certificate>>(paginateQueryDto);
    const [data, total] = await this.eventService.getCertificates(
      id,
      paginate.params(),
    );
    return paginate.response(data, total);
  }

  @Put(':id/mark-as-completed')
  @UseGuards(OrganizerJwtAuthGuard)
  async markAsCompleted(@Param('id') id: string) {
    const event = await this.eventService.markAsCompleted(id);
    return {
      data: event,
      message: 'Event marked as completed',
    };
  }

  @Put(':id')
  @UseGuards(OrganizerJwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentOrganizer() user: TeamMemberWithoutPassword,
  ) {
    const event = await this.eventService.update(
      id,
      updateEventDto,
      user.organizerId,
    );
    return {
      data: event,
      message: 'Event updated',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const event = await this.eventService.remove(id);
    return {
      data: event,
      message: 'Event deleted',
    };
  }
}
