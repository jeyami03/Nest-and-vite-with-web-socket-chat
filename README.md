# JeyaMi Chat Application

A real-time chat application built with NestJS backend and React frontend, featuring WebSocket communication, user authentication, file sharing, and unread message notifications.

## 🚀 Features

- **Real-time Messaging**: WebSocket-based instant messaging
- **User Authentication**: JWT-based authentication system
- **File Sharing**: Support for images, documents, and other file types
- **Online Status**: Real-time user online/offline status
- **Unread Message Counts**: Smart notification system that only updates when users are online
- **Message History**: Paginated message history with infinite scroll
- **Profile Management**: User profile image upload and management
- **Responsive Design**: Mobile-friendly interface
- **Typing Indicators**: Real-time typing status
- **Message Read Status**: Track when messages are read

## 🏗️ Architecture

### Backend (NestJS)

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **WebSocket**: Socket.io for real-time communication
- **File Upload**: Multer for file handling
- **Validation**: Class-validator and class-transformer

### Frontend (React)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: React Bootstrap
- **State Management**: React Context API
- **WebSocket**: Socket.io-client
- **HTTP Client**: Axios
- **Styling**: CSS with Bootstrap

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jeyami03/Nest-and-vite-with-web-socket-chat.git
cd nest-node-chat
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd back-end

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Create a `.env` file in the `back-end` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jeyami_chat"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# File Upload
UPLOAD_DESTINATION="./uploads"
MAX_FILE_SIZE=10485760
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../front-end

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Create a `.env` file in the `front-end` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## 🚀 Running the Application

### Development Mode

#### Backend

```bash
cd back-end

# Start in development mode with hot reload
npm run start:dev

# Or start in watch mode
npm run start:debug
```

#### Frontend

```bash
cd front-end

# Start development server
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **WebSocket**: ws://localhost:3000

### Production Mode

#### Backend

```bash
cd back-end

# Build the application
npm run build

# Start production server
npm run start:prod
```

#### Frontend

```bash
cd front-end

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

#### Backend

```bash
cd back-end
docker build -t jeyami-chat-backend .
docker run -p 3000:3000 jeyami-chat-backend
```

#### Frontend

```bash
cd front-end
docker build -t jeyami-chat-frontend .
docker run -p 80:80 jeyami-chat-frontend
```

## 📁 Project Structure

```
nest-node-chat/
├── back-end/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── chat/            # Chat functionality
│   │   ├── users/           # User management
│   │   ├── prisma/          # Database configuration
│   │   └── main.ts          # Application entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── uploads/             # File uploads directory
│   └── package.json
├── front-end/               # React Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## 🔧 Available Scripts

### Backend Scripts

```bash
npm run build          # Build the application
npm run start          # Start the application
npm run start:dev      # Start in development mode
npm run start:debug    # Start in debug mode
npm run start:prod     # Start in production mode
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run test:cov       # Run test coverage
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
```

### Frontend Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
```

## 🌐 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Chat

- `GET /chat/messages/:receiverId` - Get messages with pagination
- `POST /chat/message` - Send text message
- `POST /chat/upload` - Upload file and send as message
- `GET /chat/recent` - Get recent conversations
- `POST /chat/mark-read/:senderId` - Mark messages as read
- `GET /chat/notifications` - Get user notifications

### Users

- `GET /users` - Get all users
- `PUT /users/profile` - Update user profile
- `POST /users/profile-image` - Upload profile image

## 🔌 WebSocket Events

### Client to Server

- `sendMessage` - Send a message
- `markAsRead` - Mark messages as read
- `typing` - Send typing indicator
- `userActivity` - Update user activity status
- `getOnlineUsers` - Get online users
- `getUnreadCounts` - Get unread message counts

### Server to Client

- `newMessage` - Receive new message
- `messageSent` - Confirm message sent
- `userStatusUpdate` - User online/offline status
- `onlineUsers` - List of online users
- `unreadCountUpdate` - Update unread count
- `messagesRead` - Message read confirmation
- `userTyping` - Typing indicator

## 🔒 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jeyami_chat"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# File Upload
UPLOAD_DESTINATION="./uploads"
MAX_FILE_SIZE=10485760
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## 🚀 Deployment

### Vercel Deployment (Frontend)

```bash
cd front-end
npm run build
vercel --prod
```

### Railway Deployment (Backend)

```bash
cd back-end
railway login
railway init
railway up
```

### Heroku Deployment

```bash
# Backend
cd back-end
heroku create jeyami-chat-backend
heroku addons:create heroku-postgresql
git push heroku main

# Frontend
cd front-end
heroku create jeyami-chat-frontend
git push heroku main
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/jeyami03/Nest-and-vite-with-web-socket-chat/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 📂 GitHub Repository

**Repository Name**: `Nest-and-vite-with-web-socket-chat`

**GitHub URL**: https://github.com/jeyami03/Nest-and-vite-with-web-socket-chat

**Clone URL**: `https://github.com/jeyami03/Nest-and-vite-with-web-socket-chat.git`

## 🔄 Recent Updates

- **v1.2.0**: Improved unread count system - only updates when users are online
- **v1.1.0**: Added file sharing and typing indicators
- **v1.0.0**: Initial release with basic chat functionality

---

**Built with ❤️ using NestJS and React**
