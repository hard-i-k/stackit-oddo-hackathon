# StackIt - Q&A Platform Backend

A modern Q&A platform backend built with Express.js, Prisma ORM, PostgreSQL, and integrated with Google's Gemini AI for content enhancement.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Questions & Answers**: Full CRUD operations with voting system
- **AI Enhancement**: Google Gemini AI integration for content improvement
- **Real-time Notifications**: User notification system
- **Search & Filtering**: Advanced search with tags and pagination
- **Voting System**: Upvote/downvote answers
- **Answer Acceptance**: Question authors can accept best answers
- **Code Analysis**: AI-powered code review and suggestions

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **AI Integration**: Google Gemini API
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan

## 📁 Project Structure

```
stackit/
├── server/                         # Backend folder
│   ├── controllers/                # Route logic
│   │   ├── authController.js       # User authentication
│   │   ├── questionController.js   # Question management
│   │   ├── answerController.js     # Answer management
│   │   ├── notificationController.js # Notifications
│   │   └── aiController.js         # Gemini AI integration
│   ├── routes/                     # Express route handlers
│   │   ├── auth.js                 # Authentication routes
│   │   ├── questions.js            # Question routes
│   │   ├── answers.js              # Answer routes
│   │   ├── notifications.js        # Notification routes
│   │   └── ai.js                   # AI routes
│   ├── prisma/                     # Database schema
│   │   ├── schema.prisma           # Prisma schema
│   │   └── seed.js                 # Database seeding
│   ├── middleware/                  # Custom middleware
│   │   ├── authMiddleware.js       # JWT authentication
│   │   └── errorHandler.js         # Error handling
│   ├── utils/                      # Helper modules
│   │   └── geminiClient.js         # Gemini API client
│   ├── app.js                      # Express app setup
│   ├── server.js                   # Server entry point
│   ├── package.json                # Dependencies
│   └── env.example                 # Environment variables template
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Google Gemini API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stackit/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/stackit_db"
   
   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   
   # Server Configuration
   PORT=5000
   NODE_ENV="development"
   
   # Gemini API Configuration (optional)
   GEMINI_API_KEY="your-gemini-api-key"
   
   # CORS Configuration
   CORS_ORIGIN="http://localhost:3000"
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed database with sample data
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/change-password` | Change password |

### Questions Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | Get all questions (with filters) |
| GET | `/api/questions/:id` | Get single question |
| POST | `/api/questions` | Create new question |
| PUT | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Delete question |
| PUT | `/api/questions/:questionId/accept/:answerId` | Accept answer |
| GET | `/api/questions/user/:userId` | Get user's questions |

### Answers Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/answers/question/:questionId` | Get answers for question |
| POST | `/api/answers/question/:questionId` | Create new answer |
| PUT | `/api/answers/:id` | Update answer |
| DELETE | `/api/answers/:id` | Delete answer |
| POST | `/api/answers/:id/vote` | Vote on answer |
| GET | `/api/answers/user/:userId` | Get user's answers |

### Notifications Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/notifications/count` | Get notification count |
| PUT | `/api/notifications/:id/read` | Mark notification as read |
| PUT | `/api/notifications/mark-all-read` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |
| DELETE | `/api/notifications` | Delete all notifications |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/status` | Get AI service status |
| POST | `/api/ai/enhance-question` | Enhance question with AI |
| POST | `/api/ai/enhance-answer` | Enhance answer with AI |
| POST | `/api/ai/generate-suggestion` | Generate answer suggestion |
| POST | `/api/ai/analyze-code` | Analyze code with AI |

## 🔧 Database Schema

### User
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String, Hashed)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Question
- `id` (UUID, Primary Key)
- `title` (String)
- `description` (String)
- `tags` (String Array)
- `authorId` (UUID, Foreign Key)
- `acceptedAnswerId` (UUID, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Answer
- `id` (UUID, Primary Key)
- `content` (String)
- `authorId` (UUID, Foreign Key)
- `questionId` (UUID, Foreign Key)
- `upvotes` (Integer)
- `downvotes` (Integer)
- `isAccepted` (Boolean)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Notification
- `id` (UUID, Primary Key)
- `message` (String)
- `userId` (UUID, Foreign Key)
- `isRead` (Boolean)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## 🤖 AI Features

The platform integrates Google's Gemini AI for:

1. **Question Enhancement**: Automatically improve question titles and descriptions
2. **Answer Enhancement**: Enhance answer quality and clarity
3. **Answer Suggestions**: Generate helpful answer suggestions
4. **Code Analysis**: Analyze and review code snippets

To enable AI features, add your Gemini API key to the `.env` file.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS protection
- Helmet security headers
- Rate limiting (can be added)
- SQL injection protection via Prisma

## 🧪 Testing

```bash
# Run database migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# Start development server
npm run dev
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | "7d" |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | "development" |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `CORS_ORIGIN` | CORS allowed origin | "http://localhost:3000" |

## 🚀 Deployment

1. Set up a PostgreSQL database
2. Configure environment variables
3. Run database migrations: `npm run db:push`
4. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team. 
