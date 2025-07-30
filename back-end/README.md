<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# NestJS Chat Application

A real-time chat application built with NestJS backend and React frontend, featuring authentication, WebSocket support, file uploads, and real-time messaging.

## Features

- 🔐 **JWT Authentication** - Secure login/register with JWT tokens
- 💬 **Real-time Messaging** - WebSocket-based instant messaging
- 📁 **File Uploads** - Support for images and documents
- 👥 **User Management** - User profiles and friend lists
- 📱 **Responsive Design** - Bootstrap-based modern UI
- 🔄 **Pagination** - Efficient message loading with scroll pagination
- 🔔 **Notifications** - Toast notifications for new messages
- 🖼️ **Profile Images** - User profile picture uploads

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Database ORM with PostgreSQL
- **Socket.io** - Real-time WebSocket communication
- **JWT** - JSON Web Token authentication
- **Passport** - Authentication middleware
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library with TypeScript
- **Vite** - Fast build tool
- **Bootstrap** - CSS framework
- **Socket.io-client** - WebSocket client
- **React Router** - Client-side routing
- **React Toastify** - Toast notifications
- **Axios** - HTTP client

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd nest-node-chat
```

### 2. Install backend dependencies
```bash
npm install
```

### 3. Set up the database
```bash
# Update .env file with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/chat_app"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 4. Install frontend dependencies
```bash
cd frontend
npm install
```

## Running the Application

### Backend
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The backend will be available at `http://localhost:3000`

### Frontend
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)

### Users
- `GET /users` - Get all users (protected)
- `GET /users/:id` - Get specific user (protected)
- `PUT /users/profile` - Update profile (protected)

### Chat
- `GET /chat/messages/:receiverId` - Get messages with pagination (protected)
- `GET /chat/recent` - Get recent conversations (protected)
- `POST /chat/message` - Send text message (protected)
- `POST /chat/upload` - Upload file/image (protected)

### WebSocket Events
- `sendMessage` - Send a message
- `typing` - Send typing indicator
- `newMessage` - Receive new message
- `userTyping` - Receive typing indicator

## Database Schema

### Users Table
- `id` - Unique identifier
- `username` - Unique username
- `password` - Hashed password
- `email` - Optional email
- `profileImage` - Profile picture URL
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Messages Table
- `id` - Unique identifier
- `content` - Message content
- `type` - Message type (TEXT, IMAGE, FILE)
- `fileUrl` - File URL (for file/image messages)
- `fileName` - Original filename
- `fileSize` - File size in bytes
- `fileType` - MIME type
- `senderId` - Sender user ID
- `receiverId` - Receiver user ID
- `createdAt` - Message timestamp
- `updatedAt` - Last update timestamp

## File Structure

```
nest-node-chat/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── guards/          # JWT and local guards
│   │   ├── strategies/      # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/               # Users module
│   │   ├── dto/            # Data transfer objects
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── chat/                # Chat module
│   │   ├── dto/            # Message DTOs
│   │   ├── chat.gateway.ts # WebSocket gateway
│   │   ├── chat.service.ts
│   │   ├── chat.controller.ts
│   │   └── chat.module.ts
│   ├── prisma/              # Database module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Chat.tsx
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── prisma/
│   └── schema.prisma        # Database schema
├── uploads/                 # File uploads directory
│   ├── profiles/           # Profile images
│   └── chat/               # Chat files
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/chat_app"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Select User**: Choose a user from the left sidebar to start chatting
3. **Send Messages**: Type and send text messages
4. **Upload Files**: Click the paperclip icon to upload images or documents
5. **Real-time Updates**: Messages appear instantly for both sender and receiver
6. **Typing Indicators**: See when other users are typing
7. **Notifications**: Get toast notifications for new messages

## Development

### Backend Development
```bash
# Run in development mode with hot reload
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

### Frontend Development
```bash
cd frontend

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
