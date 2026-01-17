import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserEvent } from '@prisma/client';
import { PaginateQueryDto } from 'src/lib/pagination/dto/paginate-query.dto';
import { Paginate } from 'src/lib/pagination/paginate';
import { CurrentUser } from '../auth/decorators/current-user';
import { UserJwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateUserEventDto } from './dto/update-user-event.dto';
import { UserEventService } from './user-event.service';

@Controller('user/user-event')
@UseGuards(UserJwtAuthGuard)
@ApiTags('User Event')
@ApiBearerAuth()
export class UserEventController {
  constructor(private readonly userEventService: UserEventService) {}

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  async findAll(
    @Query() paginateQueryDto: PaginateQueryDto,
    @CurrentUser() user: User,
  ) {
    const paginate = new Paginate<Partial<UserEvent>>(paginateQueryDto);
    const [data, total] = await this.userEventService.getAll(
      paginate.params(),
      user.id,
    );
    return paginate.response(data, total);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const userEvent = await this.userEventService.getOne(id);
    return {
      message: 'User event',
      data: userEvent,
    };
  }

  @Get(':id/is-joined')
  async isJoined(@Param('id') id: string, @CurrentUser() user: User) {
    const isJoined = await this.userEventService.isJoined(id, user.id);
    return {
      message: 'User event is joined',
      data: !!isJoined,
    };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserEventDto: UpdateUserEventDto,
  ) {
    return this.userEventService.update(+id, updateUserEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userEventService.remove(+id);
  }
}
