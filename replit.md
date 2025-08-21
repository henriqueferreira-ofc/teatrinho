# Overview

This is a Firebase-integrated React application called "Teatrinho" - an eBook creation and management platform. The project is built with a modern full-stack architecture using React + TypeScript on the frontend, Express.js for the backend, and Firebase for authentication and data storage. The application features a responsive mobile-first design with tab-based navigation for Home, eBooks, and Profile sections.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern React features
- **Vite** as the build tool and development server for fast hot reloading
- **Component-based architecture** using a combination of custom components and shadcn/ui component library
- **TanStack Query** for server state management and data fetching
- **React Hook Form** with Zod validation for form handling and validation
- **Context API** for authentication state management across the application

## Styling and UI
- **Tailwind CSS** for utility-first styling with custom CSS variables for theming
- **shadcn/ui component library** providing pre-built, accessible components
- **Radix UI primitives** as the foundation for complex UI components
- **Responsive design** with mobile-first approach using Tailwind breakpoints
- **Light mode only** - dark mode support is explicitly not implemented

## Authentication and User Management
- **Firebase Authentication** as the primary authentication provider
- **Email/password authentication** and **Google OAuth** sign-in options
- **Firestore** for storing user profile data with automatic timestamp management
- **Real-time auth state monitoring** using Firebase's onAuthStateChanged
- **Profile management** with name and password update capabilities

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **Memory-based storage interface** with extensible storage abstraction for future database integration
- **Drizzle ORM** configured for PostgreSQL (prepared for future database integration)
- **Session management** using connect-pg-simple (currently unused but configured)
- **RESTful API design** with `/api` prefix for all backend routes

## Data Validation and Schema
- **Zod schemas** for runtime type validation shared between client and server
- **Firestore user schema** with fields for id, name, email, provider, and timestamps
- **Form validation schemas** for login, registration, and profile updates
- **Type-safe data flow** from frontend forms through validation to Firebase

## Development and Build Tools
- **ESM modules** throughout the application for modern JavaScript standards
- **Path aliases** configured for clean imports (`@/`, `@shared/`)
- **TypeScript strict mode** enabled for maximum type safety
- **Vite plugins** for development enhancements including error overlays and debugging tools

## Application Structure
- **Monorepo structure** with shared schemas between client and server
- **Feature-based organization** with separate pages for Home, eBooks, and Profile
- **Protected routing** with authentication checks before accessing main application
- **Tab-based navigation** with persistent state management

# External Dependencies

## Firebase Services
- **Firebase Authentication** - User registration, login, and session management
- **Firestore Database** - User profile data storage with real-time capabilities  
- **Firebase Storage** - Configured but not actively used (prepared for future file uploads)
- **Google OAuth Provider** - Social login integration

## UI and Design Libraries
- **shadcn/ui** - Comprehensive React component library built on Radix UI
- **Radix UI** - Unstyled, accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework with custom design tokens
- **Lucide React** - Icon library for consistent iconography

## Form and State Management
- **React Hook Form** - Performant form library with minimal re-renders
- **TanStack Query** - Server state management and caching
- **Zod** - Runtime schema validation and type generation

## Development and Build Tools
- **Vite** - Fast build tool and development server
- **TypeScript** - Static type checking and improved developer experience
- **ESBuild** - Fast JavaScript bundler for production builds
- **PostCSS** - CSS processing with Tailwind and Autoprefixer

## Database and ORM (Prepared)
- **Drizzle ORM** - Type-safe SQL ORM configured for PostgreSQL
- **Neon Database** - Serverless PostgreSQL provider (configured but not actively used)
- **connect-pg-simple** - PostgreSQL session store for Express