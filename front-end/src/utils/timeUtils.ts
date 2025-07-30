/**
 * Time utility functions for chat application
 */

export interface TimeFormatOptions {
  showSeconds?: boolean;
  showYear?: boolean;
  showFullDate?: boolean;
}

/**
 * Format time difference for last seen and message timestamps
 * @param dateString - ISO date string
 * @param options - Formatting options
 * @returns Formatted time string
 */
export const formatTimeAgo = (dateString: string, options: TimeFormatOptions = {}): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  // More than 7 days - show actual date
  return formatActualTime(date, options);
};

/**
 * Format actual time with AM/PM
 * @param date - Date object
 * @param options - Formatting options
 * @returns Formatted time string
 */
export const formatActualTime = (date: Date, options: TimeFormatOptions = {}): string => {
  const {
    showSeconds = false,
    showYear = true,
    showFullDate = false
  } = options;

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  // Time format
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  if (showSeconds) {
    timeOptions.second = '2-digit';
  }

  const timeString = date.toLocaleTimeString([], timeOptions);

  // If it's today, just show time
  if (isToday) {
    return timeString;
  }

  // If it's this year, show date and time
  if (isThisYear && !showFullDate) {
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };
    const dateString = date.toLocaleDateString([], dateOptions);
    return `${dateString}, ${timeString}`;
  }

  // Full date format
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: showYear ? 'numeric' : undefined,
    month: 'short',
    day: 'numeric'
  };

  const dateString = date.toLocaleDateString([], dateOptions);
  return `${dateString}, ${timeString}`;
};

/**
 * Format message time for chat bubbles
 * @param dateString - ISO date string
 * @returns Formatted time string
 */
export const formatMessageTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than 1 hour - show actual time with AM/PM
  if (diffInSeconds < 3600) {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // More than 1 hour - show time ago
  return formatTimeAgo(dateString);
};

/**
 * Format last seen time for user status
 * @param dateString - ISO date string
 * @returns Formatted time string
 */
export const formatLastSeen = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than 1 hour - show actual time with AM/PM
  if (diffInSeconds < 3600) {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // More than 1 hour - show time ago
  return formatTimeAgo(dateString);
};

/**
 * Format file upload time
 * @param dateString - ISO date string
 * @returns Formatted time string
 */
export const formatFileTime = (dateString: string): string => {
  return formatActualTime(new Date(dateString), {
    showSeconds: false,
    showYear: true,
    showFullDate: true
  });
};

/**
 * Check if a date is today
 * @param dateString - ISO date string
 * @returns boolean
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is yesterday
 * @param dateString - ISO date string
 * @returns boolean
 */
export const isYesterday = (dateString: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(dateString);
  return date.toDateString() === yesterday.toDateString();
};

/**
 * Get relative date string (Today, Yesterday, or actual date)
 * @param dateString - ISO date string
 * @returns string
 */
export const getRelativeDate = (dateString: string): string => {
  if (isToday(dateString)) {
    return 'Today';
  }
  if (isYesterday(dateString)) {
    return 'Yesterday';
  }
  return formatActualTime(new Date(dateString), { showYear: false });
}; 