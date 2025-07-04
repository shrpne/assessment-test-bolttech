# Task Manager Application

A full-stack multi-user task manager web application built with TypeScript.

## Features

- User Registration and Authentication
- Project Management (create, view, edit, delete)
- Task Management with completion tracking
- User isolation (users only access their own projects)
- Tasks with descriptions, creation dates, and finish dates
- Visual status indicators and tooltips
- No full page refresh for better UX

## Tech Stack

### Frontend
- TypeScript
- React
- React Router
- Tanstack Query
- Tanstack Form
- Tailwind CSS

### Backend
- TypeScript
- Node.js
- Drizzle ORM
- SQLite

## Getting Started

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Set up environment variables:
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Frontend  
   cp frontend/env.example frontend/.env
   # Edit the .env files with your configuration
   ```

3. Start development servers:
   ```bash
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Project Structure

- `backend/` - Node.js TypeScript API server
- `frontend/` - React TypeScript application  
- `shared/` - Shared types for type safety between client and server


## Scripts

- `npm run install:all` - Install all dependencies for workspaces
- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run clean` - Clean all dependencies and build files
- `npm run db:push` - Update DB schema 
