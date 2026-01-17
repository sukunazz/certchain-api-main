import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DbService } from 'src/lib/db/db.service';
import { Pagination } from 'src/lib/pagination/paginate';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ConversationService {
  logger = new Logger(ConversationService.name);

  constructor(
    private readonly db: DbService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAll(params: Pagination, userId: string) {
    return this.db.$transaction([
      this.db.conversation.findMany({
        ...params,
        where: {
          participants: {
            some: {
              userId,
            },
          },
          ...params.where,
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          event: {
            include: {
              organizer: true,
            },
          },
          ...params.include,
        },
      }),
      this.db.conversation.count({
        where: {
          participants: {
            some: {
              userId,
            },
          },
          ...params.where,
        },
      }),
    ]);
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.db.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        event: {
          include: {
            organizer: true,
          },
        },
        messages: {
          take: 50,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async getMessages(id: string, params: Pagination, userId: string) {
    await this.validateParticipant(id, userId);

    return this.db.$transaction([
      this.db.message.findMany({
        ...params,
        where: {
          conversationId: id,
          ...params.where,
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          sender: {
            include: {
              user: true,
              teamMember: true,
            },
          },
        },
      }),
      this.db.message.count({
        where: {
          conversationId: id,
          ...params.where,
        },
      }),
    ]);
  }

  async sendMessage(id: string, dto: SendMessageDto, userId: string) {
    const participant = await this.validateParticipant(id, userId);

    const message = await this.db.message.create({
      data: {
        content: dto.content,
        conversationId: id,
        senderId: participant.id,
      },
      include: {
        sender: {
          include: {
            user: true,
            teamMember: true,
          },
        },
      },
    });

    this.eventEmitter.emit('message.created', message);

    return message;
  }

  async sendAiMessage(id: string, content: string) {
    // Create a special participant for AI that doesn't need a team member

    const message = await this.db.message.create({
      data: {
        content,
        conversationId: id,
        isAi: true,
      },
      include: {},
    });

    // Modify the response to include AI details
    const aiMessage = {
      ...message,
    };

    this.eventEmitter.emit('message.created', aiMessage);

    return aiMessage;
  }

  async validateParticipant(conversationId: string, userId: string) {
    const participant = await this.db.participant.findFirst({
      where: {
        conversationId,
        OR: [{ userId }, { teamMemberId: userId }],
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return participant;
  }

  @OnEvent('event.joined')
  async handleEventJoined(userEventId: string) {
    const userEvent = await this.db.userEvent.findUnique({
      where: { id: userEventId },
    });

    if (!userEvent) {
      this.logger.error(`User event not found: ${userEventId}`);
      return;
    }

    const conversation = await this.db.conversation.findUnique({
      where: { eventId: userEvent.eventId },
    });

    if (!conversation) {
      this.logger.error(`Conversation not found: ${userEvent.eventId}`);
      return;
    }

    const participant = await this.db.participant.create({
      data: {
        conversationId: conversation.id,
        userId: userEvent.userId,
      },
    });

    this.logger.log(`Participant created: ${participant.id}`);

    this.eventEmitter.emit('participant.added', participant.id);

    return participant;
  }
}
