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
import { TeamMember } from '@prisma/client';
import { PaginateQueryDto } from 'src/lib/pagination/dto/paginate-query.dto';
import { CurrentTeamMember } from '../auth/decorators/current-team-member';
import { OrganizerJwtAuthGuard } from '../auth/guards/jwt.guard';
import { ConversationService } from './conversation.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('organizers/conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  @UseGuards(OrganizerJwtAuthGuard)
  async findAll(@CurrentTeamMember() user: TeamMember) {
    const conversations = await this.conversationService.findAll(user.id);
    return {
      data: conversations,
      message: 'Conversations fetched successfully',
    };
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    const conversation = await this.conversationService.findOne(id);
    return {
      data: conversation,
      message: 'Conversation fetched successfully',
    };
  }

  @Get('/:id/messages')
  @UseGuards(OrganizerJwtAuthGuard)
  async getMessages(
    @Param('id') id: string,
    @Query() paginateQueryDto: PaginateQueryDto,
  ) {
    const messages = await this.conversationService.getMessages(
      id,
      paginateQueryDto.page,
      paginateQueryDto.limit,
    );
    return {
      data: messages,
    };
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(+id);
  }
}
