import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DbService } from 'src/lib/db/db.service';
import { NotFoundException } from 'src/lib/exceptions/not-found.exception';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationService {
  logger = new Logger(ConversationService.name);
  constructor(private readonly db: DbService) {}

  @OnEvent('event.created')
  async create(eventId: string) {
    const event = await this.db.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      this.logger.error(`Event not found: ${eventId}`);
      return;
    }

    this.logger.log(`Creating conversation for event ${eventId}`);
    const conversation = await this.db.conversation.create({
      data: {
        eventId,
      },
    });

    this.logger.log(`Conversation created: ${conversation.id}`);

    const teamMembers = await this.db.teamMember.findMany({
      where: {
        organizerId: event.organizerId,
      },
    });

    const participants = await this.db.participant.createMany({
      data: teamMembers.map((teamMember) => ({
        conversationId: conversation.id,
        teamMemberId: teamMember.id,
      })),
    });

    this.logger.log(`Participants added: ${participants.count}`);

    return conversation;
  }

  findAll(userId: string) {
    return this.db.conversation.findMany({
      where: {
        participants: {
          some: {
            teamMemberId: userId,
          },
        },
      },
      include: {
        participants: true,
        event: {
          include: {
            organizer: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const conversation = await this.db.conversation.findFirst({
      where: {
        id,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async getMessages(id: string, page: number = 1, limit: number = 50) {
    const messages = await this.db.message.findMany({
      where: {
        conversationId: id,
      },
      include: {
        sender: {
          include: {
            user: true,
            teamMember: true,
          },
        },
      },
      skip: (page - 1) * Number(limit),
      take: Number(limit),
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
