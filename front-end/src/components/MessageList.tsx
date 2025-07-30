import React, { useRef, useEffect, memo, useState } from 'react';
import { Image, Card, Spinner, Button } from 'react-bootstrap';
import { User, File, ChevronDown, ChevronUp } from 'lucide-react';
import { formatMessageTime, formatActualTime } from '../utils/timeUtils';
import Box from './Box';
import ImageViewer from './ImageViewer';

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

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  onLoadMoreMessages?: () => void;
  hasMoreMessages?: boolean;
  loadingMore?: boolean;
  page?: number;
}

// Memoized individual message component for better performance
const MessageItem = memo<{ message: Message; currentUserId: string; page: number; onImageClick?: (url: string, fileName?: string) => void }>(({ message, currentUserId, page, onImageClick }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOwnMessage = message.senderId === currentUserId;

  return (
    <Box className={`message ${isOwnMessage ? 'sent' : 'received'}`}>
      {!isOwnMessage && (
        <Box className="message-avatar me-2 mb-1">
          {message.sender.profileImage ? (
            <Image
              src={`http://localhost:3000${message.sender.profileImage}`}
              roundedCircle
              width={32}
              height={32}
            />
          ) : (
            <Box className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
              <User size={18} color="white" />
            </Box>
          )}
        </Box>
      )}

      <Box className={`message-bubble ${message.isSending ? 'sending' : ''}`}>
        {message.type === 'IMAGE' && message.fileUrl && (
          <Box className="mb-2">
            <Image
              src={`http://localhost:3000${message.fileUrl}`}
              fluid
              rounded
              style={{ maxWidth: '200px', cursor: 'pointer' }}
              onClick={() => onImageClick?.(`http://localhost:3000${message.fileUrl}`, message.fileName)}
            />
          </Box>
        )}

        {message.type === 'FILE' && message.fileUrl && (
          <Box className="mb-2">
            <Card className="border">
              <Card.Body className="p-2">
                <Box className="d-flex align-items-center">
                  <File size={20} className="me-2" />
                  <Box>
                    <Box className="fw-bold">{message.fileName}</Box>
                    <small className="text-muted">
                      {message.fileSize && formatFileSize(message.fileSize)}
                    </small>
                  </Box>
                </Box>
              </Card.Body>
            </Card>
          </Box>
        )}

        <Box>{message.content}</Box>
        <Box className="message-time d-flex align-items-center">
          {message.isSending ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              <span>Sending...</span>
            </>
          ) : (
            <Box>
              <Box>{formatMessageTime(message.createdAt)}</Box>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                {formatActualTime(new Date(message.createdAt), { showYear: true })}
              </small>
            </Box>
          )}
        </Box>
      </Box>

      {isOwnMessage && (
        <Box className="message-avatar ms-2 mb-1">
          <Box className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
            <User size={18} color="white" />
          </Box>
        </Box>
      )}
    </Box>
  );
});

MessageItem.displayName = 'MessageItem';

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  loading,
  onLoadMoreMessages,
  hasMoreMessages = false,
  loadingMore = false,
  page = 1
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [oldScrollHeight, setOldScrollHeight] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; fileName?: string } | null>(null);

  // Handle image click
  const handleImageClick = (url: string, fileName?: string) => {
    setSelectedImage({ url, fileName });
  };

  // Handle image viewer close
  const handleImageClose = () => {
    setSelectedImage(null);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Scroll to the very bottom
      const newScrollTop = scrollHeight - clientHeight;

      console.log('Scrolling to bottom:', {
        scrollHeight,
        clientHeight,
        newScrollTop,
        currentScrollTop: container.scrollTop
      });

      // Use smooth scrolling
      container.scrollTo({
        top: newScrollTop,
        behavior: 'smooth'
      });
    }
  };

  // Alternative scroll method using scrollIntoView
  const scrollToBottomAlternative = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const lastMessage = container.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  };

  // Check if user is near top for pagination
  const isNearTop = () => {
    if (!messagesContainerRef.current) return false;
    const { scrollTop } = messagesContainerRef.current;
    const threshold = 100; // pixels from top
    return scrollTop < threshold;
  };

  // Check if user is near bottom
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 100; // pixels from bottom
    return scrollTop + clientHeight >= scrollHeight - threshold;
  };

  // Handle scroll events for pagination
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const nearTop = isNearTop();
    const nearBottom = isNearBottom();

    console.log('Scroll event:', {
      scrollTop: container.scrollTop,
      nearTop,
      nearBottom,
      hasMoreMessages,
      loadingMore,
      isLoadingMore,
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight
    });

    // Show/hide scroll to bottom button
    setShowScrollToBottom(!nearBottom);

    // Load more messages when near top - with protection against duplicate calls
    if (nearTop && hasMoreMessages && !loadingMore && !isLoadingMore && onLoadMoreMessages) {
      console.log('✅ Triggering load more messages from scroll');

      // Store current scroll position and height before loading
      setScrollPosition(container.scrollTop);
      setOldScrollHeight(container.scrollHeight);

      setIsLoadingMore(true);
      onLoadMoreMessages();
    } else if (nearTop) {
      console.log('❌ Cannot load more:', {
        hasMoreMessages,
        loadingMore,
        isLoadingMore,
        onLoadMoreMessages: !!onLoadMoreMessages
      });
    }
  };

  // Preserve scroll position when new messages are loaded
  useEffect(() => {
    if (!loadingMore && isLoadingMore && messagesContainerRef.current && oldScrollHeight > 0) {
      const container = messagesContainerRef.current;

      // Calculate the new scroll position to maintain the same relative position
      const newScrollHeight = container.scrollHeight;
      const heightDifference = newScrollHeight - oldScrollHeight;
      const newScrollTop = scrollPosition + heightDifference;

      // console.log('Restoring scroll position:', {
      //   oldScrollTop: scrollPosition,
      //   oldScrollHeight,
      //   newScrollHeight,
      //   heightDifference,
      //   newScrollTop
      // });

      // Set the new scroll position
      container.scrollTop = newScrollTop;

      // Reset states after a small delay to ensure scroll position is set
      setTimeout(() => {
        setIsLoadingMore(false);
        setScrollPosition(0);
        setOldScrollHeight(0);
        console.log('States reset after scroll restoration');
      }, 50);
    }
  }, [loadingMore, isLoadingMore, scrollPosition, oldScrollHeight]);

  // Reset loading more state when loadingMore changes
  useEffect(() => {
    if (!loadingMore) {
      setIsLoadingMore(false);
    }
  }, [loadingMore]);

  // Scroll to bottom when new messages arrive (only for new messages, not pagination)
  useEffect(() => {
    // Small delay to ensure DOM is updated
    console.log('page', page);
    if (page === 1 && messages.length > 0) {
       const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
   }, [messages, page]);

  // Scroll to bottom when loading finishes
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        // scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Add scroll event listener with throttling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      let timeoutId: ReturnType<typeof setTimeout>;

      const throttledHandleScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, 100); // Throttle to 100ms
      };

      container.addEventListener('scroll', throttledHandleScroll);
      return () => {
        container.removeEventListener('scroll', throttledHandleScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [hasMoreMessages, loadingMore, onLoadMoreMessages, handleScroll]);

  return (
    <Box className="position-relative h-100">
      <Box
        ref={messagesContainerRef}
        className="messages-container overflow-auto p-3"
        style={{
          height: 'calc(100vh - 200px)',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Loading more messages indicator */}
        {loadingMore && (
          <Box className="text-center mb-3">
            <Spinner animation="border" size="sm" />
            <span className="ms-2 text-muted">Loading older messages...</span>
          </Box>
        )}

        {loading && (
          <Box className="text-center mb-3">
            <Spinner animation="border" size="sm" />
          </Box>
        )}

        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            page={page}
            onImageClick={handleImageClick}
          />
        ))}

        {/* Invisible element at bottom for scroll target */}
        <Box style={{ height: '1px' }} children={undefined} />
      </Box>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <Button
          onClick={scrollToBottom}
          className="scroll-to-bottom-btn position-absolute"
          size="sm"
          variant="outline-secondary"
          style={{
            bottom: '80px',
            right: '15px',
            zIndex: 1001,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronDown size={16} />
        </Button>
      )}

      {/* Image Viewer */}
      {selectedImage && (
        <ImageViewer
          imageUrl={selectedImage.url}
          fileName={selectedImage.fileName}
          onClose={handleImageClose}
        />
      )}
    </Box>
  );
};

export default MessageList; 