import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, senderId: string, messageId: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        senderId,
        messageId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        message: {
          select: {
            id: true,
            content: true,
            type: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getUnreadCounts(userId: string) {
    const notifications = await this.prisma.notification.groupBy({
      by: ['senderId'],
      where: {
        userId,
        isRead: false,
      },
      _count: {
        id: true,
      },
    });

    const unreadCounts = new Map<string, number>();
    notifications.forEach((notification) => {
      unreadCounts.set(notification.senderId, notification._count.id);
    });

    return unreadCounts;
  }

  async markAsRead(userId: string, senderId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        senderId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          userId,
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
          message: {
            select: {
              id: true,
              content: true,
              type: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.notification.count({
        where: {
          userId,
        },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
} 