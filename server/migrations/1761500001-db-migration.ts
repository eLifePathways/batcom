import { client } from '../db'
import { checkColumnExists } from './helpers'

/**
 * Script to update the issue_comments table with new columns
 */
export async function updateIssueCommentsSchema() {
  console.log('Starting database migration for issue_comments table...')

  try {
    // Check if the author column exists
    const authorColumnExists = await checkColumnExists(
      'issue_comments',
      'author',
    )
    if (!authorColumnExists) {
      console.log('Adding author column to issue_comments table...')
      await client`
        ALTER TABLE issue_comments 
        ADD COLUMN author TEXT DEFAULT 'Admin'
      `
      console.log('Successfully added author column')
    } else {
      console.log('Author column already exists')
    }

    // Check if the is_internal column exists
    const isInternalColumnExists = await checkColumnExists(
      'issue_comments',
      'is_internal',
    )
    if (!isInternalColumnExists) {
      console.log('Adding is_internal column to issue_comments table...')
      await client`
        ALTER TABLE issue_comments 
        ADD COLUMN is_internal BOOLEAN DEFAULT false
      `
      console.log('Successfully added is_internal column')
    } else {
      console.log('is_internal column already exists')
    }

    // Check if the content column exists and rename it if needed
    const contentColumnExists = await checkColumnExists(
      'issue_comments',
      'content',
    )
    const commentColumnExists = await checkColumnExists(
      'issue_comments',
      'comment',
    )

    if (commentColumnExists && !contentColumnExists) {
      console.log(
        'Renaming comment column to content in issue_comments table...',
      )
      await client`
        ALTER TABLE issue_comments 
        RENAME COLUMN comment TO content
      `
      console.log('Successfully renamed comment column to content')
    } else if (!contentColumnExists) {
      console.log('Adding content column to issue_comments table...')
      await client`
        ALTER TABLE issue_comments 
        ADD COLUMN content TEXT
      `
      console.log('Successfully added content column')
    } else {
      console.log('Content column already exists')
    }

    console.log('Database migration completed successfully')
  } catch (error) {
    console.error('Error during database migration:', error)
    throw error
  }
}
