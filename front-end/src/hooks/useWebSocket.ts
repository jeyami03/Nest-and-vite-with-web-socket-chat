import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import type { UseWebSocketProps } from './interface/web.socket';
import type { Message } from './interface/message.interface';
import type { User } from './interface/user.interface';

export const useWebSocket = ({
  token,
  userId,
  onNewMessage,
  onMessageSent,
  onUserStatusUpdate,
  onOnlineUsersUpdate,
  onUnreadCountUpdate,
  onMessagesRead
}: UseWebSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Activity tracking function - moved outside useEffect
  const handleUserActivity = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('userActivity', { status: 'online' });
    }
  }, [socket, isConnected]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      newSocket.emit('getOnlineUsers');
      newSocket.emit('getUnreadCounts');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      onNewMessage(message);
    });

    newSocket.on('messageSent', (message: Message) => {
      onMessageSent(message);
    });

    newSocket.on('userStatusUpdate', (data: { userId: string; username: string; status: string; lastSeen: string }) => {
      if (data.userId !== userId) {
        onUserStatusUpdate(data);
      }
    });

    newSocket.on('onlineUsers', (users: User[]) => {
      onOnlineUsersUpdate(users);
    });

    newSocket.on('unreadCountUpdate', (data: { senderId: string; count: number }) => {
      onUnreadCountUpdate(data);
    });

    newSocket.on('unreadCounts', (counts: Record<string, number>) => {
      // Handle initial unread counts
      Object.entries(counts).forEach(([senderId, count]) => {
        onUnreadCountUpdate({ senderId, count });
      });
    });

    newSocket.on('messagesRead', (data: { readerId: string; readerUsername: string }) => {
      onMessagesRead(data);
    });

    newSocket.on('error', (error: any) => {
      toast.error('WebSocket error: ' + error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, userId, onNewMessage, onMessageSent, onUserStatusUpdate, onOnlineUsersUpdate, onUnreadCountUpdate, onMessagesRead]);

  // Activity tracking for away status - fixed hook usage
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Throttled activity tracking
    let timeoutId: ReturnType<typeof setTimeout>;
    const throttledActivity = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleUserActivity, 1000);
    };

    document.addEventListener('click', throttledActivity, { passive: true });
    document.addEventListener('keypress', throttledActivity, { passive: true });

    // Initial activity
    handleUserActivity();

    return () => {
      document.removeEventListener('click', throttledActivity);
      document.removeEventListener('keypress', throttledActivity);
      clearTimeout(timeoutId);
    };
  }, [socket, isConnected, handleUserActivity]);

  const markAsRead = useCallback((senderId: string) => {
    if (socket && isConnected) {
      socket.emit('markAsRead', { senderId });
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    markAsRead
  };
}; 