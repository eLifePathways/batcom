import { client } from '../db'
import { checkColumnExists, checkEnumExists } from './helpers'

export const pluraliseVirusCategoriesAndRegions = async () => {
  console.log(
    'Starting migration: virusCategoryId => virusCategoryIds and region => regions',
  )

  try {
    const regionEnumExists = await checkEnumExists('geographic_region')

    if (!regionEnumExists) {
      console.log('Creating enum: geographic_region')
      await client`
        CREATE TYPE geographic_region AS ENUM (
          'africa',
          'americas',
          'eastern_mediterranean',
          'europe',
          'southeast_asia',
          'western_pacific'
        )
      `
    } else {
      console.log('Enum geographic_region already exists')
    }

    const virusCategoryIdsColumnExists = await checkColumnExists(
      'publications',
      'virus_category_ids',
    )

    const regionsColumnExists = await checkColumnExists(
      'publications',
      'regions',
    )

    if (!virusCategoryIdsColumnExists) {
      console.log('Adding virus_category_ids column...')
      await client`
        ALTER TABLE publications
        ADD COLUMN virus_category_ids integer[]
      `
    } else {
      console.log('Column virus_category_ids already exists')
    }

    if (!regionsColumnExists) {
      console.log('Adding regions column...')
      await client`
        ALTER TABLE publications
        ADD COLUMN regions geographic_region[]
      `
    } else {
      console.log('Column regions already exists')
    }

    const oldVirusCategoryIdColumnExists = await checkColumnExists(
      'publications',
      'virus_category_id',
    )

    const oldRegionColumnExists = await checkColumnExists(
      'publications',
      'region',
    )

    if (oldVirusCategoryIdColumnExists || oldRegionColumnExists) {
      console.log('Migrating data from old columns...')

      await client`
        UPDATE publications
        SET virus_category_ids = ARRAY[virus_category_id];
      `

      await client`
        UPDATE publications
        SET regions = ARRAY[
          CASE
            WHEN region = 'Asia' THEN 'southeast_asia'
            WHEN region = 'Africa' THEN 'africa'
            WHEN region = 'Middle East' THEN 'eastern_mediterranean'
            ELSE 'western_pacific'
          END
        ]::geographic_region[];
      `
    }

    if (!virusCategoryIdsColumnExists) {
      console.log('Setting DEFAULT and NOT NULL on virus_category_ids')

      await client`
        ALTER TABLE publications
        ALTER COLUMN virus_category_ids SET DEFAULT '{}',
        ALTER COLUMN virus_category_ids SET NOT NULL
      `
    }

    if (!regionsColumnExists) {
      console.log('Setting DEFAULT and NOT NULL on regions')

      await client`
        ALTER TABLE publications
        ALTER COLUMN regions SET DEFAULT '{}',
        ALTER COLUMN regions SET NOT NULL
      `
    }

    if (oldVirusCategoryIdColumnExists) {
      console.log('Dropping old column virus_category_id...')

      await client`
        ALTER TABLE publications DROP COLUMN virus_category_id
      `
    }

    if (oldRegionColumnExists) {
      console.log('Dropping old column region...')

      await client`
        ALTER TABLE publications DROP COLUMN region
      `
    }

    console.log('Virus categories and regions migration complete.')
  } catch (err) {
    console.error('Virus categories and regions migration failed: ', err)
    throw err
  }
}
