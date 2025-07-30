import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: '/uploads/profiles/abc123.jpg',
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
