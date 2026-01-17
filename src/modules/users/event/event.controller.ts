import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Event, User } from '@prisma/client';
import { PaginateQueryDto } from 'src/lib/pagination/dto/paginate-query.dto';
import { Paginate } from 'src/lib/pagination/paginate';
import { CurrentUser } from '../auth/decorators/current-user';
import { Public } from '../auth/decorators/public';
import { UserJwtAuthGuard } from '../auth/guards/jwt.guard';
import { JoinEventDto } from './dto/join-event.dto';
import { EventService } from './event.service';

@Controller('user/event')
@UseGuards(UserJwtAuthGuard)
@ApiTags('Users Events')
export class EventController {
  logger = new Logger(EventController.name);
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @Public()
  async findAll(
    @Query() paginateQueryDto: PaginateQueryDto,
    @Query('organizerId') organizerId: string,
  ) {
    const paginate = new Paginate<Partial<Event>>(paginateQueryDto);
    const [data, total] = await this.eventService.getAll(
      paginate.params(),
      organizerId,
    );
    return paginate.response(data, total);
  }

  @Get('currently-running')
  @ApiOperation({ summary: 'Get currently running events' })
  @Public()
  async getCurrentlyRunningEvents(@Query() paginateQueryDto: PaginateQueryDto) {
    const paginate = new Paginate<Partial<Event>>(paginateQueryDto);
    const [data, total] = await this.eventService.getCurrentlyRunningEvents(
      paginate.params(),
    );
    return paginate.response(data, total);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @Public()
  async getUpcomingEvents(@Query() paginateQueryDto: PaginateQueryDto) {
    const paginate = new Paginate<Partial<Event>>(paginateQueryDto);
    const [data, total] = await this.eventService.upcomingEvents(
      paginate.params(),
    );
    return paginate.response(data, total);
  }

  @Post('verify-payment/:pidx')
  @ApiOperation({ summary: 'Verify event payment' })
  async verifyEventPayment(@Param('pidx') pidx: string) {
    const payment = await this.eventService.verifyEventPayment(pidx);
    return payment;
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an event' })
  async joinEvent(@Body() body: JoinEventDto, @CurrentUser() user: User) {
    const event = await this.eventService.joinEvent(body, user.id);
    return event;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event' })
  @Public()
  async findOne(@Param('id') id: string) {
    const event = await this.eventService.findOne(id);
    return {
      data: event,
      message: 'Event fetched',
    };
  }
}
