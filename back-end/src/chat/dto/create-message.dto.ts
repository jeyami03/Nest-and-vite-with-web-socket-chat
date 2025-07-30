import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Type of message',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @ApiPropertyOptional({
    description: 'File URL for file/image messages',
    example: '/uploads/chat/abc123.jpg',
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'Original filename',
    example: 'image.jpg',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 1024,
  })
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({
    description: 'File MIME type',
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiProperty({
    description: 'Sender user ID',
    example: 'clx1234567890',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiPropertyOptional({
    description: 'Receiver user ID',
    example: 'clx0987654321',
  })
  @IsOptional()
  @IsString()
  receiverId?: string;
}

export class UploadFileDto {
  @ApiProperty({
    description: 'Receiver user ID',
    example: 'clx0987654321',
  })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiPropertyOptional({
    description: 'Message content (optional caption for file)',
    example: 'Check out this image!',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Type of message',
    enum: MessageType,
    default: MessageType.FILE,
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.FILE;
}
