# Development Guide

This guide provides detailed information for developers working on the Bat-Com Research Platform.

## Development Environment Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shippies-org/bats.git
   cd bats
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database
   PORT=5000
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Replit Development

If you're developing in Replit:

1. Fork the repository on Replit
2. The Replit environment will automatically install dependencies
3. Set up environment secrets in the Replit Secrets panel
4. Use the "Start application" workflow to run the server

## Architecture Overview

### Full-Stack Architecture

The Bat-Com platform uses a modern full-stack JavaScript architecture:

- **Frontend**: React with TypeScript in the `client/` directory
- **Backend**: Express.js with TypeScript in the `server/` directory
- **Shared**: Common code and types in the `shared/` directory

### Data Flow

1. Frontend components make API requests through React Query
2. Requests are processed by Express routes in `server/routes.ts`
3. The API layer uses the storage interface defined in `server/storage.ts`
4. Data is persisted using either in-memory storage or PostgreSQL via Drizzle ORM

## Key Components

### Database Schema

The database schema is defined in `shared/schema.ts` using Drizzle ORM. This file contains:

- Table definitions
- Relationships between tables
- Type definitions for insert and select operations
- Zod validation schemas

### Storage Interface

The application uses a pluggable storage system:

- `IStorage` interface in `server/storage.ts` defines the contract for storage implementations
- `MemStorage` provides an in-memory implementation for development
- `DatabaseStorage` provides a PostgreSQL implementation for production

### API Routes

API routes are defined in `server/routes.ts` and follow RESTful principles. Each route:

1. Validates the request data
2. Calls the appropriate storage method
3. Returns the result as JSON

### Frontend Components

The frontend is built with React and uses several key patterns:

- **Pages**: Route components in `client/src/pages/`
- **UI Components**: Reusable components in `client/src/components/ui/`
- **Section Components**: Page sections in `client/src/components/sections/`
- **Layout Components**: Layout templates in `client/src/components/layout/`

### State Management

- **Server State**: Managed using React Query (`@tanstack/react-query`)
- **Form State**: Managed using React Hook Form
- **UI State**: Managed using React's built-in state management

## Working with the Code

### Adding a New Entity

To add a new entity to the system:

1. Define the entity in `shared/schema.ts`
   ```typescript
   export const newEntities = pgTable("new_entities", {
     id: serial("id").primaryKey(),
     name: text("name").notNull(),
     description: text("description"),
     createdAt: timestamp("created_at").defaultNow(),
   });

   export const insertNewEntitySchema = createInsertSchema(newEntities).omit({
     id: true,
     createdAt: true,
   });

   export type InsertNewEntity = z.infer<typeof insertNewEntitySchema>;
   export type NewEntity = typeof newEntities.$inferSelect;
   ```

2. Add CRUD operations to the storage interface in `server/storage.ts`
   ```typescript
   // In IStorage interface
   getAllNewEntities(): Promise<NewEntity[]>;
   getNewEntity(id: number): Promise<NewEntity | undefined>;
   createNewEntity(entity: InsertNewEntity): Promise<NewEntity>;
   updateNewEntity(id: number, data: Partial<NewEntity>): Promise<NewEntity | undefined>;
   deleteNewEntity(id: number): Promise<boolean>;
   ```

3. Implement the methods in `server/db-storage.ts`
   ```typescript
   // Example implementation
   async getAllNewEntities(): Promise<NewEntity[]> {
     return await db.select().from(newEntities).orderBy(newEntities.name);
   }
   ```

4. Add API routes in `server/routes.ts`
   ```typescript
   app.get('/api/new-entities', async (req: Request, res: Response) => {
     try {
       const entities = await storage.getAllNewEntities();
       res.json(entities);
     } catch (error) {
       res.status(500).json({ error: "Failed to fetch entities" });
     }
   });
   ```

5. Create the frontend components in `client/src/pages/` and `client/src/components/`

### Adding a New Feature

When adding a new feature:

1. Define the data models first
2. Implement the backend API endpoints
3. Create the frontend components
4. Connect the frontend to the backend using React Query

### Working with Forms

Forms use React Hook Form with Zod validation:

```typescript
// Form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

// Form component
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: "",
    description: "",
  },
});

// Form submission
const onSubmit = async (data: z.infer<typeof formSchema>) => {
  await apiRequest("/api/endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};
```

## Performance Optimization

### API Caching

The application uses a custom LRU cache in `client/src/lib/queryClient.ts`:

- Requests are cached based on URL and query parameters
- Cache entries expire after a configurable TTL
- LRU eviction policy is used when the cache size limit is reached

### Image Optimization

Images are optimized using several techniques:

- Uploaded images are processed and stored with appropriate dimensions
- Lazy loading is used for images below the viewport
- Responsive images with appropriate srcsets are used

### React Query Optimization

React Query is configured for optimal performance:

- Shared queries use the same cache key
- Mutations invalidate related queries
- Background refetching is used to keep data fresh

## Testing

### Unit Testing

Unit tests can be written using Jest and React Testing Library:

```bash
npm test
```

### API Testing

API endpoints can be tested using tools like Postman or curl:

```bash
curl -X GET http://localhost:5000/api/virus-categories
```

## Common Issues and Solutions

### Database Connection Issues

If you encounter database connection issues:

1. Verify the `DATABASE_URL` environment variable is correct
2. Check that PostgreSQL is running
3. Ensure the database exists and is accessible

### Type Errors

If you encounter TypeScript errors:

1. Run `npm run build` to check for type errors
2. Ensure that all imports are correctly typed
3. Check that the schema definitions match the database structure

### API Error Handling

Common patterns for API error handling:

```typescript
try {
  const result = await storage.getSomeData();
  if (!result) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(result);
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: "Internal server error" });
}
```

## Deployment

### Production Deployment Checklist

- [ ] Run database migrations
- [ ] Build frontend assets (`npm run build`)
- [ ] Set environment variables
- [ ] Configure proper CORS settings
- [ ] Enable production mode for Express
- [ ] Set up monitoring and logging
- [ ] Configure proper security headers

### Environment Variables

Production deployments require these environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Set to "production"

## Continuous Integration

The project is set up for CI/CD using GitHub Actions:

- Linting and type checking on pull requests
- Automated testing
- Deployment to staging on merge to develop
- Deployment to production on merge to main