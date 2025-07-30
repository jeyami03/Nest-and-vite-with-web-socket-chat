import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserStatusService {
  private readonly logger = new Logger(UserStatusService.name);

  constructor(private prisma: PrismaService) {}

  async createStatusUpdate(userId: string, status: 'online' | 'offline' | 'away') {
    const statusUpdate = await this.prisma.userStatus.create({
      data: {
        userId,
        status,
        lastSeen: new Date(),
        isProcessed: false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    this.logger.log(`Created ${status} status update for user ${statusUpdate.user.username} - will be processed in ${status === 'online' ? '10' : '30'} seconds`);

    return statusUpdate;
  }

  async markStatusAsProcessed(statusId: string) {
    return this.prisma.userStatus.update({
      where: { id: statusId },
      data: { isProcessed: true },
    });
  }

  async getUnprocessedStatusUpdates() {
    return this.prisma.userStatus.findMany({
      where: {
        isProcessed: false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getLatestStatusForUser(userId: string) {
    return this.prisma.userStatus.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async getUserLastSeen(userId: string) {
    const latestStatus = await this.getLatestStatusForUser(userId);
    return latestStatus?.lastSeen || new Date();
  }

  async cleanupOldStatusUpdates(daysToKeep: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return this.prisma.userStatus.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isProcessed: true,
      },
    });
  }
} 