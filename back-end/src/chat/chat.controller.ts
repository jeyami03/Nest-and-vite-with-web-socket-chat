import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { NotificationService } from './notification.service';
import { CreateMessageDto, MessageType, UploadFileDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('messages/:receiverId')
  @ApiOperation({ summary: 'Get messages with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Messages per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMessages(
    @Param('receiverId') receiverId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Request() req,
  ) {
    return this.chatService.getMessages(
      req.user.id,
      receiverId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent conversations' })
  @ApiResponse({
    status: 200,
    description: 'Recent conversations retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getRecentChats(@Request() req) {
    return this.chatService.getRecentChats(req.user.id);
  }

  @Post('message')
  @ApiOperation({ summary: 'Send a text message' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ) {
    return this.chatService.createMessage({
      ...createMessageDto,
      senderId: req.user.id,
    });
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload file/image and send as message' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (images, documents, etc.)',
        },
        receiverId: {
          type: 'string',
          description: 'Receiver user ID',
        },
        content: {
          type: 'string',
          description: 'Message content (optional caption)',
        },
        type: {
          type: 'string',
          enum: ['TEXT', 'IMAGE', 'FILE'],
          description: 'Type of message',
        },
      },
      required: ['file', 'receiverId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded and message sent successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/chat',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow images and common document types
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedMimes.includes(file.mimetype)) {
          return cb(new Error('File type not allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req,
  ) {
    const fileUrl = `/uploads/chat/${file.filename}`;
    const messageType = file.mimetype.startsWith('image/') 
      ? MessageType.IMAGE 
      : MessageType.FILE;

    // Extract only the fields we need from the body
    const { receiverId, content, type } = body;

    return this.chatService.createMessage({
      content: content || `Sent a ${messageType.toLowerCase()}`,
      senderId: req.user.id,
      receiverId,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      type: messageType,
    });
  }

  @Post('mark-read/:senderId')
  @ApiOperation({ summary: 'Mark messages from a sender as read' })
  @ApiResponse({
    status: 200,
    description: 'Messages marked as read successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async markConversationAsRead(
    @Param('senderId') senderId: string,
    @Request() req,
  ) {
    return this.chatService.markConversationAsRead(req.user.id, senderId);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all messages as read' })
  @ApiResponse({
    status: 200,
    description: 'All messages marked as read successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Notifications per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getNotifications(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Request() req,
  ) {
    return this.notificationService.getNotifications(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }
}
