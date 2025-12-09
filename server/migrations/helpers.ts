import { client } from '../db'

/**
 * Helper function to check if a column exists in a table
 */
export async function checkColumnExists(
  tableName: string,
  columnName: string,
): Promise<boolean> {
  try {
    const result = await client`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        AND column_name = ${columnName}
      )
    `

    return result[0]?.exists ?? false
  } catch (error) {
    console.error(
      `Error checking if column ${columnName} exists in table ${tableName}:`,
      error,
    )
    throw error
  }
}

export async function checkEnumExists(enumName: string): Promise<boolean> {
  try {
    const result = await client`
    SELECT 1
    FROM pg_type
    WHERE typname = ${enumName}
    LIMIT 1
  `
    return result.length > 0
  } catch (error) {
    console.error(`Error checking if enum ${enumName}:`, error)
    throw error
  }
}
