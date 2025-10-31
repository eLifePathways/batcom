import { settings } from '@shared/schema'
import { db } from '../db'
import { eq } from 'drizzle-orm'

const addDefaultSettings = async (): Promise<boolean> => {
  console.log('starting migration to add default settings...')
  try {
    const [generalSettingsExist] = await db
      .select()
      .from(settings)
      .where(eq(settings.purpose, 'general'))

    if (!generalSettingsExist) {
      await db.insert(settings).values({
        purpose: 'general',
        formData: {
          website: {
            siteName: 'Bat-Com Research Group',
            siteDescription: 'Research on bat-borne virus spillover',
            contactEmail: 'info@batcom.org',
            allowRegistration: true,
            maintenanceMode: false,
            theme: 'default',
          },
          api: {
            apiRateLimit: '100',
            enablePublicAPI: true,
            requireAPIKey: false,
          },
          security: {
            adminLoginAttempts: '5',
            sessionTimeout: '60',
            enableTwoFactor: false,
          },
        },
      })

      console.log('general settings created')
    } else {
      console.log('general settings already exist')
    }

    const [kotahiSettingsExist] = await db
      .select()
      .from(settings)
      .where(eq(settings.purpose, 'kotahi'))

    if (!kotahiSettingsExist) {
      await db.insert(settings).values({
        purpose: 'kotahi',
        formData: {
          endpoint: '',
          groupId: null,
          apiKey: null,
        },
      })

      console.log('Kotahi settings created')
    } else {
      console.log('Kotahi settings already exist')
    }
    return true
  } catch (error) {
    console.error('Error adding default settings:', error)
    throw error
  }
}

export { addDefaultSettings }
