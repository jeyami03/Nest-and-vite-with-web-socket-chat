import type { Message } from './message.interface';
import type { User } from './user.interface';

export interface UseWebSocketProps {
    token: string;
    userId: string;
    onNewMessage: (message: Message) => void;
    onMessageSent: (message: Message) => void;
    onUserStatusUpdate: (data: { userId: string; username: string; status: string; lastSeen: string }) => void;
    onOnlineUsersUpdate: (users: User[]) => void;
    onUnreadCountUpdate: (data: { senderId: string; count: number }) => void;
    onMessagesRead: (data: { readerId: string; readerUsername: string }) => void;
}