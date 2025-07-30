import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Chat API functions
export const chatAPI = {
  getMessages: (receiverId: string, page = 1, limit = 20) =>
    api.get(`/chat/messages/${receiverId}?page=${page}&limit=${limit}`),
  
  getRecentChats: () => api.get('/chat/recent'),
  
  sendMessage: (data: any) => api.post('/chat/message', data),
  
  uploadFile: (formData: FormData) =>
    api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  markConversationAsRead: (senderId: string) =>
    api.post(`/chat/mark-read/${senderId}`),
  
  markAllAsRead: () => api.post('/chat/mark-all-read'),
  
  getNotifications: (page = 1, limit = 20) =>
    api.get(`/chat/notifications?page=${page}&limit=${limit}`),
};

export default api; 