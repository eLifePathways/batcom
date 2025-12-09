import { client } from '../db'
import { checkColumnExists, checkEnumExists } from './helpers'

export async function renameEvidenceColumns() {
  console.log(
    'Starting migration: evidenceQuality → evidenceInfection / evidenceSpillover',
  )

  try {
    // --- 1. Create enums if missing ---
    const infectionEnumExists = await checkEnumExists('evidence_infection')
    const spilloverEnumExists = await checkEnumExists('evidence_spillover')

    if (!infectionEnumExists) {
      console.log('Creating enum: evidence_infection')
      await client`
        CREATE TYPE evidence_infection AS ENUM (
          'infectionHigh',
          'infectionModerate',
          'infectionLow',
          'infectionNot_Investigated'
        )
      `
    } else {
      console.log('Enum evidence_infection already exists')
    }

    if (!spilloverEnumExists) {
      console.log('Creating enum: evidence_spillover')
      await client`
        CREATE TYPE evidence_spillover AS ENUM (
          'spilloverHigh',
          'spilloverModerate',
          'spilloverLow',
          'spilloverNot_Investigated'
        )
      `
    } else {
      console.log('Enum evidence_spillover already exists')
    }

    // --- 2. Add new columns if missing ---
    const infectionColumnExists = await checkColumnExists(
      'publications',
      'evidence_infection',
    )
    const spilloverColumnExists = await checkColumnExists(
      'publications',
      'evidence_spillover',
    )

    if (!infectionColumnExists) {
      console.log('Adding evidence_infection column...')
      await client`
        ALTER TABLE publications
        ADD COLUMN evidence_infection evidence_infection
      `
    } else console.log('evidence_infection column already exists')

    if (!spilloverColumnExists) {
      console.log('Adding evidence_spillover column...')
      await client`
        ALTER TABLE publications
        ADD COLUMN evidence_spillover evidence_spillover
      `
    } else console.log('evidence_spillover column already exists')

    // --- 3. Migrate existing data ---
    const hasOldQuality = await checkColumnExists(
      'publications',
      'evidence_quality',
    )
    const hasOldType = await checkColumnExists('publications', 'evidence_type')

    if (hasOldQuality || hasOldType) {
      console.log('Migrating data from old columns...')

      await client`
		UPDATE publications
		SET
			evidence_infection = (
			CASE evidence_quality
				WHEN 'high' THEN 'infectionHigh'
				WHEN 'medium' THEN 'infectionModerate'
				WHEN 'low' THEN 'infectionLow'
				ELSE 'infectionNot_Investigated'
			END
			)::evidence_infection,
			
			evidence_spillover = 'spilloverNot_Investigated'::evidence_spillover

		WHERE evidence_infection IS NULL
			OR evidence_spillover IS NULL
		`
    } else {
      console.log('Old columns not found — skipping data migration')
    }

    // --- 4. Set NOT NULL (after data is filled) ---
    if (!infectionColumnExists) {
      console.log('Setting NOT NULL on evidence_infection')
      await client`
        ALTER TABLE publications
        ALTER COLUMN evidence_infection SET NOT NULL
      `
    }

    if (!spilloverColumnExists) {
      console.log('Setting NOT NULL on evidence_spillover')
      await client`
        ALTER TABLE publications
        ALTER COLUMN evidence_spillover SET NOT NULL
      `
    }

    // --- 5. Drop old columns ---
    if (hasOldQuality) {
      console.log('Dropping old column evidence_quality...')
      await client`
        ALTER TABLE publications DROP COLUMN evidence_quality
      `
    }

    if (hasOldType) {
      console.log('Dropping old column evidence_type...')
      await client`
        ALTER TABLE publications DROP COLUMN evidence_type
      `
    }

    console.log('Migration complete.')
  } catch (err) {
    console.error('Migration failed:', err)
    throw err
  }
}
