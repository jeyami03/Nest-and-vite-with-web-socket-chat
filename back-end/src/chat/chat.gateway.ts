import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { NotificationService } from './notification.service';
import { UsersService } from '../users/users.service';
import { UserStatusService } from '../users/user-status.service';
import { WebSocketService } from './websocket.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

interface UserStatus {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  isTyping?: boolean;
  typingTo?: string;
}

@WebSocketGateway({
  cors: {
    // origin: "http://localhost:5173",
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Socket>();
  private userStatuses = new Map<string, UserStatus>();

  constructor(
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly userStatusService: UserStatusService,
    private readonly webSocketService: WebSocketService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token here (you can use the same JWT service)
      // For now, we'll assume the token is valid and contains user info
      const user = this.extractUserFromToken(token);
      if (!user) {
        client.disconnect();
        return;
      }

      this.connectedUsers.set(user.id, client);
      client.data.user = user;

      // Set the server reference in WebSocketService
      this.webSocketService.setServer(this.server);

      // Create status update for user
      await this.userStatusService.createStatusUpdate(user.id, 'online');

      // Set user status to online
      const userStatus: UserStatus = {
        id: user.id,
        username: user.username,
        status: 'online',
        lastSeen: new Date(),
      };
      this.userStatuses.set(user.id, userStatus);

      // Emit user online status to all connected users
      this.webSocketService.emitUserStatusUpdate({
        userId: user.id,
        username: user.username,
        status: 'online',
        lastSeen: userStatus.lastSeen.toISOString(),
      });

      // Send current online users to the newly connected user
      const onlineUsers = Array.from(this.userStatuses.values()).filter(
        (status) => status.status === 'online' && status.id !== user.id,
      );
      client.emit('onlineUsers', onlineUsers);

      console.log(`User ${user.username} connected`);
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.user) {
      const userId = client.data.user.id;
      const username = client.data.user.username;

      this.connectedUsers.delete(userId);

      // Create status update for user
      await this.userStatusService.createStatusUpdate(userId, 'offline');

      // Update user status to offline
      const userStatus: UserStatus = {
        id: userId,
        username: username,
        status: 'offline',
        lastSeen: new Date(),
      };
      this.userStatuses.set(userId, userStatus);

      // Emit user offline status to all connected users
      this.webSocketService.emitUserStatusUpdate({
        userId: userId,
        username: username,
        status: 'offline',
        lastSeen: userStatus.lastSeen.toISOString(),
      });

      console.log(`User ${username} disconnected`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;
      
      // Create message without notification (API calls will handle notifications)
      const message = await this.prisma.message.create({
        data: {
          ...createMessageDto,
          senderId: user.id,
        },
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

      // Emit to sender
      client.emit('messageSent', message);

      // Emit to receiver if they're online
      if (createMessageDto.receiverId) {
        const receiverSocket = this.connectedUsers.get(
          createMessageDto.receiverId,
        );
        if (receiverSocket) {
          receiverSocket.emit('newMessage', message);
          
          // Get updated unread count for the receiver
          const unreadCounts = await this.notificationService.getUnreadCounts(createMessageDto.receiverId);
          const senderUnreadCount = unreadCounts.get(user.id) || 0;
          
          receiverSocket.emit('unreadCountUpdate', {
            senderId: user.id,
            count: senderUnreadCount,
          });
        }
      }

      return message;
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;
      await this.notificationService.markAsRead(user.id, data.senderId);
      
      // Emit to the sender that their messages were read
      const senderSocket = this.connectedUsers.get(data.senderId);
      if (senderSocket) {
        senderSocket.emit('messagesRead', {
          readerId: user.id,
          readerUsername: user.username,
        });
      }
      
      // Emit updated unread count to the current user
      const unreadCounts = await this.notificationService.getUnreadCounts(user.id);
      const senderUnreadCount = unreadCounts.get(data.senderId) || 0;
      
      this.webSocketService.emitUnreadCountUpdate(user.id, data.senderId, senderUnreadCount);
    } catch (error) {
      client.emit('error', { message: 'Failed to mark messages as read' });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('getUnreadCounts')
  async handleGetUnreadCounts(@ConnectedSocket() client: Socket) {
    try {
      const user = client.data.user;
      const unreadCounts = await this.notificationService.getUnreadCounts(user.id);
      
      client.emit('unreadCounts', Object.fromEntries(unreadCounts));
    } catch (error) {
      client.emit('error', { message: 'Failed to get unread counts' });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { receiverId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    console.log('Typing event received:', {
      from: user.username,
      to: data.receiverId,
      isTyping: data.isTyping,
    });

    // Update user's typing status
    const userStatus = this.userStatuses.get(user.id);
    if (userStatus) {
      userStatus.isTyping = data.isTyping;
      userStatus.typingTo = data.isTyping ? data.receiverId : undefined;
    }

    const receiverSocket = this.connectedUsers.get(data.receiverId);

    if (receiverSocket) {
      console.log('Sending typing event to receiver:', data.receiverId);
      receiverSocket.emit('userTyping', {
        userId: user.id,
        username: user.username,
        isTyping: data.isTyping,
        typingTo: data.receiverId,
      });
    } else {
      console.log('Receiver not found or offline:', data.receiverId);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('userActivity')
  async handleUserActivity(
    @MessageBody() data: { activity: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    // Create status update for user activity
    await this.userStatusService.createStatusUpdate(user.id, 'online');

    const userStatus = this.userStatuses.get(user.id);
    if (userStatus) {
      userStatus.lastSeen = new Date();

      // If user was away, set them back to online
      if (userStatus.status === 'away') {
        userStatus.status = 'online';
        this.webSocketService.emitUserStatusUpdate({
          userId: user.id,
          username: user.username,
          status: 'online',
          lastSeen: userStatus.lastSeen.toISOString(),
        });
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('getOnlineUsers')
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    const onlineUsers = Array.from(this.userStatuses.values()).filter(
      (status) => status.status === 'online' && status.id !== user.id,
    );
    client.emit('onlineUsers', onlineUsers);
  }

  private extractUserFromToken(token: string): any {
    try {
      // This is a simplified version. In production, use your JWT service
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      );
      return {
        id: payload.sub,
        username: payload.username,
      };
    } catch (error) {
      return null;
    }
  }
}
