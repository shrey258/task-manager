# Task Manager Application

A full-stack task management application built with Next.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Create, read, update, and delete tasks
- Task filtering by priority and status
- Task sorting by start and end time
- Dashboard with task statistics
- Responsive design

## Tech Stack

### Frontend
- Next.js with TypeScript
- Tailwind CSS for styling
- React Query for data fetching
- React Hook Form for form handling

### Backend
- Node.js/Express
- TypeScript
- MongoDB
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Create `.env` files in both frontend and backend directories following the `.env.example` templates

4. Start the development servers:
   ```bash
   # Start backend
   cd backend
   npm run dev

   # Start frontend
   cd frontend
   npm run dev
   ```

## Environment Variables

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_jwt_secret
```

## API Documentation

API documentation is available in Postman. Contact the repository owner for access.
