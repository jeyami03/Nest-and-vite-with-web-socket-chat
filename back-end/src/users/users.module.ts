import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserStatusService } from './user-status.service';

@Module({
  providers: [UsersService, UserStatusService],
  controllers: [UsersController],
  exports: [UsersService, UserStatusService],
})
export class UsersModule {}
