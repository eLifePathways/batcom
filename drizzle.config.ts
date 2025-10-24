import { defineConfig } from 'drizzle-kit'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL, ensure the database is provisioned')
}

const caCert = process.env.POSTGRES_CA_CERT

export default defineConfig({
  out: './migrations',
  schema: './shared/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL,
    ...(caCert
      ? {
          ssl: {
            rejectUnauthorized: false,
            ca: Buffer.from(caCert, 'base64').toString('utf-8'),
          },
        }
      : {}),
  },
})
