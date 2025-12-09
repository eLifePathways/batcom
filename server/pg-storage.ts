import {
  users,
  type User,
  type InsertUser,
  virusCategories,
  type VirusCategory,
  type InsertVirusCategory,
  teamMembers,
  type TeamMember,
  type InsertTeamMember,
  publications,
  type Publication,
  type InsertPublication,
  backgroundPapers,
  type BackgroundPaper,
  type InsertBackgroundPaper,
  settings,
  type EvidenceInfection,
  type EvidenceSpillover,
  Review,
  reviews,
  InsertReview,
} from '@shared/schema'
import { IStorage } from './storage'
import { eq, and, gte, lte, like, sql } from 'drizzle-orm'
import { db } from './db'
import { hashPassword } from './auth'

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id))
    return result[0]
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    return result[0]
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning()
    return result[0]
  }

  // Virus category operations
  async getAllVirusCategories(): Promise<VirusCategory[]> {
    return db.select().from(virusCategories)
  }

  async getVirusCategory(id: number): Promise<VirusCategory | undefined> {
    const result = await db
      .select()
      .from(virusCategories)
      .where(eq(virusCategories.id, id))
    return result[0]
  }

  async createVirusCategory(
    category: InsertVirusCategory,
  ): Promise<VirusCategory> {
    const result = await db.insert(virusCategories).values(category).returning()
    return result[0]
  }

  // Team member operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return db.select().from(teamMembers)
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const result = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id))
    return result[0]
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const result = await db.insert(teamMembers).values(member).returning()
    return result[0]
  }

  // Publication operations
  async getAllPublications(): Promise<Publication[]> {
    return db.select().from(publications)
  }

  async getPublication(id: number): Promise<Publication | undefined> {
    const result = await db
      .select()
      .from(publications)
      .where(eq(publications.id, id))
    return result[0]
  }

  async createPublication(
    publication: InsertPublication,
  ): Promise<Publication> {
    const result = await db.insert(publications).values(publication).returning()
    return result[0]
  }

  async getFilteredPublications(
    virusCategories?: number[],
    evidenceInfections?: EvidenceInfection[],
    evidenceSpillovers?: EvidenceSpillover[],
    yearRanges?: string,
    regions?: string[],
    searchQuery?: string,
  ): Promise<Array<Publication>> {
    return []
  }

  async getPublicationsByVirusCategory(
    virusCategoryId: number,
  ): Promise<Publication[]> {
    return db
      .select()
      .from(publications)
      .where(eq(publications.virusCategoryId, virusCategoryId))
  }

  async getPublicationsByEvidenceInfection(
    quality: string,
  ): Promise<Publication[]> {
    return db
      .select()
      .from(publications)
      .where(eq(publications.evidenceInfection, quality))
  }

  async getPublicationsByEvidenceSpillover(
    type: string,
  ): Promise<Publication[]> {
    return db
      .select()
      .from(publications)
      .where(eq(publications.evidenceSpillover, type))
  }

  async getPublicationsByYear(year: number): Promise<Publication[]> {
    return db.select().from(publications).where(eq(publications.year, year))
  }

  async getPublicationsByYearRange(
    startYear: number,
    endYear: number,
  ): Promise<Publication[]> {
    return db
      .select()
      .from(publications)
      .where(
        and(gte(publications.year, startYear), lte(publications.year, endYear)),
      )
  }

  async getPublicationsByRegion(region: string): Promise<Publication[]> {
    return db.select().from(publications).where(eq(publications.region, region))
  }

  async searchPublications(query: string): Promise<Publication[]> {
    // Case-insensitive search across multiple fields
    const searchQuery = `%${query.toLowerCase()}%`
    return db
      .select()
      .from(publications)
      .where(
        sql`(LOWER(${publications.title}) LIKE ${searchQuery} OR 
           LOWER(${publications.authors}) LIKE ${searchQuery} OR 
           LOWER(${publications.abstract}) LIKE ${searchQuery})`,
      )
  }

  // Review operations
  async getAllReviews(): Promise<Review[]> {
    return db.select().from(reviews)
  }

  async getReview(id: number): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(eq(reviews.id, id))
    return result[0]
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning()
    return result[0]
  }

  async getReviewsForPublication(publicationId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.publicationId, publicationId))
  }

  // Background paper operations
  async getAllBackgroundPapers(): Promise<BackgroundPaper[]> {
    return db.select().from(backgroundPapers)
  }

  async getBackgroundPaper(id: number): Promise<BackgroundPaper | undefined> {
    const result = await db
      .select()
      .from(backgroundPapers)
      .where(eq(backgroundPapers.id, id))
    return result[0]
  }

  async createBackgroundPaper(
    paper: InsertBackgroundPaper,
  ): Promise<BackgroundPaper> {
    const result = await db.insert(backgroundPapers).values(paper).returning()
    return result[0]
  }

  async getBackgroundPapersByVirusCategory(
    virusCategoryId: number,
  ): Promise<BackgroundPaper[]> {
    return db
      .select()
      .from(backgroundPapers)
      .where(eq(backgroundPapers.virusCategoryId, virusCategoryId))
  }

  // Initialize the database with sample data
  async initializeDatabase(): Promise<void> {
    try {
      // Check if there's any data in the virus categories table
      const existingCategories = await db
        .select()
        .from(virusCategories)
        .limit(1)
      if (existingCategories.length > 0) {
        console.log('Database already has data. Skipping initialization.')
        return
      }

      console.log('Initializing database with sample data...')

      // Add virus categories
      const [coronaviridae] = await db
        .insert(virusCategories)
        .values({
          name: 'Coronaviridae',
          description:
            'Family of enveloped, positive-sense, single-stranded RNA viruses.',
          imageUrl: '/assets/viruses/coronavirus.svg',
        })
        .returning()

      const [filoviridae] = await db
        .insert(virusCategories)
        .values({
          name: 'Filoviridae',
          description:
            'Family of filamentous, enveloped, negative-sense RNA viruses.',
          imageUrl: '/assets/viruses/filovirus.svg',
        })
        .returning()

      const [paramyxoviridae] = await db
        .insert(virusCategories)
        .values({
          name: 'Paramyxoviridae',
          description:
            'Family of negative-sense RNA viruses, including measles and mumps.',
          imageUrl: '/assets/viruses/paramyxovirus.svg',
        })
        .returning()

      //   const [sedoreoviridae] = await db
      //     .insert(virusCategories)
      //     .values({
      //       name: 'Sedoreoviridae',
      //       description: 'Subfamily of viruses within the family Reoviridae.',
      //       imageUrl: '/assets/viruses/sedoreovirus.svg',
      //     })
      //     .returning()

      const [rhabdoviridae] = await db
        .insert(virusCategories)
        .values({
          name: 'Rhabdoviridae',
          description:
            'Family of negative-sense RNA viruses, including rabies virus.',
          imageUrl: '/assets/viruses/rhabdovirus.svg',
        })
        .returning()

      const [otherUnknown] = await db
        .insert(virusCategories)
        .values({
          name: 'Other/Unknown',
          description:
            'Additional viral families and unclassified viruses under investigation.',
          imageUrl: '/assets/viruses/unknown-virus.svg',
        })
        .returning()

      // Add default admin
      const rawPassword = process.env.ADMIN_PASSWORD || 'ADM!N_PASSW0RD'
      const hashedPassword = await hashPassword(rawPassword)

      await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
      })

      // Add team members
      await db.insert(teamMembers).values({
        name: 'Emily Gurley',
        title: 'Professor of Epidemiology',
        institution:
          'Johns Hopkins University - Bloomberg School of Public Health',
        description:
          'Professor of Epidemiology specializing in zoonotic disease transmission and viral spillover events.',
        imageUrl: '/assets/team/emily-gurley.png',
        email: 'egurley@jhu.edu',
        website: 'https://www.jhsph.edu/faculty/directory/profile/emily-gurley',
        socialMedia: 'https://www.linkedin.com/in/emily-gurley',
      })

      await db.insert(teamMembers).values({
        name: 'Clif McKee',
        title: 'Research Scientist',
        institution:
          'Johns Hopkins University - Bloomberg School of Public Health',
        description:
          'Research Scientist focused on bat ecology and viral evolution in bat populations.',
        imageUrl: '/assets/team/cliff-whitworth.png',
        email: 'cmckee@jhu.edu',
        website: 'https://www.jhsph.edu/faculty/directory/profile/clif-mckee',
        socialMedia: 'https://twitter.com/clif_mckee',
      })

      // Add publications with string dates
      await db.insert(publications).values({
        title: 'Bat Coronaviruses in China',
        authors: 'Li et al.',
        year: 2018,
        abstract:
          'Comprehensive study of SARSr-CoV prevalence and geographical distribution in Chinese bat populations, identifying novel coronaviruses with potential for human infection.',
        evidenceInfection: 'infectionHigh',
        evidenceSpillover: 'spilloverNot_Investigated',
        virusCategoryId: coronaviridae.id,
        region: 'Asia',
        publicationDate: '2018-03-15',
        link: 'https://example.com/bat-coronaviruses-china',
      })

      await db.insert(publications).values({
        title: 'Nipah Virus Emergence in Malaysia',
        authors: 'Chua et al.',
        year: 2000,
        abstract:
          'Investigation of the 1998-1999 outbreak of encephalitis in humans and respiratory disease in pigs, identifying fruit bats as the natural reservoir of Nipah virus.',
        evidenceInfection: 'infectionModerate',
        evidenceSpillover: 'spilloverNot_Investigated',
        virusCategoryId: paramyxoviridae.id,
        region: 'Asia',
        publicationDate: '2000-09-26',
        link: 'https://example.com/nipah-virus-emergence',
      })

      await db.insert(publications).values({
        title: 'Ebola Virus Antibodies in Fruit Bats',
        authors: 'Leroy et al.',
        year: 2005,
        abstract:
          'Detection of Ebola virus antibodies in fruit bats from Central Africa, suggesting these species may be reservoir hosts for Ebola virus.',
        evidenceInfection: 'infectionLow',
        evidenceSpillover: 'spilloverNot_Investigated',
        virusCategoryId: filoviridae.id,
        region: 'Africa',
        publicationDate: '2005-12-01',
        link: 'https://example.com/ebola-antibodies-bats',
      })

      await db.insert(publications).values({
        title: 'MERS-CoV in Saudi Arabian Camels',
        authors: 'Azhar et al.',
        year: 2014,
        abstract:
          'Isolation of MERS-CoV from a camel and its infected owner, providing evidence for camel-to-human transmission, with bats as the likely ancestral reservoir.',
        evidenceInfection: 'infectionHigh',
        evidenceSpillover: 'spilloverNot_Investigated',
        virusCategoryId: coronaviridae.id,
        region: 'Middle East',
        publicationDate: '2014-06-05',
        link: 'https://example.com/mers-cov-camels',
      })

      // Add background papers
      await db.insert(backgroundPapers).values({
        title: 'Origin and evolution of pathogenic coronaviruses',
        virusCategoryId: coronaviridae.id,
        link: 'https://example.com/coronavirus-evolution',
        imageUrl: '/assets/viruses/bat-hanging.png',
      })

      await db.insert(backgroundPapers).values({
        title: 'Bat coronaviruses in China: A comprehensive review',
        virusCategoryId: coronaviridae.id,
        link: 'https://example.com/bat-coronavirus-review',
        imageUrl: '/assets/viruses/bat-flying.png',
      })

      await db.insert(backgroundPapers).values({
        title: 'SARS-CoV-2: Zoonotic origins and wildlife reservoirs',
        virusCategoryId: coronaviridae.id,
        link: 'https://example.com/sars-cov-2-origins',
      })

      await db.insert(backgroundPapers).values({
        title: 'Fruit bats as reservoirs of Ebola virus',
        virusCategoryId: filoviridae.id,
        link: 'https://example.com/fruit-bats-ebola',
      })

      await db.insert(backgroundPapers).values({
        title: 'Marburg virus ecology in African bat populations',
        virusCategoryId: filoviridae.id,
        link: 'https://example.com/marburg-ecology',
      })

      await db.insert(backgroundPapers).values({
        title: 'Molecular characterization of filoviruses in bats',
        virusCategoryId: filoviridae.id,
        link: 'https://example.com/filovirus-characterization',
      })

      await db.insert(backgroundPapers).values({
        title: 'Nipah virus: Transmission dynamics and epidemiology',
        virusCategoryId: paramyxoviridae.id,
        link: 'https://example.com/nipah-transmission',
      })

      await db.insert(backgroundPapers).values({
        title: 'Hendra virus: Bat-horse-human transmission pathways',
        virusCategoryId: paramyxoviridae.id,
        link: 'https://example.com/hendra-pathways',
      })

      await db.insert(backgroundPapers).values({
        title: 'Evolutionary dynamics of bat paramyxoviruses',
        virusCategoryId: paramyxoviridae.id,
        link: 'https://example.com/paramyxovirus-evolution',
      })

      await db.insert(backgroundPapers).values({
        title: 'Bat lyssaviruses: Antigenic and genetic diversity',
        virusCategoryId: rhabdoviridae.id,
        link: 'https://example.com/bat-lyssaviruses',
      })

      await db.insert(backgroundPapers).values({
        title: 'Global patterns of rabies virus persistence in bat reservoirs',
        virusCategoryId: rhabdoviridae.id,
        link: 'https://example.com/rabies-persistence',
      })

      await db.insert(backgroundPapers).values({
        title: 'Ecological factors influencing bat-associated rhabdoviruses',
        virusCategoryId: rhabdoviridae.id,
        link: 'https://example.com/rhabdovirus-ecology',
      })

      // settings
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

      await db.insert(settings).values({
        purpose: 'kotahi',
        formData: {
          endpoint: '',
          groupId: null,
          apiKey: null,
        },
      })

      console.log('Database initialization complete.')
    } catch (error) {
      console.error('Error initializing database:', error)
    }
  }
}
