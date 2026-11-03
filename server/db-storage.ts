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
  issues,
  type Issue,
  type InsertIssue,
  issueComments,
  type IssueComment,
  type InsertIssueComment,
  whatWeDoSections,
  type WhatWeDoSection,
  type InsertWhatWeDoSection,
  whatWeDoContent,
  type WhatWeDoContent,
  type InsertWhatWeDoContent,
  type Settings,
  settings,
  Review,
  reviews,
  InsertReview,
  heroSectionSettings,
  type HeroSectionSettings,
  type InsertHeroSettings,
} from '@shared/schema'
import {
  type EvidenceInfection,
  type EvidenceSpillover,
  type Region,
} from '@shared/constants'
import { db } from './db'
import {
  eq,
  like,
  and,
  gte,
  lte,
  or,
  inArray,
  sql,
  arrayContains,
} from 'drizzle-orm'
import { IStorage } from './storage'
import { hashPassword } from './auth'

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    return user || undefined
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    return user || undefined
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(
      process.env.ADMIN_PASSWORD || 'ADM!N_PASSW0RD',
    )
    const [adminUser] = await db
      .select()
      .from(users)
      .where(
        and(eq(users.username, 'admin'), eq(users.password, hashedPassword)),
      )

    if (adminUser) {
      await db.delete(users).where(eq(users.id, adminUser.id))
    }

    const [user] = await db.insert(users).values(insertUser).returning()

    return user
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users)
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.getUser(id)
    if (!existingUser) {
      return undefined
    }

    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning()

    return updatedUser
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id))
    return result.count > 0
  }

  // Hero settings operations
  async getAllHeroSettings(): Promise<HeroSectionSettings[]> {
    return db.select().from(heroSectionSettings)
  }

  async getHeroSettings(id: number): Promise<HeroSectionSettings | undefined> {
    const [heroSettings] = await db
      .select()
      .from(heroSectionSettings)
      .where(eq(heroSectionSettings.id, id))

    return heroSettings || undefined
  }

  async getHeroSettingsByName(
    name: string,
  ): Promise<HeroSectionSettings | undefined> {
    const [heroSettings] = await db
      .select()
      .from(heroSectionSettings)
      .where(eq(heroSectionSettings.name, name))

    return heroSettings || undefined
  }

  async updateHeroSettings(
    id: number,
    data: Partial<HeroSectionSettings>,
  ): Promise<HeroSectionSettings | undefined> {
    const existingHeroSettings = await this.getHeroSettings(id)

    if (!existingHeroSettings) {
      return undefined
    }

    const [updatedHeroSettings] = await db
      .update(heroSectionSettings)
      .set(data)
      .where(eq(heroSectionSettings.id, id))
      .returning()

    return updatedHeroSettings
  }

  async createHeroSettings(
    insertHeroSettings: InsertHeroSettings,
  ): Promise<HeroSectionSettings> {
    const existingHeroSettings = await this.getHeroSettingsByName(
      insertHeroSettings.name,
    )

    if (existingHeroSettings) {
      return existingHeroSettings
    }

    const [heroSettings] = await db
      .insert(heroSectionSettings)
      .values(insertHeroSettings)
      .returning()

    return heroSettings
  }

  // Virus category operations
  async getAllVirusCategories(): Promise<VirusCategory[]> {
    return await db.select().from(virusCategories)
  }

  async getVirusCategory(id: number): Promise<VirusCategory | undefined> {
    const [category] = await db
      .select()
      .from(virusCategories)
      .where(eq(virusCategories.id, id))
    return category || undefined
  }

  async createVirusCategory(
    category: InsertVirusCategory,
  ): Promise<VirusCategory> {
    const [newCategory] = await db
      .insert(virusCategories)
      .values(category)
      .returning()
    return newCategory
  }

  async updateVirusCategory(
    id: number,
    data: Partial<VirusCategory>,
  ): Promise<VirusCategory | undefined> {
    const existingCategory = await this.getVirusCategory(id)
    if (!existingCategory) {
      return undefined
    }

    const [updatedCategory] = await db
      .update(virusCategories)
      .set(data)
      .where(eq(virusCategories.id, id))
      .returning()

    return updatedCategory
  }

  async deleteVirusCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(virusCategories)
      .where(eq(virusCategories.id, id))

    return true // Postgres doesn't easily return affected rows count
  }

  // Team member operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    console.log('Fetching team members sorted by sortOrder')
    const result = await db
      .select()
      .from(teamMembers)
      .orderBy(teamMembers.sortOrder)
    console.log(
      'Team members ordering:',
      result.map(m => ({ id: m.id, name: m.name, sortOrder: m.sortOrder })),
    )
    return result
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id))
    return member || undefined
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    // Get the current max sort order and add 1 for the new member
    const existingMembers = await db.select().from(teamMembers)
    const maxSortOrder =
      existingMembers.length > 0
        ? Math.max(
            ...existingMembers.map(m =>
              m.sortOrder !== undefined && m.sortOrder !== null
                ? m.sortOrder
                : 0,
            ),
          )
        : -1
    const newSortOrder = maxSortOrder + 1

    console.log(`Creating new team member with sortOrder: ${newSortOrder}`)
    console.log('member details', member)

    // Insert with the calculated sort order
    const [newMember] = await db
      .insert(teamMembers)
      .values({
        ...member,
        sortOrder: newSortOrder,
      })
      .returning()

    return newMember
  }

  async updateTeamMember(
    id: number,
    data: Partial<TeamMember>,
  ): Promise<TeamMember | undefined> {
    const existingMember = await this.getTeamMember(id)
    if (!existingMember) {
      return undefined
    }

    const [updatedMember] = await db
      .update(teamMembers)
      .set(data)
      .where(eq(teamMembers.id, id))
      .returning()

    return updatedMember
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    const result = await db.delete(teamMembers).where(eq(teamMembers.id, id))

    return true // Postgres doesn't easily return affected rows count
  }

  async reorderTeamMembers(memberIds: number[]): Promise<TeamMember[]> {
    console.log('Starting reorderTeamMembers with memberIds:', memberIds)

    // Update sort order for each team member
    for (let i = 0; i < memberIds.length; i++) {
      console.log(`Setting sortOrder ${i} for member ID ${memberIds[i]}`)
      await db
        .update(teamMembers)
        .set({ sortOrder: i })
        .where(eq(teamMembers.id, memberIds[i]))
    }

    // Verify the sort order was updated correctly
    const updatedMembers = await this.getAllTeamMembers()
    console.log(
      'Updated member order:',
      updatedMembers.map(m => ({
        id: m.id,
        name: m.name,
        sortOrder: m.sortOrder,
      })),
    )

    // Return the reordered team members
    return updatedMembers
  }

  // Publication operations
  async getAllPublications(): Promise<Publication[]> {
    return await db.select().from(publications)
  }

  async getPublication(id: number): Promise<Publication | undefined> {
    const [publication] = await db
      .select()
      .from(publications)
      .where(eq(publications.id, id))
    return publication || undefined
  }

  async createPublication(
    publication: InsertPublication,
  ): Promise<Publication> {
    const [newPublication] = await db
      .insert(publications)
      .values(publication)
      .returning()
    return newPublication
  }

  async updatePublication(
    id: number,
    data: Partial<Publication>,
  ): Promise<Publication | undefined> {
    const existingPublication = await this.getPublication(id)
    if (!existingPublication) {
      return undefined
    }

    const [updatedPublication] = await db
      .update(publications)
      .set(data)
      .where(eq(publications.id, id))
      .returning()

    return updatedPublication
  }

  async deletePublication(id: number): Promise<boolean> {
    const result = await db.delete(publications).where(eq(publications.id, id))

    return true // Postgres doesn't easily return affected rows count
  }

  async getFilteredPublications(
    virusCategories?: number[],
    evidenceInfections?: EvidenceInfection[],
    evidenceSpillovers?: EvidenceSpillover[],
    yearRanges?: string,
    regions?: string[],
    searchQuery?: string,
  ): Promise<Array<Publication>> {
    let query = db.select().from(publications).$dynamic()

    if (!!virusCategories?.length) {
      query = query.where(sql`
        ${publications.virusCategoryIds} && ARRAY[${sql.join(
          virusCategories.map(x => sql`${x}`),
          sql`,`,
        )}]::int4[]
  `)
    }

    if (evidenceInfections)
      query = query.where(
        inArray(publications.evidenceInfection, evidenceInfections),
      )

    if (evidenceSpillovers)
      query = query.where(
        inArray(publications.evidenceSpillover, evidenceSpillovers),
      )

    if (!!regions?.length) {
      query = query.where(sql`
    ${publications.regions} && ARRAY[${sql.join(
      regions.map(r => sql`${r}`),
      sql`,`,
    )}]::geographic_region[]
  `)
    }

    if (yearRanges) {
      const yearClauses = yearRanges.split(',').map(r => {
        const [start, end] = r.split('-')
        const endYear =
          end === 'present' ? new Date().getFullYear() : parseInt(end)
        return and(
          gte(publications.year, parseInt(start)),
          lte(publications.year, endYear),
        )
      })
      query = query.where(or(...yearClauses))
    }

    if (searchQuery) {
      const searchPattern = `%${query}%`
      query = query.where(
        or(
          like(publications.title, searchPattern),
          like(publications.authors, searchPattern),
          like(publications.abstract, searchPattern),
        ),
      )
    }

    const results = await query

    return results
  }

  async getPublicationsByVirusCategory(
    virusCategoryId: number,
  ): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(arrayContains(publications.virusCategoryIds, [virusCategoryId]))
  }

  async getPublicationsByEvidenceInfection(
    quality: string,
  ): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.evidenceInfection, quality))
  }

  async getPublicationsByEvidenceSpillover(
    quality: string,
  ): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.evidenceSpillover, quality))
  }

  async getPublicationsByYear(year: number): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.year, year))
  }

  async getPublicationsByYearRange(
    startYear: number,
    endYear: number,
  ): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(
        and(gte(publications.year, startYear), lte(publications.year, endYear)),
      )
  }

  async getPublicationsByRegion(region: string): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(arrayContains(publications.regions, [region]))
  }

  async searchPublications(query: string): Promise<Publication[]> {
    const searchPattern = `%${query}%`
    return await db
      .select()
      .from(publications)
      .where(
        or(
          like(publications.title, searchPattern),
          like(publications.authors, searchPattern),
          like(publications.abstract, searchPattern),
        ),
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

  async createReview(insertReview: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(insertReview).returning()
    return result[0]
  }

  async updateReview(
    id: number,
    data: Partial<Review>,
  ): Promise<Review | undefined> {
    const existingReview = await this.getReview(id)
    if (!existingReview) {
      return undefined
    }

    const [updatedReview] = await db
      .update(reviews)
      .set(data)
      .where(eq(reviews.id, id))
      .returning()

    return updatedReview
  }

  async getReviewsForPublication(publicationId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.publicationId, publicationId))
  }

  // Background paper operations
  async getAllBackgroundPapers(): Promise<BackgroundPaper[]> {
    return await db.select().from(backgroundPapers)
  }

  async getBackgroundPaper(id: number): Promise<BackgroundPaper | undefined> {
    const [paper] = await db
      .select()
      .from(backgroundPapers)
      .where(eq(backgroundPapers.id, id))
    return paper || undefined
  }

  async createBackgroundPaper(
    paper: InsertBackgroundPaper,
  ): Promise<BackgroundPaper> {
    // Properly handle the description field
    const paperData = { ...paper }
    if (paperData.description === '') {
      paperData.description = null
    }

    console.log('Creating background paper with data:', paperData)

    const [newPaper] = await db
      .insert(backgroundPapers)
      .values(paperData)
      .returning()

    console.log('Created background paper result:', newPaper)

    return newPaper
  }

  async updateBackgroundPaper(
    id: number,
    data: Partial<BackgroundPaper>,
  ): Promise<BackgroundPaper | undefined> {
    const existingPaper = await this.getBackgroundPaper(id)
    if (!existingPaper) {
      return undefined
    }

    // Properly handle the description field to avoid 's' character issue
    const updatedData = { ...data }
    if (updatedData.description === '') {
      updatedData.description = null
    }

    console.log('DB storage update paper data:', updatedData)

    const [updatedPaper] = await db
      .update(backgroundPapers)
      .set(updatedData)
      .where(eq(backgroundPapers.id, id))
      .returning()

    console.log('DB storage updated paper result:', updatedPaper)

    return updatedPaper
  }

  async deleteBackgroundPaper(id: number): Promise<boolean> {
    const result = await db
      .delete(backgroundPapers)
      .where(eq(backgroundPapers.id, id))

    return true // Postgres doesn't easily return affected rows count
  }

  async getBackgroundPapersByVirusCategory(
    virusCategoryId: number,
  ): Promise<BackgroundPaper[]> {
    return await db
      .select()
      .from(backgroundPapers)
      .where(eq(backgroundPapers.virusCategoryId, virusCategoryId))
  }

  // Issue operations
  async getAllIssues(): Promise<Issue[]> {
    return await db.select().from(issues)
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id))
    return issue || undefined
  }

  async createIssue(issueData: InsertIssue): Promise<Issue> {
    const [newIssue] = await db
      .insert(issues)
      .values({
        ...issueData,
        status: 'open',
        priority: 'medium',
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
    return newIssue
  }

  async updateIssue(
    id: number,
    data: Partial<Issue>,
  ): Promise<Issue | undefined> {
    const existingIssue = await this.getIssue(id)
    if (!existingIssue) {
      return undefined
    }

    const [updatedIssue] = await db
      .update(issues)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning()

    return updatedIssue
  }

  async deleteIssue(id: number): Promise<boolean> {
    // First delete all comments associated with this issue
    await db.delete(issueComments).where(eq(issueComments.issueId, id))

    // Then delete the issue
    const result = await db.delete(issues).where(eq(issues.id, id))

    return true
  }

  async getIssuesByStatus(status: string): Promise<Issue[]> {
    return await db.select().from(issues).where(eq(issues.status, status))
  }

  async getIssuesByPriority(priority: string): Promise<Issue[]> {
    return await db.select().from(issues).where(eq(issues.priority, priority))
  }

  // Issue comment operations
  async getIssueComments(issueId: number): Promise<IssueComment[]> {
    return await db
      .select()
      .from(issueComments)
      .where(eq(issueComments.issueId, issueId))
  }

  async createIssueComment(
    commentData: InsertIssueComment,
  ): Promise<IssueComment> {
    const [newComment] = await db
      .insert(issueComments)
      .values(commentData)
      .returning()

    // Update the issue's updatedAt timestamp
    await db
      .update(issues)
      .set({ updatedAt: new Date() })
      .where(eq(issues.id, commentData.issueId))

    return newComment
  }

  async updateIssueComment(
    id: number,
    data: Partial<IssueComment>,
  ): Promise<IssueComment | undefined> {
    const [comment] = await db
      .select()
      .from(issueComments)
      .where(eq(issueComments.id, id))

    if (!comment) {
      return undefined
    }

    // Don't allow changing the issue
    const updatedData = { ...data }
    delete updatedData.issueId
    delete updatedData.createdAt

    const [updatedComment] = await db
      .update(issueComments)
      .set(updatedData)
      .where(eq(issueComments.id, id))
      .returning()

    return updatedComment
  }

  async deleteIssueComment(id: number): Promise<boolean> {
    const result = await db
      .delete(issueComments)
      .where(eq(issueComments.id, id))

    return true
  }

  // What We Do section operations
  async getAllWhatWeDoSections(): Promise<WhatWeDoSection[]> {
    return await db
      .select()
      .from(whatWeDoSections)
      .orderBy(whatWeDoSections.sortOrder)
  }

  async getWhatWeDoSection(id: number): Promise<WhatWeDoSection | undefined> {
    const [section] = await db
      .select()
      .from(whatWeDoSections)
      .where(eq(whatWeDoSections.id, id))
    return section || undefined
  }

  async getWhatWeDoSectionBySlug(
    slug: string,
  ): Promise<WhatWeDoSection | undefined> {
    const [section] = await db
      .select()
      .from(whatWeDoSections)
      .where(eq(whatWeDoSections.slug, slug))
    return section || undefined
  }

  async createWhatWeDoSection(
    section: InsertWhatWeDoSection,
  ): Promise<WhatWeDoSection> {
    // Properly handle nullable fields
    const sectionData = {
      ...section,
      subtitle: section.subtitle || null,
      description: section.description || null,
      imageUrl: section.imageUrl || null,
      sortOrder: section.sortOrder || 0,
    }

    const [newSection] = await db
      .insert(whatWeDoSections)
      .values(sectionData)
      .returning()

    return newSection
  }

  async updateWhatWeDoSection(
    id: number,
    data: Partial<WhatWeDoSection>,
  ): Promise<WhatWeDoSection | undefined> {
    const existingSection = await this.getWhatWeDoSection(id)
    if (!existingSection) {
      return undefined
    }

    // Handle the nullable fields
    const updateData = { ...data }

    const [updatedSection] = await db
      .update(whatWeDoSections)
      .set(updateData)
      .where(eq(whatWeDoSections.id, id))
      .returning()

    return updatedSection
  }

  async deleteWhatWeDoSection(id: number): Promise<boolean> {
    // First delete all content associated with this section
    await db.delete(whatWeDoContent).where(eq(whatWeDoContent.sectionId, id))

    // Then delete the section
    await db.delete(whatWeDoSections).where(eq(whatWeDoSections.id, id))

    return true
  }

  // What We Do content operations
  async getWhatWeDoContentBySection(
    sectionId: number,
  ): Promise<WhatWeDoContent[]> {
    return await db
      .select()
      .from(whatWeDoContent)
      .where(eq(whatWeDoContent.sectionId, sectionId))
      .orderBy(whatWeDoContent.sortOrder)
  }

  async getWhatWeDoContent(id: number): Promise<WhatWeDoContent | undefined> {
    const [content] = await db
      .select()
      .from(whatWeDoContent)
      .where(eq(whatWeDoContent.id, id))
    return content || undefined
  }

  async createWhatWeDoContent(
    content: InsertWhatWeDoContent,
  ): Promise<WhatWeDoContent> {
    // Handle nullable fields
    const contentData = {
      ...content,
      title: content.title || null,
      sortOrder: content.sortOrder || 0,
      metadata: content.metadata || null,
    }

    const [newContent] = await db
      .insert(whatWeDoContent)
      .values(contentData)
      .returning()

    return newContent
  }

  async updateWhatWeDoContent(
    id: number,
    data: Partial<WhatWeDoContent>,
  ): Promise<WhatWeDoContent | undefined> {
    const existingContent = await this.getWhatWeDoContent(id)
    if (!existingContent) {
      return undefined
    }

    const [updatedContent] = await db
      .update(whatWeDoContent)
      .set(data)
      .where(eq(whatWeDoContent.id, id))
      .returning()

    return updatedContent
  }

  async deleteWhatWeDoContent(id: number): Promise<boolean> {
    await db.delete(whatWeDoContent).where(eq(whatWeDoContent.id, id))

    return true
  }

  async reorderWhatWeDoContent(
    sectionId: number,
    contentIds: number[],
  ): Promise<WhatWeDoContent[]> {
    // Update sort order for each content item
    for (let i = 0; i < contentIds.length; i++) {
      await db
        .update(whatWeDoContent)
        .set({ sortOrder: i })
        .where(
          and(
            eq(whatWeDoContent.id, contentIds[i]),
            eq(whatWeDoContent.sectionId, sectionId),
          ),
        )
    }

    // Return the reordered content
    return this.getWhatWeDoContentBySection(sectionId)
  }

  // Settings operations
  async getAllSettings(): Promise<Settings[]> {
    return db.select().from(settings)
  }

  async getSettings(purpose: string): Promise<Settings | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.purpose, purpose))

    return setting || undefined
  }

  async updateSettings(
    id: number,
    data: Partial<Settings>,
  ): Promise<Settings | undefined> {
    const existingSettings = await db
      .select()
      .from(settings)
      .where(eq(settings.id, id))

    if (!existingSettings) {
      return undefined
    }

    const [updatedSettings] = await db
      .update(settings)
      .set(data)
      .where(eq(settings.id, id))
      .returning()

    return updatedSettings
  }

  // Database initialization
  async initializeDatabase(): Promise<void> {
    console.log('Initializing database with sample data...')

    try {
      // Virus categories
      if ((await this.getAllVirusCategories()).length === 0) {
        console.log('Seeding virus categories...')
        await db.insert(virusCategories).values([
          {
            name: 'Coronaviridae',
            description:
              'Family of enveloped, positive-sense, single-stranded RNA viruses.',
            imageUrl: '/assets/viruses/coronavirus.svg',
          },
          {
            name: 'Filoviridae',
            description:
              'Family of filamentous, enveloped, negative-sense RNA viruses.',
            imageUrl: '/assets/viruses/filovirus.svg',
          },
          {
            name: 'Paramyxoviridae',
            description:
              'Family of negative-sense RNA viruses, including measles and mumps.',
            imageUrl: '/assets/viruses/paramyxovirus.svg',
          },
          {
            name: 'Rhabdoviridae',
            description:
              'Family of negative-sense RNA viruses, including rabies virus.',
            imageUrl: '/assets/viruses/rhabdovirus.svg',
          },
          {
            name: 'Other/Unknown',
            description:
              'Additional viral families and unclassified viruses under investigation.',
            imageUrl: '/assets/viruses/unknown-virus.svg',
          },
        ])
      }

      // Resolve category ids for dependent records, whether they were just
      // seeded above or already existed.
      const categoriesByName = new Map(
        (await this.getAllVirusCategories()).map(category => [
          category.name,
          category,
        ]),
      )
      const categoryId = (name: string) => categoriesByName.get(name)?.id

      // Default admin user
      if (!(await this.getAllUsers()).length) {
        console.log('Seeding admin user...')
        const rawPassword = process.env.ADMIN_PASSWORD || 'ADM!N_PASSW0RD'
        await db.insert(users).values({
          username: 'admin',
          password: await hashPassword(rawPassword),
        })
      }

      // Team members
      if ((await this.getAllTeamMembers()).length === 0) {
        console.log('Seeding team members...')
        await db.insert(teamMembers).values([
          {
            name: 'Emily Gurley',
            title: 'Professor of Epidemiology',
            institution:
              'Johns Hopkins University - Bloomberg School of Public Health',
            description:
              'Professor of Epidemiology specializing in zoonotic disease transmission and viral spillover events.',
            imageUrl: '/assets/team/emily-gurley.png',
            email: 'egurley@jhu.edu',
            website:
              'https://www.jhsph.edu/faculty/directory/profile/emily-gurley',
            socialMedia: 'https://www.linkedin.com/in/emily-gurley',
          },
          {
            name: 'Clif McKee',
            title: 'Research Scientist',
            institution:
              'Johns Hopkins University - Bloomberg School of Public Health',
            description:
              'Research Scientist focused on bat ecology and viral evolution in bat populations.',
            imageUrl: '/assets/team/cliff-whitworth.png',
            email: 'cmckee@jhu.edu',
            website:
              'https://www.jhsph.edu/faculty/directory/profile/clif-mckee',
            socialMedia: 'https://twitter.com/clif_mckee',
          },
        ])
      }

      // Publications
      if ((await this.getAllPublications()).length === 0) {
        console.log('Seeding publications...')
        await db.insert(publications).values([
          {
            title: 'Bat Coronaviruses in China',
            authors: 'Li et al.',
            year: 2018,
            abstract:
              'Comprehensive study of SARSr-CoV prevalence and geographical distribution in Chinese bat populations, identifying novel coronaviruses with potential for human infection.',
            evidenceInfection: 'infectionHigh',
            evidenceSpillover: 'spilloverNot_Investigated',
            virusCategoryIds: [categoryId('Coronaviridae')!],
            regions: ['western_pacific'],
            publicationDate: '2018-03-15',
            link: 'https://example.com/bat-coronaviruses-china',
          },
          {
            title: 'Nipah Virus Emergence in Malaysia',
            authors: 'Chua et al.',
            year: 2000,
            abstract:
              'Investigation of the 1998-1999 outbreak of encephalitis in humans and respiratory disease in pigs, identifying fruit bats as the natural reservoir of Nipah virus.',
            evidenceInfection: 'infectionModerate',
            evidenceSpillover: 'spilloverNot_Investigated',
            virusCategoryIds: [categoryId('Paramyxoviridae')!],
            regions: ['southeast_asia'],
            publicationDate: '2000-09-26',
            link: 'https://example.com/nipah-virus-emergence',
          },
          {
            title: 'Ebola Virus Antibodies in Fruit Bats',
            authors: 'Leroy et al.',
            year: 2005,
            abstract:
              'Detection of Ebola virus antibodies in fruit bats from Central Africa, suggesting these species may be reservoir hosts for Ebola virus.',
            evidenceInfection: 'infectionLow',
            evidenceSpillover: 'spilloverNot_Investigated',
            virusCategoryIds: [categoryId('Filoviridae')!],
            regions: ['africa'],
            publicationDate: '2005-12-01',
            link: 'https://example.com/ebola-antibodies-bats',
          },
          {
            title: 'MERS-CoV in Saudi Arabian Camels',
            authors: 'Azhar et al.',
            year: 2014,
            abstract:
              'Isolation of MERS-CoV from a camel and its infected owner, providing evidence for camel-to-human transmission, with bats as the likely ancestral reservoir.',
            evidenceInfection: 'infectionHigh',
            evidenceSpillover: 'spilloverNot_Investigated',
            virusCategoryIds: [categoryId('Coronaviridae')!],
            regions: ['eastern_mediterranean'],
            publicationDate: '2014-06-05',
            link: 'https://example.com/mers-cov-camels',
          },
        ])
      }

      // Background papers
      if ((await this.getAllBackgroundPapers()).length === 0) {
        console.log('Seeding background papers...')
        await db.insert(backgroundPapers).values([
          {
            title: 'Origin and evolution of pathogenic coronaviruses',
            virusCategoryId: categoryId('Coronaviridae')!,
            link: 'https://example.com/coronavirus-evolution',
            imageUrl: '/assets/viruses/bat-hanging.png',
          },
          {
            title: 'Bat coronaviruses in China: A comprehensive review',
            virusCategoryId: categoryId('Coronaviridae')!,
            link: 'https://example.com/bat-coronavirus-review',
            imageUrl: '/assets/viruses/bat-flying.png',
          },
          {
            title: 'SARS-CoV-2: Zoonotic origins and wildlife reservoirs',
            virusCategoryId: categoryId('Coronaviridae')!,
            link: 'https://example.com/sars-cov-2-origins',
          },
          {
            title: 'Fruit bats as reservoirs of Ebola virus',
            virusCategoryId: categoryId('Filoviridae')!,
            link: 'https://example.com/fruit-bats-ebola',
          },
          {
            title: 'Marburg virus ecology in African bat populations',
            virusCategoryId: categoryId('Filoviridae')!,
            link: 'https://example.com/marburg-ecology',
          },
          {
            title: 'Molecular characterization of filoviruses in bats',
            virusCategoryId: categoryId('Filoviridae')!,
            link: 'https://example.com/filovirus-characterization',
          },
          {
            title: 'Nipah virus: Transmission dynamics and epidemiology',
            virusCategoryId: categoryId('Paramyxoviridae')!,
            link: 'https://example.com/nipah-transmission',
          },
          {
            title: 'Hendra virus: Bat-horse-human transmission pathways',
            virusCategoryId: categoryId('Paramyxoviridae')!,
            link: 'https://example.com/hendra-pathways',
          },
          {
            title: 'Evolutionary dynamics of bat paramyxoviruses',
            virusCategoryId: categoryId('Paramyxoviridae')!,
            link: 'https://example.com/paramyxovirus-evolution',
          },
          {
            title: 'Bat lyssaviruses: Antigenic and genetic diversity',
            virusCategoryId: categoryId('Rhabdoviridae')!,
            link: 'https://example.com/bat-lyssaviruses',
          },
          {
            title:
              'Global patterns of rabies virus persistence in bat reservoirs',
            virusCategoryId: categoryId('Rhabdoviridae')!,
            link: 'https://example.com/rabies-persistence',
          },
          {
            title:
              'Ecological factors influencing bat-associated rhabdoviruses',
            virusCategoryId: categoryId('Rhabdoviridae')!,
            link: 'https://example.com/rhabdovirus-ecology',
          },
        ])
      }

      // "What We Do" sections
      if ((await this.getAllWhatWeDoSections()).length === 0) {
        console.log('Seeding what-we-do sections...')
        await db.insert(whatWeDoSections).values([
          {
            title: 'Research Initiatives',
            subtitle: 'Our Bat-CoV Research Initiatives',
            description:
              'We study bat-borne viruses with an emphasis on understanding viral ecology, host factors, and transmission dynamics.',
            slug: 'research-initiatives',
            imageUrl: '/assets/what-we-do/research.jpg',
            sortOrder: 0,
          },
          {
            title: 'Field Work',
            subtitle: 'Bat Population Sampling & Monitoring',
            description:
              'Our field teams collect samples from bat populations across multiple continents to track viral prevalence and diversity.',
            slug: 'field-work',
            imageUrl: '/assets/what-we-do/field-work.jpg',
            sortOrder: 1,
          },
          {
            title: 'Laboratory Analysis',
            subtitle: 'State-of-the-art Diagnostic Capabilities',
            description:
              'We employ cutting-edge molecular techniques to identify and characterize novel viruses.',
            slug: 'laboratory-analysis',
            imageUrl: '/assets/what-we-do/lab-analysis.jpg',
            sortOrder: 2,
          },
          {
            title: 'Epidemic Modeling',
            subtitle: 'Predicting Spillover Events',
            description:
              'We develop computational models to predict viral spillover events and identify high-risk areas.',
            slug: 'epidemic-modeling',
            imageUrl: '/assets/what-we-do/modeling.jpg',
            sortOrder: 3,
          },
          {
            title: 'Capacity Building',
            subtitle: 'Training the Next Generation',
            description:
              'We train researchers and public health professionals in low and middle-income countries to enhance global surveillance capacity.',
            slug: 'capacity-building',
            imageUrl: '/assets/what-we-do/capacity-building.jpg',
            sortOrder: 4,
          },
        ])
      }

      // Resolve section ids for dependent content, whether just seeded or
      // already present.
      const sectionsBySlug = new Map(
        (await this.getAllWhatWeDoSections()).map(section => [
          section.slug,
          section,
        ]),
      )
      const researchSection = sectionsBySlug.get('research-initiatives')
      const fieldSection = sectionsBySlug.get('field-work')

      // "What We Do" content
      const existingContent = await db.select().from(whatWeDoContent)
      if (existingContent.length === 0 && researchSection && fieldSection) {
        console.log('Seeding what-we-do content...')
        await db.insert(whatWeDoContent).values([
          {
            sectionId: researchSection.id,
            title: 'Viral Discovery Program',
            contentType: 'text',
            content:
              'Our viral discovery program focuses on identifying novel coronaviruses and other bat-borne viruses with pandemic potential. Using metagenomic sequencing approaches, we have characterized dozens of previously unknown viral species.',
            sortOrder: 0,
          },
          {
            sectionId: researchSection.id,
            title: 'Host-Pathogen Interactions',
            contentType: 'text',
            content:
              'We study the molecular mechanisms that allow bats to harbor viruses without developing disease. Understanding these immune adaptations may provide insights for human therapeutics.',
            sortOrder: 1,
          },
          {
            sectionId: researchSection.id,
            title: 'Ecological Monitoring',
            contentType: 'image',
            content: '/assets/what-we-do/ecological-monitoring.jpg',
            metadata: JSON.stringify({
              caption:
                'Our team setting up acoustic monitors to track bat population movements in Southeast Asia.',
              altText:
                'Researchers installing bat acoustic monitoring equipment',
            }),
            sortOrder: 2,
          },
          {
            sectionId: fieldSection.id,
            title: 'Global Study Sites',
            contentType: 'text',
            content:
              'We operate field sites in over 20 countries across Asia, Africa, and Latin America. These sites represent diverse ecological settings where bat-human interfaces occur frequently.',
            sortOrder: 0,
          },
          {
            sectionId: fieldSection.id,
            title: 'Sampling Methods',
            contentType: 'image',
            content: '/assets/what-we-do/bat-sampling.jpg',
            metadata: JSON.stringify({
              caption:
                'Our team collecting samples from a cave-dwelling bat colony in Uganda.',
              altText: 'Researchers in PPE collecting bat samples',
            }),
            sortOrder: 1,
          },
          {
            sectionId: fieldSection.id,
            title: 'Community Engagement',
            contentType: 'text',
            content:
              'We work closely with local communities to understand human-bat interactions and develop culturally appropriate risk reduction strategies. Community participation is essential for sustainable surveillance.',
            sortOrder: 2,
          },
        ])
      }

      // Settings (guarded per purpose)
      const existingPurposes = new Set(
        (await this.getAllSettings()).map(setting => setting.purpose),
      )

      if (!existingPurposes.has('general')) {
        console.log('Seeding general settings...')
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
      }

      if (!existingPurposes.has('kotahi')) {
        console.log('Seeding kotahi settings...')
        await db.insert(settings).values({
          purpose: 'kotahi',
          formData: {
            endpoint: '',
            groupId: null,
            apiKey: null,
          },
        })
      }

      // Hero section defaults (guarded per name, so newly-added entries are
      // seeded even when some already exist).
      const heroDefaults: InsertHeroSettings[] = [
        {
          name: 'backgroundPapers',
          title: 'Background Papers',
          description:
            'We review papers related to bat-virus spillovers. The papers below represent seminal work showing that bats are the reservoir hosts for the viruses we cover at Bat-Com.',
        },
        {
          name: 'contact',
          title: 'Contact Us',
          description:
            'Please reach out to us by email with any comments, questions or suggestions for papers to review.',
        },
        {
          name: 'home',
          title:
            'Our teams curate and assess historical and emerging research on bat virus spillover events.',
          description:
            'We prioritize high-quality research on spillover events to shed light on viral reservoirs, intermediate hosts, recipient hosts, and possible spillover pathways.',
        },
        {
          name: 'publications',
          title: 'Most Recent Reviews',
          description:
            'Explore our curated collection of research on bat virus spillover events, categorized by virus family, evidence quality, and geographical region.',
        },
        {
          name: 'search',
          title: 'Search Our Reviews',
          description:
            'Find specific research papers and reviews on bat virus spillover events by searching our comprehensive database.',
        },
        {
          name: 'team',
          title: 'Our Research Team',
          description:
            'Meet the dedicated researchers behind our work on bat virus spillover events. Our interdisciplinary team combines expertise in virology, epidemiology, ecology, and public health.',
        },
        {
          name: 'whatWeDo',
          title: 'What We Do',
          description:
            'At Bat-Com, we systematically review and evaluate scientific evidence related to bat viruses and their potential to cause human disease. Our work focuses on providing high-quality, accessible information to researchers, public health officials, and policymakers.',
        },
      ]

      const existingHeroNames = new Set(
        (await this.getAllHeroSettings()).map(hero => hero.name),
      )
      const missingHero = heroDefaults.filter(
        hero => !existingHeroNames.has(hero.name),
      )

      if (missingHero.length > 0) {
        console.log(`Seeding ${missingHero.length} hero section(s)...`)
        await db.insert(heroSectionSettings).values(missingHero)
      }

      console.log('Sample data initialization complete.')
    } catch (error) {
      console.error('Error inserting sample data:', error)
      throw error
    }
  }
}
