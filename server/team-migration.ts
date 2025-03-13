import { db } from "./db";

/**
 * Script to add sort_order column to team_members table
 */
export async function addSortOrderToTeamMembers() {
  try {
    // Check if the column already exists
    const exists = await checkColumnExists("team_members", "sort_order");
    
    if (!exists) {
      console.log("Adding sort_order column to team_members table...");
      await db.execute(`
        ALTER TABLE team_members 
        ADD COLUMN sort_order INTEGER DEFAULT 0
      `);
      
      // Update existing records with sequential sort order
      await db.execute(`
        WITH indexed_rows AS (
          SELECT id, ROW_NUMBER() OVER () - 1 as idx
          FROM team_members
        )
        UPDATE team_members
        SET sort_order = ir.idx
        FROM indexed_rows ir
        WHERE team_members.id = ir.id
      `);
      
      console.log("Successfully added sort_order column to team_members table");
    } else {
      console.log("sort_order column already exists in team_members table");
    }
    
    return true;
  } catch (error) {
    console.error("Error adding sort_order column to team_members table:", error);
    return false;
  }
}

/**
 * Helper function to check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}' AND column_name = '${columnName}'
    ) as exists
  `);
  
  return result[0].exists === true;
}