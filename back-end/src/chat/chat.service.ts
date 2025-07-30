import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationService } from './notification.service';
import { WebSocketService } from './websocket.service';
import { UserStatusService } from '../users/user-status.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private webSocketService: WebSocketService,
    private userStatusService: UserStatusService,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: createMessageDto,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    // Create notification for the receiver if message is not from self
    if (createMessageDto.receiverId && createMessageDto.senderId !== createMessageDto.receiverId) {
      await this.notificationService.createNotification(
        createMessageDto.receiverId,
        createMessageDto.senderId,
        message.id,
      );

      // Get updated unread count for the receiver
      const unreadCounts = await this.notificationService.getUnreadCounts(createMessageDto.receiverId);
      const senderUnreadCount = unreadCounts.get(createMessageDto.senderId) || 0;

      // Emit WebSocket events for real-time updates
      // Emit messageSent to the sender
      this.webSocketService.emitMessageSent(message);
      // Emit newMessage to the receiver
      this.webSocketService.emitNewMessage(message);
      // Emit unread count update to the receiver
      this.webSocketService.emitUnreadCountUpdate(createMessageDto.receiverId, createMessageDto.senderId, senderUnreadCount);
    } else {
      // Emit to sender only if it's a self-message
      this.webSocketService.emitMessageSent(message);
    }

    return message;
  }

  async getMessages(
    senderId: string,
    receiverId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
      }),
      this.prisma.message.count({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
      }),
    ]);

    return {
      messages: messages.reverse(), // Show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentChats(userId: string) {
    const recentMessages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    // Get unread counts for the user
    const unreadCounts = await this.notificationService.getUnreadCounts(userId);

    // Group by conversation and get the latest message for each
    const conversations = new Map();
    for (const message of recentMessages) {
      const otherUserId =
        message.senderId === userId ? message.receiverId : message.senderId;
      if (otherUserId && !conversations.has(otherUserId)) {
        const otherUser = message.senderId === userId ? message.receiver : message.sender;
        
        // Get last seen from UserStatus
        const lastSeen = await this.userStatusService.getUserLastSeen(otherUserId);
        
        const conversation = {
          ...message,
          unreadCount: unreadCounts.get(otherUserId) || 0,
          otherUser: {
            ...otherUser,
            lastSeen: lastSeen,
          },
        };
        conversations.set(otherUserId, conversation);
      }
    }

    return Array.from(conversations.values());
  }

  async markConversationAsRead(userId: string, otherUserId: string) {
    return this.notificationService.markAsRead(userId, otherUserId);
  }
}
