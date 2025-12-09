import { client } from '../db'
import { checkColumnExists } from './helpers'

export async function addKotahiManuscriptIdColumn() {
  console.log('Starting migration to add kotahi_manuscript_id column...')

  try {
    const kotahiManuscriptIdColumnExists = await checkColumnExists(
      'publications',
      'kotahi_manuscript_id',
    )

    if (!kotahiManuscriptIdColumnExists) {
      console.log('Adding kotahi_manuscript_id column to publications table...')

      await client`
  ALTER TABLE publications
  ADD COLUMN kotahi_manuscript_id UUID DEFAULT gen_random_uuid()
`

      console.log('Successfully added kotahi_manuscript_id column')
    } else {
      console.log('kotahi_manuscript_id column already exists')
    }
  } catch (error) {
    console.error('Error during database migration:', error)
    throw error
  }
}
