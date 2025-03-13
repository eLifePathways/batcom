# Technical Architecture

This document describes the technical architecture of the Bat-Com Research Platform.

## System Overview

The Bat-Com Research Platform is a modern web application built using a TypeScript-based stack. It features a React frontend, an Express backend, and a PostgreSQL database, all tied together with a cohesive API design.

```
┌─────────────────┐          ┌──────────────┐          ┌─────────────┐
│                 │          │              │          │             │
│  React Frontend │◄─────────┤  Express API │◄─────────┤  PostgreSQL │
│                 │          │              │          │             │
└─────────────────┘          └──────────────┘          └─────────────┘
       │                            │                         │
       │                            │                         │
       ▼                            ▼                         ▼
┌─────────────────┐          ┌──────────────┐          ┌─────────────┐
│                 │          │              │          │             │
│   React Query   │          │  Drizzle ORM │          │   Database  │
│                 │          │              │          │   Schema    │
└─────────────────┘          └──────────────┘          └─────────────┘
```

## Component Architecture

### Frontend Architecture

The frontend follows a component-based architecture using React:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                       App.tsx                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                        Routes                           │
│                                                         │
├───────────────┬───────────────────────┬────────────────┤
│               │                       │                │
│  Public Pages │    Admin Pages        │ Shared Layout  │
│               │                       │                │
└───────────────┴───────────────────────┴────────────────┘
       │                 │                      │
       ▼                 ▼                      ▼
┌───────────────┐ ┌─────────────────┐  ┌────────────────┐
│               │ │                 │  │                │
│ UI Components │ │ Admin Components│  │ Layout         │
│ & Sections    │ │                 │  │ Components     │
│               │ │                 │  │                │
└───────────────┘ └─────────────────┘  └────────────────┘
```

The frontend architecture is organized as follows:

- **Pages**: Route components that define the different screens of the application
- **Layouts**: Shared layout components that define the structure of pages
- **Sections**: Reusable page sections for common content patterns
- **UI Components**: Reusable UI elements built on top of ShadCN UI
- **Hooks**: Custom React hooks for shared logic
- **Utils**: Utility functions
- **Lib**: Core libraries and configuration

### Backend Architecture

The backend follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                     Express Server                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                       API Routes                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    Storage Interface                    │
│                                                         │
├───────────────────────────────┬─────────────────────────┤
│                               │                         │
│       In-Memory Storage       │    Database Storage     │
│                               │                         │
└───────────────────────────────┴─────────────────────────┘
                                        │
                                        ▼
                                ┌─────────────────┐
                                │                 │
                                │   Drizzle ORM   │
                                │                 │
                                └─────────────────┘
                                        │
                                        ▼
                                ┌─────────────────┐
                                │                 │
                                │   PostgreSQL    │
                                │                 │
                                └─────────────────┘
```

The backend architecture is organized as follows:

- **Express Server**: The main entry point for the application
- **API Routes**: RESTful endpoints that handle HTTP requests
- **Storage Interface**: A pluggable interface for data persistence
- **Storage Implementations**: Concrete implementations of the storage interface
- **Drizzle ORM**: Database access layer for SQL operations
- **PostgreSQL**: Relational database for data persistence

## Data Flow

### Request Flow

The flow of a typical request through the system:

1. **Client Request**: A user interacts with the UI, triggering an API request
2. **React Query**: Manages the request, including caching and retries
3. **Express Route**: Receives the request and extracts parameters
4. **Input Validation**: Validates the request data against Zod schemas
5. **Storage Interface**: Calls the appropriate method on the storage interface
6. **Database Access**: For DB storage, uses Drizzle ORM to interact with PostgreSQL
7. **Response Processing**: Formats the response data
8. **Client Processing**: React Query processes the response, updating UI state

### Data Flow Diagram

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌───────────┐
│         │     │             │     │              │     │           │
│  User   │────►│  React UI   │────►│  React Query │────►│  Express  │
│         │     │             │     │              │     │           │
└─────────┘     └─────────────┘     └──────────────┘     └───────────┘
                      ▲                                        │
                      │                                        │
                      │                                        ▼
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌───────────┐
│         │     │             │     │              │     │           │
│  User   │◄────│  React UI   │◄────│  React Query │◄────│  Storage  │
│         │     │             │     │              │     │           │
└─────────┘     └─────────────┘     └──────────────┘     └───────────┘
                                                               │
                                                               │
                                                               ▼
                                                         ┌───────────┐
                                                         │           │
                                                         │ Database  │
                                                         │           │
                                                         └───────────┘
```

## Database Design

### Entity-Relationship Diagram

The core entities in the system and their relationships:

```
┌───────────────┐     ┌─────────────────┐     ┌───────────────┐
│               │     │                 │     │               │
│ VirusCategory │◄────┤   Publication   │     │ BackgroundPaper│
│               │     │                 │     │               │
└───────────────┘     └─────────────────┘     └───────────────┘
        ▲                                             ▲
        │                                             │
        │                                             │
        │                                             │
        │                                             │
┌───────────────┐     ┌─────────────────┐     ┌───────────────┐
│               │     │                 │     │               │
│  TeamMember   │     │      User       │     │     Issue     │
│               │     │                 │     │               │
└───────────────┘     └─────────────────┘     └───────────────┘
                                                     │
                                                     │
                                                     ▼
                                              ┌───────────────┐
                                              │               │
                                              │ IssueComment  │
                                              │               │
                                              └───────────────┘
```

### Table Structure

The main database tables and their relationships:

- **virus_categories**: Categories of viruses studied
- **team_members**: Research team information
- **publications**: Research publications
- **background_papers**: Background research papers
- **users**: System users
- **issues**: Reported issues or bugs
- **issue_comments**: Comments on issues
- **what_we_do_sections**: Information about research areas
- **what_we_do_content**: Content for research areas
- **page_views**: Analytics for page views
- **sessions**: User session information

## Security Architecture

The application implements several security measures:

### Authentication and Authorization

- **User Authentication**: Implemented using Passport.js with local strategy
- **Session Management**: Express sessions with PostgreSQL session store
- **Authorization**: Role-based access control for admin functions

### Data Security

- **Input Validation**: All inputs are validated using Zod schemas
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Prevention**: React's built-in HTML escaping and CSP headers
- **CSRF Protection**: Token-based CSRF protection

## Performance Architecture

### Frontend Performance

- **Code Splitting**: Route-based code splitting for faster initial load
- **Lazy Loading**: Components and images loaded only when needed
- **Caching**: LRU cache implementation for API responses
- **Optimized Rendering**: Minimal re-renders using React.memo and useCallback

### Backend Performance

- **Connection Pooling**: Database connection pooling for efficient resource usage
- **Query Optimization**: Efficient SQL queries with proper indexing
- **Middleware Optimization**: Minimal middleware stack for faster processing
- **Response Compression**: GZIP/Brotli compression for responses

## Scalability Considerations

The application is designed with scalability in mind:

- **Horizontal Scaling**: Stateless API design allows for multiple instances
- **Database Scaling**: Support for PostgreSQL clustering and replication
- **Caching Strategy**: Distributed caching can be implemented
- **Microservices Potential**: The clean architecture allows for future decomposition into microservices

## Monitoring and Observability

The system implements comprehensive monitoring:

- **Error Tracking**: Client-side error capture and reporting
- **Analytics**: Page view and user behavior tracking
- **Performance Monitoring**: API response time tracking
- **Health Checks**: Endpoint for system health validation

## Integration Points

The system integrates with external services:

- **GraphQL API Proxy**: Integration with Kotahi GraphQL API
- **File Storage**: Image upload and storage capabilities
- **Email Service**: For notifications and alerts

## Appendix: Technology Stack Details

### Frontend Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components built on ShadCN UI
- **State Management**: React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **API**: RESTful API design
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Passport.js
- **Validation**: Zod
- **File Upload**: Multer

### Development Tools

- **Build Tool**: Vite
- **Package Manager**: npm
- **Version Control**: Git
- **Linting**: ESLint
- **Formatting**: Prettier
- **Database Migrations**: Drizzle Kit