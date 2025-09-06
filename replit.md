# Attendance Tracker Application

## Overview

This is a comprehensive attendance tracking web application built for educational institutions. The system supports two user roles: teachers and students. Teachers can create classes, schedule lectures, and track student attendance, while students can join classes and view their attendance records. The application features a modern React frontend with shadcn/ui components, an Express.js backend with PostgreSQL database integration, and real-time attendance management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable interface components
- **Styling**: Tailwind CSS with CSS variables for consistent theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling and validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for robust server-side development
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: Passport.js with local strategy for user authentication and session management
- **Session Storage**: Express sessions with PostgreSQL session store for persistent login state
- **Password Security**: Node.js crypto module with scrypt hashing for secure password storage
- **API Design**: RESTful API endpoints with proper HTTP status codes and error handling

### Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Structure**: 
  - Users table with role-based access (teacher/student)
  - Classes table with unique class codes for student enrollment
  - Enrollments table for many-to-many relationship between students and classes
  - Lectures table for scheduled class sessions
  - Attendance records table for tracking student presence/absence/late status
- **Migrations**: Drizzle Kit for database schema versioning and deployment

### Authentication & Authorization
- **Authentication Strategy**: Session-based authentication with secure password hashing
- **Role-Based Access**: Two-tier role system (teacher/student) with different permissions
- **Session Management**: Persistent sessions stored in PostgreSQL with configurable expiration
- **Route Protection**: Protected routes with role-based redirections

### Key Features
- **Class Management**: Teachers can create classes with unique codes and passwords
- **Student Enrollment**: Students join classes using class codes and passwords
- **Lecture Scheduling**: Teachers can schedule lectures for their classes
- **Attendance Tracking**: Real-time attendance marking with status options (present/absent/late)
- **Analytics Dashboard**: Teachers can view attendance statistics and student performance
- **Responsive Design**: Mobile-first design approach with adaptive layouts

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection for cloud database integration
- **drizzle-orm** & **drizzle-kit**: Type-safe ORM and migration tools for database management
- **express** & **express-session**: Web framework and session management
- **passport** & **passport-local**: Authentication middleware and local strategy
- **connect-pg-simple**: PostgreSQL session store adapter

### Frontend Libraries
- **@tanstack/react-query**: Server state management and data fetching
- **@radix-ui/***: Comprehensive UI component primitives for accessibility
- **react-hook-form** & **@hookform/resolvers**: Form handling and validation
- **zod** & **drizzle-zod**: Schema validation and type inference
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority** & **clsx**: Dynamic CSS class management

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking for JavaScript
- **tsx**: TypeScript execution for Node.js development
- **esbuild**: Fast JavaScript/TypeScript bundler for production builds

### UI Enhancement Libraries
- **date-fns**: Date manipulation and formatting utilities
- **lucide-react**: Modern icon library for React applications
- **embla-carousel-react**: Touch-friendly carousel component
- **vaul**: Drawer/modal component for mobile interfaces