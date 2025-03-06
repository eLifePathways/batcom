import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create postgres client
const connectionString = process.env.DATABASE_URL || '';
export const client = postgres(connectionString);

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Initialize the database tables
export async function initDatabase() {
  try {
    console.log('Creating database tables...');
    
    // Create each table separately
    await client`
      CREATE TABLE IF NOT EXISTS virus_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT
      )
    `;
    
    await client`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        institution TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        email TEXT,
        website TEXT,
        social_media TEXT
      )
    `;
    
    await client`
      CREATE TABLE IF NOT EXISTS publications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        year INTEGER NOT NULL,
        abstract TEXT NOT NULL,
        evidence_quality TEXT NOT NULL,
        evidence_type TEXT NOT NULL,
        virus_category_id INTEGER NOT NULL,
        region TEXT NOT NULL,
        publication_date DATE NOT NULL,
        link TEXT
      )
    `;
    
    await client`
      CREATE TABLE IF NOT EXISTS background_papers (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        virus_category_id INTEGER NOT NULL,
        link TEXT,
        image_url TEXT
      )
    `;
    
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `;
    
    console.log('Database tables created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating database tables:', error);
    return false;
  }
}