import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Get PostgreSQL connection string from environment variable
const connectionString = process.env.DATABASE_URL || "";

// Create PostgreSQL client
export const client = postgres(connectionString);

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });

// Initialize database connection
export async function initDatabase() {
  try {
    // Test connection
    const result = await client`SELECT 1`;
    console.log("Database connection successful", result);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}