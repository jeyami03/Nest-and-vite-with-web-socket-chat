import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { NotificationService } from './notification.service';
import { WebSocketService } from './websocket.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, NotificationService, WebSocketService],
})
export class ChatModule {}
