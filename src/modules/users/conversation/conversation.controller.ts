import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Conversation, Message, User } from '@prisma/client';
import { PaginateQueryDto } from 'src/lib/pagination/dto/paginate-query.dto';
import { Paginate } from 'src/lib/pagination/paginate';
import { CurrentUser } from '../auth/decorators/current-user';
import { UserJwtAuthGuard } from '../auth/guards/jwt.guard';
import { ConversationService } from './conversation.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('user/conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all conversations' })
  @UseGuards(UserJwtAuthGuard)
  async findAll(
    @Query() paginateQueryDto: PaginateQueryDto,
    @CurrentUser() user: User,
  ) {
    const paginate = new Paginate<Partial<Conversation>>(paginateQueryDto);
    const [data, total] = await this.conversationService.getAll(
      paginate.params(),
      user.id,
    );
    return paginate.response(data, total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation by id' })
  @UseGuards(UserJwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const data = await this.conversationService.findOne(id, user.id);
    return {
      data,
      message: 'Conversation fetched successfully',
    };
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages from a conversation' })
  @UseGuards(UserJwtAuthGuard)
  async getMessages(
    @Param('id') id: string,
    @Query() paginateQueryDto: PaginateQueryDto,
    @CurrentUser() user: User,
  ) {
    const paginate = new Paginate<Partial<Message>>(paginateQueryDto);
    const [data, total] = await this.conversationService.getMessages(
      id,
      paginate.params(),
      user.id,
    );
    return paginate.response(data, total);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message to a conversation' })
  @UseGuards(UserJwtAuthGuard)
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.conversationService.sendMessage(id, dto, user.id);
    return {
      data,
      message: 'Message sent successfully',
    };
  }
}
