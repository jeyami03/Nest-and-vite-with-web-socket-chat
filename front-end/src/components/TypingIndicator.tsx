import React from 'react';

interface TypingIndicatorProps {
  username?: string;
  variant?: 'default' | 'header' | 'compact' | 'right';
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  username, 
  variant = 'default',
  className = ''
}) => {
  if (variant === 'header') {
    return (
      <div className={`typing-indicator-header ${className}`}>
        <span>{username || 'Someone'} is typing</span>
        <div className="typing-dots-header">
          <div className="typing-dot-header"></div>
          <div className="typing-dot-header"></div>
          <div className="typing-dot-header"></div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`typing-indicator-header ${className}`}>
        <div className="typing-dots-header">
          <div className="typing-dot-header"></div>
          <div className="typing-dot-header"></div>
          <div className="typing-dot-header"></div>
        </div>
      </div>
    );
  }

  if (variant === 'right') {
    return (
      <div className={`typing-indicator-right ${className}`}>
        <span>You are typing</span>
        <div className="typing-dots-right">
          <div className="typing-dot-right"></div>
          <div className="typing-dot-right"></div>
          <div className="typing-dot-right"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`typing-indicator ${className}`}>
      <span>{username || 'Someone'} is typing</span>
      <div className="typing-dots">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );
};

export default TypingIndicator; 