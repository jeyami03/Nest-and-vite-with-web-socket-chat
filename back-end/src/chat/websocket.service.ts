import { Injectable } from '@nestjs/common';

@Injectable()
export class WebSocketService {
  private server: any;

  setServer(server: any) {
    this.server = server;
  }

  emitToUser(userId: string, event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }

  emitToAll(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }

  emitNewMessage(message: any) {
    if (this.server) {
      this.server.emit('newMessage', message);
    }
  }

  emitMessageSent(message: any) {
    if (this.server) {
      this.server.emit('messageSent', message);
    }
  }

  emitUnreadCountUpdate(userId: string, senderId: string, count: number) {
    if (this.server) {
      this.server.emit('unreadCountUpdate', {
        senderId,
        count,
      });
    }
  }

  emitUserStatusUpdate(data: { userId: string; username: string; status: string; lastSeen: string }) {
    if (this.server) {
      this.server.emit('userStatusUpdate', data);
    }
  }
} 