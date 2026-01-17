import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiService } from 'src/lib/ai/ai.service';
import { DbService } from 'src/lib/db/db.service';
import { ConversationService } from '../conversation.service';
import { SendMessageDto } from '../dto/send-message.dto';

interface JoinConversationPayload {
  conversationId: string;
  userId?: string;
  teamMemberId?: string;
}

interface TypingPayload {
  conversationId: string;
  isTyping: boolean;
  userId?: string;
  teamMemberId?: string;
}

@WebSocketGateway({
  cors: true,
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();
  private socketRooms: Map<string, Set<string>> = new Map();

  constructor(
    private readonly db: DbService,
    private readonly conversationService: ConversationService,
    private readonly aiService: AiService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    try {
      // Leave all rooms
      const rooms = this.socketRooms.get(client.id);
      if (rooms) {
        rooms.forEach((room) => {
          client.leave(room);
        });
        this.socketRooms.delete(client.id);
      }

      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error('Disconnect error:', error);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinConversationPayload,
  ) {
    try {
      const { conversationId, userId, teamMemberId } = payload;

      if (!userId && !teamMemberId) {
        throw new WsException('No user ID or team member ID provided');
      }

      // Validate participant
      if (userId) {
        await this.conversationService.validateParticipant(
          conversationId,
          userId,
        );
      }
      // Add validation for team member if needed
      if (teamMemberId) {
        await this.conversationService.validateParticipant(
          conversationId,
          teamMemberId,
        );
      }

      // Join the room
      client.join(conversationId);

      // Track room membership
      if (!this.socketRooms.has(client.id)) {
        this.socketRooms.set(client.id, new Set());
      }
      this.socketRooms.get(client.id)?.add(conversationId);

      // Track user socket
      const id = userId || teamMemberId;
      if (!this.userSockets.has(id)) {
        this.userSockets.set(id, new Set());
      }
      this.userSockets.get(id)?.add(client.id);

      client.emit('joined_conversation', { conversationId });
      this.logger.log(
        `Client ${client.id} joined conversation: ${conversationId}`,
      );
    } catch (error) {
      this.logger.error('Join conversation error:', error);
      client.emit('error', {
        message:
          error instanceof WsException
            ? error.message
            : 'Failed to join conversation',
      });
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { conversationId: string; userId?: string; teamMemberId?: string },
  ) {
    try {
      this.logger.log(payload);
      const { conversationId, userId, teamMemberId } = payload;
      client.leave(conversationId);
      this.socketRooms.get(client.id)?.delete(conversationId);

      // Remove from user sockets if needed
      const id = userId || teamMemberId;
      if (id) {
        this.userSockets.get(id)?.delete(client.id);
        if (this.userSockets.get(id)?.size === 0) {
          this.userSockets.delete(id);
        }
      }

      this.logger.log(
        `Client ${client.id} left conversation: ${conversationId}`,
      );
    } catch (error) {
      this.logger.error('Leave conversation error:', error);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: SendMessageDto & {
      conversationId: string;
      userId?: string;
      teamMemberId?: string;
    },
  ) {
    try {
      const { userId, teamMemberId } = payload;

      if (!userId && !teamMemberId) {
        throw new WsException('No user ID or team member ID provided');
      }

      const message = await this.conversationService.sendMessage(
        payload.conversationId,
        payload,
        userId || teamMemberId,
      );

      this.server.to(payload.conversationId).emit('new_message', message);

      // Generate AI response only if the message is from a user (not a team member)
      if (userId) {
        const conversation = await this.conversationService.findOne(
          payload.conversationId,
          userId,
        );
        const aiResponse = await this.aiService.generateMesssage(
          payload.content,
          conversation.eventId,
        );

        if (aiResponse) {
          const aiMessage = await this.conversationService.sendAiMessage(
            payload.conversationId,
            aiResponse,
          );

          this.server.to(payload.conversationId).emit('new_message', aiMessage);
        }
      }

      this.logger.log(
        `Message sent in conversation: ${payload.conversationId}`,
      );
    } catch (error) {
      this.logger.error('Send message error:', error);
      client.emit('error', {
        message:
          error instanceof WsException
            ? error.message
            : 'Failed to send message',
      });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    try {
      const { conversationId, isTyping, userId, teamMemberId } = payload;
      this.notifyTypingStatus(conversationId, isTyping, userId, teamMemberId);
    } catch (error) {
      this.logger.error('Typing notification error:', error);
    }
  }

  private notifyTypingStatus(
    conversationId: string,
    isTyping: boolean,
    userId?: string,
    teamMemberId?: string,
  ) {
    this.server
      .to(conversationId)
      .emit('user_typing', { isTyping, userId, teamMemberId });
  }
}
