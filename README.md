# Bat-Com Research Platform

A cutting-edge research platform for Johns Hopkins Bloomberg School of Public Health, specializing in bat virus spillover research, with advanced data management and high-performance visualization capabilities.

## Features

- **Content Management System**: Manage virus categories, publications, team members, and background papers
- **Issue Reporting**: Built-in error reporting with screenshot capture
- **User Management**: Role-based access control for administrators
- **Data Visualization**: High-performance data visualization components
- **GraphQL Integration**: Proxy interface for Kotahi GraphQL API
- **Analytics Dashboard**: Track visitor statistics and page views
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Frontend**: React with TypeScript and Tailwind CSS
- **UI Components**: Customized ShadCN UI library
- **State Management**: React Query for server state
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful API with GraphQL proxy capabilities
- **Deployment**: Docker-ready with Replit deployments support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository

   ```bash
   git clone https://gitlab.coko.foundation/kotahi/batcom.git
   cd batcom
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:

   ```
   POSTGRES_URL=postgresql://username:password@localhost:5432/database
   PORT=3000
   JWT_SECRET="your-secure-session-secret"
   JWT_EXPIRES_IN="7d"
   ADMIN_PASSWORD="temporary-admin-password"
   ```

4. Initialize the database

   ```bash
   npm run db:push
   ```

5. Start the development server

   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
├── client/               # Frontend code
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utility libraries
│   │   ├── hooks/        # Custom React hooks
│   │   └── data/         # Static data and types
├── server/               # Backend code
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Storage interface
│   ├── db-storage.ts     # Database implementation
│   └── index.ts          # Server entry point
├── shared/               # Shared code between client and server
│   └── schema.ts         # Database schema and types
└── public/               # Static files
```

## API Documentation

The API provides endpoints for managing all aspects of the research platform:

### Virus Categories

- `GET /api/virus-categories` - Get all virus categories
- `GET /api/virus-categories/:id` - Get a specific virus category
- `POST /api/virus-categories` - Create a new virus category
- `PUT /api/virus-categories/:id` - Update a virus category
- `DELETE /api/virus-categories/:id` - Delete a virus category

### Publications

- `GET /api/publications` - Get all publications
- `GET /api/publications/:id` - Get a specific publication
- `POST /api/publications` - Create a new publication
- `PUT /api/publications/:id` - Update a publication
- `DELETE /api/publications/:id` - Delete a publication

### Team Members

- `GET /api/team-members` - Get all team members
- `GET /api/team-members/:id` - Get a specific team member
- `POST /api/team-members` - Create a new team member
- `PUT /api/team-members/:id` - Update a team member
- `DELETE /api/team-members/:id` - Delete a team member
- `POST /api/team-members/reorder` - Reorder team members

### Background Papers

- `GET /api/background-papers` - Get all background papers
- `GET /api/background-papers/:id` - Get a specific background paper
- `POST /api/background-papers` - Create a new background paper
- `PUT /api/background-papers/:id` - Update a background paper
- `DELETE /api/background-papers/:id` - Delete a background paper

### Issues and Comments

- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get a specific issue
- `POST /api/issues` - Create a new issue
- `PUT /api/issues/:id` - Update an issue
- `DELETE /api/issues/:id` - Delete an issue
- `GET /api/issues/:issueId/comments` - Get comments for an issue
- `POST /api/issues/:issueId/comments` - Create a comment for an issue

### What We Do Sections

- `GET /api/what-we-do/sections` - Get all What We Do sections
- `GET /api/what-we-do/sections/:id` - Get a specific section
- `GET /api/what-we-do/sections/slug/:slug` - Get a section by slug
- `POST /api/what-we-do/sections` - Create a new section
- `PUT /api/what-we-do/sections/:id` - Update a section
- `DELETE /api/what-we-do/sections/:id` - Delete a section

### Content Management

- `GET /api/what-we-do/content/section/:sectionId` - Get content for a section
- `GET /api/what-we-do/content/:id` - Get specific content
- `POST /api/what-we-do/content` - Create new content
- `PUT /api/what-we-do/content/:id` - Update content
- `DELETE /api/what-we-do/content/:id` - Delete content
- `POST /api/what-we-do/content/reorder` - Reorder content

## Deployment

The application can be deployed on any Node.js hosting platform that supports PostgreSQL.

### Replit Deployment

1. Fork the repository on Replit
2. Set up environment variables
3. Run the database initialization
4. Deploy using Replit's deployment feature

### Docker Deployment

1. Build the Docker image

   ```bash
   docker build -t bat-com-platform .
   ```

2. Run the container
   ```bash
   docker run -p 3000:3000 -e POSTGRES_URL=your_db_url bat-com-platform
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. Unauthorized copying, transfer, or reproduction of the contents of this repository is prohibited.

© 2025 Adam Hyde. All rights reserved.
