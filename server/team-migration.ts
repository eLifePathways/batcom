import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script to add sort_order column to team_members table
 */
export async function addSortOrderToTeamMembers() {
  try {
    const columnExists = await checkColumnExists('team_members', 'sort_order');
    
    if (!columnExists) {
      console.log('Adding sort_order column to team_members table...');
      
      // Add sort_order column with default value
      await db.execute(sql`
        ALTER TABLE team_members 
        ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0
      `);
      
      // We don't add a unique constraint because when reordering, we may need
      // to temporarily have duplicate values during the process
      
      console.log('sort_order column added successfully');
      
      // Initialize sort_order values based on id to ensure unique values
      await db.execute(sql`
        WITH indexed_rows AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 as row_index
          FROM team_members
        )
        UPDATE team_members
        SET sort_order = indexed_rows.row_index
        FROM indexed_rows
        WHERE team_members.id = indexed_rows.id
      `);
      
      console.log('team_members sort_order values initialized');
    } else {
      console.log('sort_order column already exists in team_members table');
    }
    
    return true;
  } catch (error) {
    console.error('Error adding sort_order column to team_members:', error);
    throw error;
  }
}

/**
 * Helper function to check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = ${tableName} 
      AND column_name = ${columnName}
    ) as exists
  `);
  
  // Type assertion to handle Drizzle's typing
  const exists = (result as any)[0]?.exists;
  return exists === true;
}