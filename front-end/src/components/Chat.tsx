import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Badge, Dropdown, Button } from 'react-bootstrap';
import { MessageCircle, User, Settings, Clock, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { chatAPI } from '../services/api';
import ProfileUpload from './ProfileUpload';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import UserList from './UserList';
import { useWebSocket } from '../hooks/useWebSocket';
import { formatLastSeen } from '../utils/timeUtils';
import Box from './Box';

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  senderId: string;
  receiverId?: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    profileImage?: string;
  };
  receiver?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  isSending?: boolean;
}

interface User {
  id: string;
  username: string;
  profileImage?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
  unreadCount?: number;
}

const Chat: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // WebSocket event handlers
  const handleNewMessage = useCallback((message: Message) => {
    // Skip if this is our own message (we'll handle it in handleMessageSent)
    if (message.senderId === user?.id) {
      return;
    }
    
    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const messageExists = prev.some(msg => msg.id === message.id);
      if (messageExists) {
        return prev;
      }
      return [...prev, message];
    });
    
    // Update unread count if message is from someone else and not currently selected
    if (message.senderId !== user?.id && selectedUser?.id !== message.senderId) {
      setUnreadCounts(prev => ({
        ...prev,
        [message.senderId]: (prev[message.senderId] || 0) + 1
      }));
    }
  }, [user?.id, selectedUser?.id]);

  const handleMessageSent = useCallback((message: Message) => {
    setMessages(prev => {
      // Remove any temporary messages with the same content
      const filtered = prev.filter(msg => !msg.id.startsWith('temp-'));
      
      // Check if message already exists to prevent duplicates
      const messageExists = filtered.some(msg => msg.id === message.id);
      if (messageExists) {
        return filtered;
      }
      
      return [...filtered, message];
    });
  }, []);

  const handleUserStatusUpdate = useCallback((data: { userId: string; username: string; status: string; lastSeen: string }) => {
    if (data.status === 'online') {
      setOnlineUsers(prev => new Set(prev).add(data.userId));
      // Update user's lastSeen when they come online
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, status: 'online', lastSeen: data.lastSeen || new Date().toISOString() }
          : user
      ));
    } else {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
      // Update user's lastSeen when they go offline
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, status: 'offline', lastSeen: data.lastSeen || new Date().toISOString() }
          : user
      ));
    }
  }, []);

  const handleOnlineUsersUpdate = useCallback((users: User[]) => {
    const onlineUserIds = new Set(users.map(u => u.id));
    setOnlineUsers(onlineUserIds);
    
    // Update user statuses based on online users
    setUsers(prev => prev.map(user => ({
      ...user,
      status: onlineUserIds.has(user.id) ? 'online' : 'offline'
    })));
  }, []);

  const handleUnreadCountUpdate = useCallback((data: { senderId: string; count: number }) => {
    setUnreadCounts(prev => ({
      ...prev,
      [data.senderId]: data.count
    }));
  }, []);

  const handleMessagesRead = useCallback((data: { readerId: string; readerUsername: string }) => {
    // Handle when someone reads our messages
    console.log(`${data.readerUsername} read our messages`);
  }, []);

  // Update unread counts when they change
  useEffect(() => {
    setUsers(prev => prev.map(user => ({
      ...user,
      unreadCount: unreadCounts[user.id] || 0
    })));
  }, [unreadCounts]);

  // Initialize WebSocket
  const { socket, markAsRead } = useWebSocket({
    token: token || '',
    userId: user?.id || '',
    onNewMessage: handleNewMessage,
    onMessageSent: handleMessageSent,
    onUserStatusUpdate: handleUserStatusUpdate,
    onOnlineUsersUpdate: handleOnlineUsersUpdate,
    onUnreadCountUpdate: handleUnreadCountUpdate,
    onMessagesRead: handleMessagesRead
  });

  // Load users and recent chats with unread counts
  useEffect(() => {
    const loadUsersAndRecentChats = async () => {
      try {
        const recentChatsResponse = await chatAPI.getRecentChats();
        const recentChats = recentChatsResponse.data;
        
        // Extract unique users from recent chats
        const usersMap = new Map<string, User>();
        recentChats.forEach((chat: any) => {
          const otherUser = chat.otherUser || (chat.senderId === user?.id ? chat.receiver : chat.sender);
          if (otherUser && !usersMap.has(otherUser.id)) {
            usersMap.set(otherUser.id, {
              ...otherUser,
              unreadCount: chat.unreadCount || 0,
              lastSeen: otherUser.lastSeen || new Date().toISOString(),
            });
          }
        });
        
        const usersArray = Array.from(usersMap.values());
        setUsers(usersArray);
        
        // Set unread counts
        const counts: Record<string, number> = {};
        usersArray.forEach(userData => {
          counts[userData.id] = userData.unreadCount || 0;
        });
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Failed to load recent chats:', error);
        toast.error('Failed to load recent chats');
      }
    };

    if (user) {
      loadUsersAndRecentChats();
    }
  }, [user]);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      setPage(1);
      setHasMoreMessages(true);
      loadMessages(1, true);
    }
  }, [selectedUser]);

  const loadMessages = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!selectedUser) return;

    // Prevent duplicate calls
    if (reset && loading) {
      console.log('Skipping reset load - already loading');
      return;
    }
    if (!reset && loadingMore) {
      console.log('Skipping pagination load - already loading more');
      return;
    }

    console.log('Starting API call:', { pageNum, reset, loading, loadingMore });

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await chatAPI.getMessages(selectedUser.id, pageNum, 20);
      const newMessages = response.data.messages;

      console.log('API response received:', {
        page: pageNum,
        reset,
        newMessagesCount: newMessages.length,
        firstMessageTime: newMessages[0]?.createdAt,
        lastMessageTime: newMessages[newMessages.length - 1]?.createdAt
      });

      if (reset) {
        setMessages(newMessages);
        setPage(1);
      } else {
        // Prepend old messages at the top
        setMessages(prev => {
          const combined = [...newMessages, ...prev];
          console.log('Combined messages:', {
            totalCount: combined.length,
            oldMessagesCount: prev.length,
            newMessagesCount: newMessages.length
          });
          return combined;
        });
        setPage(pageNum);
      }

      // Check if there are more messages
      setHasMoreMessages(newMessages.length === 20);

    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedUser, loadingMore, loading]);

  const loadMoreMessages = useCallback(() => {
    console.log('loadMoreMessages called with state:', {
      hasMoreMessages,
      loadingMore,
      loading,
      currentPage: page,
      selectedUser: selectedUser?.id
    });

    // Prevent duplicate calls
    if (hasMoreMessages && !loadingMore && !loading) {
      console.log('Loading more messages, page:', page + 1);
      loadMessages(page + 1, false);
    } else {
      console.log('Skipping load more:', {
        hasMoreMessages,
        loadingMore,
        loading,
        currentPage: page
      });
    }
  }, [hasMoreMessages, loadingMore, loading, page, loadMessages, selectedUser]);

  const handleMessageSentCallback = useCallback((message: Message) => {
    // This will be called by MessageInput when a message is sent
    // The WebSocket hook will handle the actual message updates
  }, []);

  const handleUserSelect = useCallback((selectedUserData: User) => {
    setSelectedUser(selectedUserData);
    
    // Mark messages as read when user is selected
    if (selectedUserData.id && unreadCounts[selectedUserData.id]) {
      setUnreadCounts(prev => ({
        ...prev,
        [selectedUserData.id]: 0
      }));
      
      // Call WebSocket to mark messages as read
      markAsRead(selectedUserData.id);
    }
    
    // Close mobile sidebar when user is selected on mobile
    setShowMobileSidebar(false);
  }, [unreadCounts, markAsRead]);

  const getStatusColor = useCallback((userId: string) => {
    return onlineUsers.has(userId) ? 'success' : 'secondary';
  }, [onlineUsers]);

  const getStatusText = useCallback((userId: string) => {
    return onlineUsers.has(userId) ? 'Online' : 'Offline';
  }, [onlineUsers]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleProfileUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Box className="chat-container">
      {/* Header */}
      <Box className="chat-header">
        <Container fluid>
          <Row className="align-items-center py-3">
            <Col>
              <Box className="d-flex align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-md-none me-2"
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                >
                  {showMobileSidebar ? <X size={16} /> : <Menu size={16} />}
                </Button>
                <MessageCircle className="me-2" size={24} color="#007bff" />
                <h4 className="mb-0">JeyaMi Chat</h4>
                <Badge bg="success" className="ms-2">Online</Badge>
              </Box>
            </Col>
            <Col xs="auto">
              <Box className="d-flex align-items-center">
                <span className="me-3 d-none d-sm-inline">Welcome, {user.username}</span>
                <span className="me-3 d-sm-none">{user.username}</span>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <Settings size={16} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setShowProfileUpload(true)}>
                      Update Profile Image
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Box>
            </Col>
          </Row>
        </Container>
      </Box>

      <Container fluid className="h-100">
        <Row className="h-100">
          {/* Users List - Mobile Responsive */}
          <Col 
            md={3} 
            className={`p-0 mobile-sidebar ${showMobileSidebar ? 'show' : ''}`}
          >
            <UserList
              users={users}
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
              onUserSelect={handleUserSelect}
            />
          </Col>

          {/* Chat Area */}
          <Col md={9} className="d-flex flex-column p-0">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <Box className="p-3 border-bottom">
                  <Box className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="d-md-none me-2"
                      onClick={() => setShowMobileSidebar(true)}
                    >
                      <Menu size={16} />
                    </Button>
                    {selectedUser.profileImage ? (
                      <img
                        src={`http://localhost:3000${selectedUser.profileImage}`}
                        className="rounded-circle me-2"
                        width={40}
                        height={40}
                        alt={selectedUser.username}
                      />
                    ) : (
                      <Box className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 40, height: 40 }}>
                        <User size={20} color="white" />
                      </Box>
                    )}
                    <Box>
                      <Box className="d-flex align-items-center">
                        <h6 className="mb-0 me-2">{selectedUser.username}</h6>
                        <Badge
                          bg={getStatusColor(selectedUser.id)}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {getStatusText(selectedUser.id)}
                        </Badge>
                      </Box>
                      {!onlineUsers.has(selectedUser.id) && selectedUser.lastSeen && (
                        <small className="text-muted d-flex align-items-center">
                          <Clock size={12} className="me-1" />
                          Last seen {formatLastSeen(selectedUser.lastSeen)}
                        </small>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Messages */}
                <MessageList
                  messages={messages}
                  currentUserId={user.id}
                  loading={loading}
                  onLoadMoreMessages={loadMoreMessages}
                  hasMoreMessages={hasMoreMessages}
                  loadingMore={loadingMore}
                  page={page}
                />

                {/* Message Input */}
                <MessageInput
                  selectedUserId={selectedUser.id}
                  currentUserId={user.id}
                  onMessageSent={handleMessageSentCallback}
                  socket={socket}
                  uploading={uploading}
                  setUploading={setUploading}
                />
              </>
            ) : (
              <Box className="d-flex align-items-center justify-content-center h-100">
                <Box className="text-center">
                  <MessageCircle size={64} color="#6c757d" className="mb-3" />
                  <h5>Select a user to start chatting</h5>
                  <p className="text-muted d-none d-md-block">Choose from the list on the left</p>
                  <p className="text-muted d-md-none">Choose from the user list</p>
                </Box>
              </Box>
            )}
          </Col>
        </Row>
      </Container>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Profile Upload Modal */}
      <ProfileUpload
        show={showProfileUpload}
        onHide={() => setShowProfileUpload(false)}
        onSuccess={handleProfileUpdate}
      />
    </Box>
  );
};

export default Chat;