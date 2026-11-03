// Must run before importing './db', which reads process.env.POSTGRES_URL at
// module load time.
import 'dotenv/config'
import crypto from 'crypto'
import { readFileSync } from 'fs'
import path from 'path'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, client } from './db'

const MIGRATIONS_FOLDER = 'migrations'

type JournalEntry = { idx: number; tag: string; when: number }

/**
 * Adopt a database that was previously managed with `drizzle-kit push` by
 * recording the baseline migration (0000) as already applied. Without this,
 * `migrate` would try to `CREATE TABLE`/`CREATE TYPE` objects that already
 * exist and abort on the first statement.
 *
 * The migrator decides what to run purely by comparing each migration's
 * journal timestamp against the most recent `created_at` in
 * `drizzle.__drizzle_migrations` (see drizzle-orm's PgDialect.migrate), so
 * seeding a row with the baseline's timestamp causes 0000 to be skipped while
 * every later migration still runs.
 *
 * This is idempotent and safe to run on every deploy:
 *  - if migrations are already tracked, it does nothing;
 *  - on a brand-new database (no tables yet) it does nothing, letting the
 *    migrator create everything from 0000 onwards.
 */
async function baselineExistingDatabase() {
  const journal = JSON.parse(
    readFileSync(
      path.join(MIGRATIONS_FOLDER, 'meta', '_journal.json'),
      'utf-8',
    ),
  ) as { entries: JournalEntry[] }

  const baseline = journal.entries.find(entry => entry.idx === 0)

  if (!baseline) {
    return
  }

  await client`CREATE SCHEMA IF NOT EXISTS drizzle`
  await client`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `

  const [{ count }] = await client<{ count: number }[]>`
    SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations
  `

  // Migrations are already tracked (fresh DB that has run migrate before, or a
  // DB already adopted) — nothing to baseline.
  if (count > 0) {
    return
  }

  // A brand-new database has no tables yet: let the migrator build everything.
  const [{ exists }] = await client<{ exists: boolean }[]>`
    SELECT to_regclass('public.publications') IS NOT NULL AS exists
  `

  if (!exists) {
    return
  }

  const baselineSql = readFileSync(
    path.join(MIGRATIONS_FOLDER, `${baseline.tag}.sql`),
    'utf-8',
  )
  const hash = crypto.createHash('sha256').update(baselineSql).digest('hex')

  await client`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${hash}, ${baseline.when})
  `

  console.log(
    `Adopted existing database: baselined at migration "${baseline.tag}".`,
  )
}

async function main() {
  console.log('Verifying migration baseline...')
  await baselineExistingDatabase()

  console.log('Applying pending migrations...')
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })

  console.log('Migrations up to date.')
  await client.end()
}

main().catch(error => {
  console.error('Migration failed:', error)
  process.exit(1)
})
