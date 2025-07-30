import React, { memo } from 'react';
import { ListGroup, Image, Badge } from 'react-bootstrap';
import { User, Clock } from 'lucide-react';
import { formatLastSeen } from '../utils/timeUtils';
import Box from './Box';

interface User {
  id: string;
  username: string;
  profileImage?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
  unreadCount?: number;
}

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onlineUsers: Set<string>;
  onUserSelect: (user: User) => void;
}

// Memoized individual user item for better performance
const UserItem = memo<{ 
  user: User; 
  isSelected: boolean; 
  isOnline: boolean; 
  onSelect: (user: User) => void; 
}>(({ user, isSelected, isOnline, onSelect }) => {
  const getStatusColor = () => isOnline ? 'success' : 'secondary';
  const getStatusText = () => isOnline ? 'Online' : 'Offline';

  return (
    <ListGroup.Item
      action
      active={isSelected}
      onClick={() => onSelect(user)}
      className={`d-flex align-items-center user-list-item ${isSelected ? 'active' : ''}`}
    >
      <Box className="position-relative me-2 user-avatar">
        {user.profileImage ? (
          <Image
            src={`http://localhost:3000${user.profileImage}`}
            roundedCircle
            width={32}
            height={32}
            className="user-profile-image"
            alt={user.username}
          />
        ) : (
          <Box className="bg-secondary rounded-circle d-flex align-items-center justify-content-center user-profile-placeholder" style={{ width: 32, height: 32 }}>
            <User size={16} color="white" />
          </Box>
        )}
        <div
          className={`position-absolute bottom-0 end-0 rounded-circle border border-white status-indicator ${isOnline ? 'online' : 'offline'}`}
          style={{
            width: '12px',
            height: '12px'
          }}
        />
      </Box>
      <Box className="flex-grow-1 user-info">
        <Box className="d-flex align-items-center justify-content-between">
          <span className="fw-medium user-name">{user.username}</span>
          {user.unreadCount && user.unreadCount > 0 && (
            <Badge bg="danger" className="unread-badge">
              {user.unreadCount > 99 ? '99+' : user.unreadCount}
            </Badge>
          )}
        </Box>
        <Box className="d-flex align-items-center">
          <small className="text-muted d-flex align-items-center user-status">
            {isOnline ? (
              <>
                <div className="status-dot online me-1" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#28a745' }} />
                {getStatusText()}
              </>
            ) : (
              <>
                <Clock size={10} className="me-1" />
                {user.lastSeen ? formatLastSeen(user.lastSeen) : 'Unknown'}
              </>
            )}
          </small>
        </Box>
      </Box>
    </ListGroup.Item>
  );
});

UserItem.displayName = 'UserItem';

const UserList: React.FC<UserListProps> = ({ users, selectedUser, onlineUsers, onUserSelect }) => {
  return (
    <Box className="border-end p-0 user-list-container">
      <Box className="p-3 border-bottom user-list-header">
        <h6 className="mb-0">Users</h6>
      </Box>
      <ListGroup variant="flush" className="overflow-auto user-list" style={{ height: 'calc(100vh - 200px)' }}>
        {users.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            isSelected={selectedUser?.id === user.id}
            isOnline={onlineUsers.has(user.id)}
            onSelect={onUserSelect}
          />
        ))}
      </ListGroup>
    </Box>
  );
};

export default UserList; 