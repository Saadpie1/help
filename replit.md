# YouTube Studio Automation Platform

## Overview

This is a full-stack YouTube content automation platform built with React, Express.js, and PostgreSQL. The application helps content creators automate their YouTube workflow from video creation to upload and scheduling. It features a modern dashboard interface with multiple specialized tools for content management, thumbnail generation, SEO optimization, and analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with structured JSON responses
- **Middleware**: Custom logging, error handling, and request parsing
- **Development**: Hot reloading with Vite integration in development mode

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas for runtime type validation

## Key Components

### Core Entities
1. **Projects**: Main content creation units with status tracking (draft, processing, complete, scheduled, uploaded)
2. **System Status**: Service health monitoring for external integrations
3. **Activities**: Audit log for user actions and system events
4. **Users**: Authentication and user management (schema defined but not fully implemented)

### Frontend Pages
1. **Dashboard**: Overview with stats, recent projects, and quick actions
2. **Video Creator**: Project management and video generation interface
3. **Thumbnail Studio**: AI-powered thumbnail generation tool
4. **Content Optimizer**: SEO and keyword research tools
5. **Upload Manager**: Bulk YouTube upload management
6. **Scheduler**: Content scheduling and publication timing
7. **Analytics**: Performance metrics and reporting

### UI Component System
- Consistent design system using Radix UI primitives
- Custom shadcn/ui components for forms, dialogs, and data display
- Responsive layout with mobile-first approach
- Dark/light theme support via CSS variables

## Data Flow

### Project Lifecycle
1. **Creation**: Users create projects with title, topic, category, and video length
2. **Processing**: Projects move through processing stages with progress tracking
3. **Completion**: Finished projects await thumbnail generation and optimization
4. **Scheduling**: Content can be scheduled for future publication
5. **Upload**: Final upload to YouTube with metadata and tracking

### State Management
- Server state managed by TanStack React Query with caching and background refetching
- Local component state for forms and UI interactions
- Optimistic updates for better user experience

### API Communication
- RESTful endpoints for CRUD operations on projects, activities, and system status
- Centralized API client with error handling and request/response logging
- Type-safe API contracts using shared TypeScript schemas

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public` directory
2. **Backend**: esbuild compiles TypeScript server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Production vs development mode switching
- Replit-specific optimizations and error handling

### Production Deployment
- Single Node.js process serving both API and static files
- Express serves built React app for client-side routing
- Database schema migrations run separately from application deployment

### Development Workflow
- Hot reloading for both frontend and backend code
- Integrated development server with proxy setup
- Real-time error overlay for debugging
- Comprehensive logging for API requests and responses

## Key Architectural Decisions

### Database Design
- **Problem**: Need for flexible project metadata and status tracking
- **Solution**: JSONB fields for extensible metadata, enum-like text fields for status
- **Rationale**: Provides flexibility while maintaining queryability and type safety

### State Management
- **Problem**: Complex server state synchronization across multiple pages
- **Solution**: TanStack React Query with centralized query client
- **Rationale**: Automatic caching, background refetching, and optimistic updates

### UI Architecture
- **Problem**: Need for consistent, accessible, and customizable UI components
- **Solution**: Radix UI + shadcn/ui + Tailwind CSS combination
- **Rationale**: Provides accessibility, customization, and developer experience

### API Design
- **Problem**: Type safety between frontend and backend
- **Solution**: Shared TypeScript schemas and centralized API client
- **Rationale**: Prevents runtime errors and improves developer experience

### File Structure
- **Problem**: Separation of concerns in full-stack TypeScript application
- **Solution**: Separate client, server, and shared directories
- **Rationale**: Clear boundaries, shared types, and independent deployment capabilities