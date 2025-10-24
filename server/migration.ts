import { drizzle } from 'drizzle-orm/neon-serverless'
import { neon } from '@neondatabase/serverless'
import * as schema from '@shared/schema'
import { migrate } from 'drizzle-orm/neon-serverless/migrator'
import { PostgresStorage } from './pg-storage'

export async function runMigrations() {
  const sql_url = process.env.POSTGRES_URL || ''
  console.log('Running database migrations...')

  try {
    const client = neon(sql_url)
    const db = drizzle(client, { schema })

    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS virus_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT
      );
      
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
      );
      
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
      );
      
      CREATE TABLE IF NOT EXISTS background_papers (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        virus_category_id INTEGER NOT NULL,
        link TEXT,
        image_url TEXT
      );
      
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `)

    console.log('Database tables created successfully.')

    // Initialize database with sample data
    const storage = new PostgresStorage()
    await storage.initializeDatabase()

    return true
  } catch (error) {
    console.error('Error during migration:', error)
    return false
  }
}
