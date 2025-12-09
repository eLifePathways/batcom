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
  EvidenceInfection,
  EvidenceSpillover,
  Review,
  InsertReview,
  KotahiReviewUser,
} from '@shared/schema'

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>
  getAllUsers(): Promise<User[]>
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>
  deleteUser(id: number): Promise<boolean>

  // Virus category operations
  getAllVirusCategories(): Promise<VirusCategory[]>
  getVirusCategory(id: number): Promise<VirusCategory | undefined>
  createVirusCategory(category: InsertVirusCategory): Promise<VirusCategory>
  updateVirusCategory(
    id: number,
    data: Partial<VirusCategory>,
  ): Promise<VirusCategory | undefined>
  deleteVirusCategory(id: number): Promise<boolean>

  // Team member operations
  getAllTeamMembers(): Promise<TeamMember[]>
  getTeamMember(id: number): Promise<TeamMember | undefined>
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>
  updateTeamMember(
    id: number,
    data: Partial<TeamMember>,
  ): Promise<TeamMember | undefined>
  deleteTeamMember(id: number): Promise<boolean>
  reorderTeamMembers(memberIds: number[]): Promise<TeamMember[]>

  // Publication operations
  getAllPublications(): Promise<Publication[]>
  getPublication(id: number): Promise<Publication | undefined>
  createPublication(publication: InsertPublication): Promise<Publication>
  updatePublication(
    id: number,
    data: Partial<Publication>,
  ): Promise<Publication | undefined>
  deletePublication(id: number): Promise<boolean>
  getFilteredPublications(
    virusCategories?: number[],
    evidenceInfections?: EvidenceInfection[],
    evidenceSpillovers?: EvidenceSpillover[],
    yearRanges?: string,
    regions?: string[],
    searchQuery?: string,
  ): Promise<Array<Publication>>
  getPublicationsByVirusCategory(
    virusCategoryId: number,
  ): Promise<Publication[]>
  getPublicationsByEvidenceInfection(quality: string): Promise<Publication[]>
  getPublicationsByEvidenceSpillover(type: string): Promise<Publication[]>
  getPublicationsByYear(year: number): Promise<Publication[]>
  getPublicationsByYearRange(
    startYear: number,
    endYear: number,
  ): Promise<Publication[]>
  getPublicationsByRegion(region: string): Promise<Publication[]>
  searchPublications(query: string): Promise<Publication[]>

  // Review operations
  getAllReviews(): Promise<Review[]>
  getReview(id: number): Promise<Review | undefined>
  createReview(review: InsertReview): Promise<Review>
  getReviewsForPublication(publicationId: number): Promise<Review[]>

  // Background paper operations
  getAllBackgroundPapers(): Promise<BackgroundPaper[]>
  getBackgroundPaper(id: number): Promise<BackgroundPaper | undefined>
  createBackgroundPaper(paper: InsertBackgroundPaper): Promise<BackgroundPaper>
  updateBackgroundPaper(
    id: number,
    data: Partial<BackgroundPaper>,
  ): Promise<BackgroundPaper | undefined>
  deleteBackgroundPaper(id: number): Promise<boolean>
  getBackgroundPapersByVirusCategory(
    virusCategoryId: number,
  ): Promise<BackgroundPaper[]>

  // Issue reporting operations
  getAllIssues(): Promise<Issue[]>
  getIssue(id: number): Promise<Issue | undefined>
  createIssue(issue: InsertIssue): Promise<Issue>
  updateIssue(id: number, data: Partial<Issue>): Promise<Issue | undefined>
  deleteIssue(id: number): Promise<boolean>
  getIssuesByStatus(status: string): Promise<Issue[]>
  getIssuesByPriority(priority: string): Promise<Issue[]>

  // Issue comment operations
  getIssueComments(issueId: number): Promise<IssueComment[]>
  createIssueComment(comment: InsertIssueComment): Promise<IssueComment>
  updateIssueComment(
    id: number,
    data: Partial<IssueComment>,
  ): Promise<IssueComment | undefined>
  deleteIssueComment(id: number): Promise<boolean>

  // What We Do section operations
  getAllWhatWeDoSections(): Promise<WhatWeDoSection[]>
  getWhatWeDoSection(id: number): Promise<WhatWeDoSection | undefined>
  getWhatWeDoSectionBySlug(slug: string): Promise<WhatWeDoSection | undefined>
  createWhatWeDoSection(
    section: InsertWhatWeDoSection,
  ): Promise<WhatWeDoSection>
  updateWhatWeDoSection(
    id: number,
    data: Partial<WhatWeDoSection>,
  ): Promise<WhatWeDoSection | undefined>
  deleteWhatWeDoSection(id: number): Promise<boolean>

  // What We Do content operations
  getWhatWeDoContentBySection(sectionId: number): Promise<WhatWeDoContent[]>
  getWhatWeDoContent(id: number): Promise<WhatWeDoContent | undefined>
  createWhatWeDoContent(
    content: InsertWhatWeDoContent,
  ): Promise<WhatWeDoContent>
  updateWhatWeDoContent(
    id: number,
    data: Partial<WhatWeDoContent>,
  ): Promise<WhatWeDoContent | undefined>
  deleteWhatWeDoContent(id: number): Promise<boolean>
  reorderWhatWeDoContent(
    sectionId: number,
    contentIds: number[],
  ): Promise<WhatWeDoContent[]>

  // Settings operations
  getAllSettings(): Promise<Settings[]>
  getSettings(purpose: string): Promise<Settings | undefined>
  updateSettings(
    id: number,
    data: Partial<Settings>,
  ): Promise<Settings | undefined>

  // Database initialization
  initializeDatabase(): Promise<void>
}

export class MemStorage implements IStorage {
  private users: Map<number, User>
  private virusCategories: Map<number, VirusCategory>
  private teamMembers: Map<number, TeamMember>
  private publications: Map<number, Publication>
  private reviews: Map<number, Review>
  private backgroundPapers: Map<number, BackgroundPaper>
  private issues: Map<number, Issue>
  private issueComments: Map<number, IssueComment>
  private whatWeDoSections: Map<number, WhatWeDoSection>
  private whatWeDoContents: Map<number, WhatWeDoContent>
  private settings: Map<number, Settings>

  private userCurrentId: number
  private virusCategoryCurrentId: number
  private teamMemberCurrentId: number
  private publicationCurrentId: number
  private reviewCurrentId: number
  private backgroundPaperCurrentId: number
  private issueCurrentId: number
  private issueCommentCurrentId: number
  private whatWeDoSectionCurrentId: number
  private whatWeDoContentCurrentId: number

  constructor() {
    this.users = new Map()
    this.virusCategories = new Map()
    this.teamMembers = new Map()
    this.publications = new Map()
    this.reviews = new Map()
    this.backgroundPapers = new Map()
    this.issues = new Map()
    this.issueComments = new Map()
    this.whatWeDoSections = new Map()
    this.whatWeDoContents = new Map()
    this.settings = new Map()

    this.userCurrentId = 1
    this.virusCategoryCurrentId = 1
    this.teamMemberCurrentId = 1
    this.publicationCurrentId = 1
    this.reviewCurrentId = 1
    this.backgroundPaperCurrentId = 1
    this.issueCurrentId = 1
    this.issueCommentCurrentId = 1
    this.whatWeDoSectionCurrentId = 1
    this.whatWeDoContentCurrentId = 1

    // Initialize with sample data
    this.initializeData()
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id)
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username,
    )
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++
    const password = await hashPassword(insertUser.password)
    const user: User = { ...insertUser, id, password }
    this.users.set(id, user)
    return user
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id)
    if (!user) {
      return undefined
    }

    const updatedUser: User = {
      ...user,
      ...data,
      id, // Ensure id doesn't change
    }

    this.users.set(id, updatedUser)
    return updatedUser
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id)
  }

  // Virus category operations
  async getAllVirusCategories(): Promise<VirusCategory[]> {
    return Array.from(this.virusCategories.values())
  }

  async getVirusCategory(id: number): Promise<VirusCategory | undefined> {
    return this.virusCategories.get(id)
  }

  async createVirusCategory(
    category: InsertVirusCategory,
  ): Promise<VirusCategory> {
    const id = this.virusCategoryCurrentId++
    const virusCategory: VirusCategory = {
      ...category,
      id,
      imageUrl: category.imageUrl ?? null,
    }
    this.virusCategories.set(id, virusCategory)
    return virusCategory
  }

  async updateVirusCategory(
    id: number,
    data: Partial<VirusCategory>,
  ): Promise<VirusCategory | undefined> {
    const category = this.virusCategories.get(id)
    if (!category) {
      return undefined
    }

    const updatedCategory: VirusCategory = {
      ...category,
      ...data,
      id, // Ensure id doesn't change
      imageUrl: data.imageUrl ?? category.imageUrl,
    }

    this.virusCategories.set(id, updatedCategory)
    return updatedCategory
  }

  async deleteVirusCategory(id: number): Promise<boolean> {
    return this.virusCategories.delete(id)
  }

  // Team member operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id)
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberCurrentId++
    const teamMember: TeamMember = {
      ...member,
      id,
      imageUrl: member.imageUrl ?? null,
      email: member.email ?? null,
      website: member.website ?? null,
      socialMedia: member.socialMedia ?? null,
      sortOrder: member.sortOrder ?? 0,
    }
    this.teamMembers.set(id, teamMember)
    return teamMember
  }

  async updateTeamMember(
    id: number,
    data: Partial<TeamMember>,
  ): Promise<TeamMember | undefined> {
    const teamMember = this.teamMembers.get(id)
    if (!teamMember) {
      return undefined
    }

    const updatedMember: TeamMember = {
      ...teamMember,
      ...data,
      id, // Ensure id doesn't change
      imageUrl: data.imageUrl ?? teamMember.imageUrl,
      email: data.email ?? teamMember.email,
      website: data.website ?? teamMember.website,
      socialMedia: data.socialMedia ?? teamMember.socialMedia,
      sortOrder: data.sortOrder ?? teamMember.sortOrder,
    }

    this.teamMembers.set(id, updatedMember)
    return updatedMember
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    return this.teamMembers.delete(id)
  }

  async reorderTeamMembers(memberIds: number[]): Promise<TeamMember[]> {
    // Update sort order for each team member
    for (let i = 0; i < memberIds.length; i++) {
      const member = this.teamMembers.get(memberIds[i])
      if (member) {
        this.teamMembers.set(memberIds[i], { ...member, sortOrder: i })
      }
    }

    // Return the reordered team members sorted by sortOrder
    return Array.from(this.teamMembers.values()).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    )
  }

  // Publication operations
  async getAllPublications(): Promise<Publication[]> {
    return Array.from(this.publications.values())
  }

  async getPublication(id: number): Promise<Publication | undefined> {
    return this.publications.get(id)
  }

  async createPublication(
    publication: InsertPublication,
  ): Promise<Publication> {
    const id = this.publicationCurrentId++
    const newPublication: Publication = {
      ...publication,
      kotahiManuscriptId: publication.kotahiManuscriptId ?? crypto.randomUUID(),
      id,
      link: publication.link ?? null,
    }
    this.publications.set(id, newPublication)
    return newPublication
  }

  async updatePublication(
    id: number,
    data: Partial<Publication>,
  ): Promise<Publication | undefined> {
    const publication = this.publications.get(id)
    if (!publication) {
      return undefined
    }

    const updatedPublication: Publication = {
      ...publication,
      ...data,
      id, // Ensure id doesn't change
      link: data.link ?? publication.link,
    }

    this.publications.set(id, updatedPublication)
    return updatedPublication
  }

  async deletePublication(id: number): Promise<boolean> {
    return this.publications.delete(id)
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
    return Array.from(this.publications.values()).filter(
      publication => publication.virusCategoryId === virusCategoryId,
    )
  }

  async getPublicationsByEvidenceInfection(
    quality: string,
  ): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.evidenceInfection === quality,
    )
  }

  async getPublicationsByEvidenceSpillover(
    type: string,
  ): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.evidenceSpillover === type,
    )
  }

  async getPublicationsByYear(year: number): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.year === year,
    )
  }

  async getPublicationsByYearRange(
    startYear: number,
    endYear: number,
  ): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication =>
        publication.year >= startYear && publication.year <= endYear,
    )
  }

  async getPublicationsByRegion(region: string): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.region === region,
    )
  }

  async searchPublications(query: string): Promise<Publication[]> {
    const lowercaseQuery = query.toLowerCase()
    return Array.from(this.publications.values()).filter(
      publication =>
        publication.title.toLowerCase().includes(lowercaseQuery) ||
        publication.authors.toLowerCase().includes(lowercaseQuery) ||
        publication.abstract.toLowerCase().includes(lowercaseQuery),
    )
  }

  // TODO: review operations
  async getAllReviews(): Promise<Review[]> {
    return []
  }
  async getReview(id: number): Promise<Review | undefined> {
    return undefined
  }
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++
    const newReview: Review = {
      ...review,
      id,
      users: review.users as KotahiReviewUser[],
    }
    this.reviews.set(id, newReview)
    return newReview
  }

  async getReviewsForPublication(publicationId: number): Promise<Review[]> {
    return []
  }

  // Background paper operations
  async getAllBackgroundPapers(): Promise<BackgroundPaper[]> {
    return Array.from(this.backgroundPapers.values())
  }

  async getBackgroundPaper(id: number): Promise<BackgroundPaper | undefined> {
    return this.backgroundPapers.get(id)
  }

  async createBackgroundPaper(
    paper: InsertBackgroundPaper,
  ): Promise<BackgroundPaper> {
    const id = this.backgroundPaperCurrentId++
    const backgroundPaper: BackgroundPaper = {
      ...paper,
      id,
      link: paper.link ?? null,
      imageUrl: paper.imageUrl ?? null,
      description: paper.description ?? null,
    }
    this.backgroundPapers.set(id, backgroundPaper)
    return backgroundPaper
  }

  async updateBackgroundPaper(
    id: number,
    data: Partial<BackgroundPaper>,
  ): Promise<BackgroundPaper | undefined> {
    const paper = this.backgroundPapers.get(id)
    if (!paper) {
      return undefined
    }

    const updatedPaper: BackgroundPaper = {
      ...paper,
      ...data,
      id, // Ensure id doesn't change
      link: data.link ?? paper.link,
      imageUrl: data.imageUrl ?? paper.imageUrl,
      description: data.description ?? paper.description,
    }

    this.backgroundPapers.set(id, updatedPaper)
    return updatedPaper
  }

  async deleteBackgroundPaper(id: number): Promise<boolean> {
    return this.backgroundPapers.delete(id)
  }

  async getBackgroundPapersByVirusCategory(
    virusCategoryId: number,
  ): Promise<BackgroundPaper[]> {
    return Array.from(this.backgroundPapers.values()).filter(
      paper => paper.virusCategoryId === virusCategoryId,
    )
  }

  // Issue operations
  async getAllIssues(): Promise<Issue[]> {
    return Array.from(this.issues.values())
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    return this.issues.get(id)
  }

  async createIssue(issueData: InsertIssue): Promise<Issue> {
    const id = this.issueCurrentId++
    const now = new Date()

    const issue: Issue = {
      ...issueData,
      id,
      status: 'open',
      priority: 'medium',
      submittedAt: now,
      updatedAt: now,
      screenshotUrl: issueData.screenshotUrl ?? null,
      consoleLog: issueData.consoleLog ?? null,
      userId: issueData.userId ?? null,
      browserInfo: issueData.browserInfo ?? null,
    }

    this.issues.set(id, issue)
    return issue
  }

  async updateIssue(
    id: number,
    data: Partial<Issue>,
  ): Promise<Issue | undefined> {
    const issue = this.issues.get(id)
    if (!issue) {
      return undefined
    }

    const updatedIssue: Issue = {
      ...issue,
      ...data,
      id, // Ensure id doesn't change
      updatedAt: new Date(),
      screenshotUrl: data.screenshotUrl ?? issue.screenshotUrl,
      consoleLog: data.consoleLog ?? issue.consoleLog,
      userId: data.userId ?? issue.userId,
      browserInfo: data.browserInfo ?? issue.browserInfo,
    }

    this.issues.set(id, updatedIssue)
    return updatedIssue
  }

  async deleteIssue(id: number): Promise<boolean> {
    // Delete all comments associated with this issue
    Array.from(this.issueComments.values())
      .filter(comment => comment.issueId === id)
      .forEach(comment => this.issueComments.delete(comment.id))

    // Then delete the issue
    return this.issues.delete(id)
  }

  async getIssuesByStatus(status: string): Promise<Issue[]> {
    return Array.from(this.issues.values()).filter(
      issue => issue.status === status,
    )
  }

  async getIssuesByPriority(priority: string): Promise<Issue[]> {
    return Array.from(this.issues.values()).filter(
      issue => issue.priority === priority,
    )
  }

  // Issue comment operations
  async getIssueComments(issueId: number): Promise<IssueComment[]> {
    return Array.from(this.issueComments.values()).filter(
      comment => comment.issueId === issueId,
    )
  }

  async createIssueComment(
    commentData: InsertIssueComment,
  ): Promise<IssueComment> {
    const id = this.issueCommentCurrentId++
    const now = new Date()

    const comment: IssueComment = {
      id,
      issueId: commentData.issueId,
      content: commentData.content,
      createdAt: now,
      userId: commentData.userId ?? null,
      author: commentData.author ?? 'Admin',
      isInternal: commentData.isInternal ?? false,
    }

    this.issueComments.set(id, comment)

    // Update the issue's updatedAt timestamp
    const issue = this.issues.get(commentData.issueId)
    if (issue) {
      this.updateIssue(issue.id, { updatedAt: now })
    }

    return comment
  }

  async updateIssueComment(
    id: number,
    data: Partial<IssueComment>,
  ): Promise<IssueComment | undefined> {
    const comment = this.issueComments.get(id)
    if (!comment) {
      return undefined
    }

    const updatedComment: IssueComment = {
      ...comment,
      ...data,
      id, // Ensure id doesn't change
      issueId: comment.issueId, // Don't allow changing the issue
      createdAt: comment.createdAt, // Don't allow changing the creation date
      userId: data.userId ?? comment.userId,
      author: data.author ?? comment.author,
      isInternal: data.isInternal ?? comment.isInternal,
      content: data.content ?? comment.content,
    }

    this.issueComments.set(id, updatedComment)
    return updatedComment
  }

  async deleteIssueComment(id: number): Promise<boolean> {
    return this.issueComments.delete(id)
  }

  // What We Do section operations
  async getAllWhatWeDoSections(): Promise<WhatWeDoSection[]> {
    return Array.from(this.whatWeDoSections.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    )
  }

  async getWhatWeDoSection(id: number): Promise<WhatWeDoSection | undefined> {
    return this.whatWeDoSections.get(id)
  }

  async getWhatWeDoSectionBySlug(
    slug: string,
  ): Promise<WhatWeDoSection | undefined> {
    return Array.from(this.whatWeDoSections.values()).find(
      section => section.slug === slug,
    )
  }

  async createWhatWeDoSection(
    section: InsertWhatWeDoSection,
  ): Promise<WhatWeDoSection> {
    const id = this.whatWeDoSectionCurrentId++
    const now = new Date()

    const newSection: WhatWeDoSection = {
      ...section,
      id,
      subtitle: section.subtitle ?? null,
      description: section.description ?? null,
      imageUrl: section.imageUrl ?? null,
      sortOrder: section.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    }

    this.whatWeDoSections.set(id, newSection)
    return newSection
  }

  async updateWhatWeDoSection(
    id: number,
    data: Partial<WhatWeDoSection>,
  ): Promise<WhatWeDoSection | undefined> {
    const section = this.whatWeDoSections.get(id)
    if (!section) {
      return undefined
    }

    const updatedSection: WhatWeDoSection = {
      ...section,
      ...data,
      id, // Ensure id doesn't change
      updatedAt: new Date(),
      createdAt: section.createdAt, // Don't allow changing the creation date
    }

    this.whatWeDoSections.set(id, updatedSection)
    return updatedSection
  }

  async deleteWhatWeDoSection(id: number): Promise<boolean> {
    // Delete all content associated with this section first
    Array.from(this.whatWeDoContents.values())
      .filter(content => content.sectionId === id)
      .forEach(content => this.whatWeDoContents.delete(content.id))

    // Then delete the section
    return this.whatWeDoSections.delete(id)
  }

  // What We Do content operations
  async getWhatWeDoContentBySection(
    sectionId: number,
  ): Promise<WhatWeDoContent[]> {
    return Array.from(this.whatWeDoContents.values())
      .filter(content => content.sectionId === sectionId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  async getWhatWeDoContent(id: number): Promise<WhatWeDoContent | undefined> {
    return this.whatWeDoContents.get(id)
  }

  async createWhatWeDoContent(
    content: InsertWhatWeDoContent,
  ): Promise<WhatWeDoContent> {
    const id = this.whatWeDoContentCurrentId++
    const now = new Date()

    const newContent: WhatWeDoContent = {
      ...content,
      id,
      title: content.title ?? null,
      sortOrder: content.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
      metadata: content.metadata ?? null,
    }

    this.whatWeDoContents.set(id, newContent)
    return newContent
  }

  async updateWhatWeDoContent(
    id: number,
    data: Partial<WhatWeDoContent>,
  ): Promise<WhatWeDoContent | undefined> {
    const content = this.whatWeDoContents.get(id)
    if (!content) {
      return undefined
    }

    const updatedContent: WhatWeDoContent = {
      ...content,
      ...data,
      id, // Ensure id doesn't change
      sectionId: data.sectionId ?? content.sectionId,
      updatedAt: new Date(),
      createdAt: content.createdAt, // Don't allow changing the creation date
      metadata: data.metadata ?? content.metadata,
    }

    this.whatWeDoContents.set(id, updatedContent)
    return updatedContent
  }

  async deleteWhatWeDoContent(id: number): Promise<boolean> {
    return this.whatWeDoContents.delete(id)
  }

  async reorderWhatWeDoContent(
    sectionId: number,
    contentIds: number[],
  ): Promise<WhatWeDoContent[]> {
    // Get all content for this section
    const sectionContent = await this.getWhatWeDoContentBySection(sectionId)

    // Map of content IDs to their current objects
    const contentMap = new Map<number, WhatWeDoContent>()
    sectionContent.forEach(content => contentMap.set(content.id, content))

    // Update the sort order of each content item
    for (let i = 0; i < contentIds.length; i++) {
      const contentId = contentIds[i]
      const content = contentMap.get(contentId)

      if (content) {
        await this.updateWhatWeDoContent(contentId, { sortOrder: i })
      }
    }

    // Return the reordered content
    return this.getWhatWeDoContentBySection(sectionId)
  }

  // Settings operations
  async getAllSettings(): Promise<Settings[]> {
    return Array.from(this.settings.values())
  }
  async getSettings(purpose: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      setting => setting.purpose === purpose,
    )
  }
  async updateSettings(
    id: number,
    data: Partial<Settings>,
  ): Promise<Settings | undefined> {
    const content = this.settings.get(id)
    if (!content) {
      return undefined
    }

    const updatedSettings: Settings = {
      ...content,
      ...data,
      id, // Ensure id doesn't change
    }

    this.settings.set(id, updatedSettings)
    return updatedSettings
  }

  // Database initialization method for interface compliance
  async initializeDatabase(): Promise<void> {
    console.log('Using in-memory storage, data already initialized.')
    return
  }

  // Initialize sample data
  private initializeData() {
    // Add virus categories
    const coronaviridae = this.createVirusCategory({
      name: 'Coronaviridae',
      description:
        'Family of enveloped, positive-sense, single-stranded RNA viruses.',
      imageUrl: '/assets/viruses/coronavirus.svg',
    })

    const filoviridae = this.createVirusCategory({
      name: 'Filoviridae',
      description:
        'Family of filamentous, enveloped, negative-sense RNA viruses.',
      imageUrl: '/assets/viruses/filovirus.svg',
    })

    const paramyxoviridae = this.createVirusCategory({
      name: 'Paramyxoviridae',
      description:
        'Family of negative-sense RNA viruses, including measles and mumps.',
      imageUrl: '/assets/viruses/paramyxovirus.svg',
    })

    // const sedoreoviridae = this.createVirusCategory({
    //   name: 'Sedoreoviridae',
    //   description: 'Subfamily of viruses within the family Reoviridae.',
    //   imageUrl: '/assets/viruses/sedoreovirus.svg',
    // })

    const rhabdoviridae = this.createVirusCategory({
      name: 'Rhabdoviridae',
      description:
        'Family of negative-sense RNA viruses, including rabies virus.',
      imageUrl: '/assets/viruses/rhabdovirus.svg',
    })

    const otherUnknown = this.createVirusCategory({
      name: 'Other/Unknown',
      description:
        'Additional viral families and unclassified viruses under investigation.',
      imageUrl: '/assets/viruses/unknown-virus.svg',
    })

    // Add default admin
    this.createUser({
      username: 'admin',
      password: process.env.ADMIN_PASSWORD || 'ADM!N_PASSW0RD',
    })

    // Add team members
    this.createTeamMember({
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

    this.createTeamMember({
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

    // Add publications
    this.createPublication({
      title: 'Bat Coronaviruses in China',
      authors: 'Li et al.',
      year: 2018,
      abstract:
        'Comprehensive study of SARSr-CoV prevalence and geographical distribution in Chinese bat populations, identifying novel coronaviruses with potential for human infection.',
      evidenceInfection: 'infectionHigh',
      evidenceSpillover: 'spilloverNot_Investigated',
      virusCategoryId: 1, // Coronaviridae
      region: 'Asia',
      publicationDate: '2018-03-15',
      link: 'https://example.com/bat-coronaviruses-china',
    })

    this.createPublication({
      title: 'Nipah Virus Emergence in Malaysia',
      authors: 'Chua et al.',
      year: 2000,
      abstract:
        'Investigation of the 1998-1999 outbreak of encephalitis in humans and respiratory disease in pigs, identifying fruit bats as the natural reservoir of Nipah virus.',
      evidenceInfection: 'infectionModerate',
      evidenceSpillover: 'spilloverNot_Investigated',
      virusCategoryId: 3, // Paramyxoviridae
      region: 'Asia',
      publicationDate: '2000-09-26',
      link: 'https://example.com/nipah-virus-emergence',
    })

    this.createPublication({
      title: 'Ebola Virus Antibodies in Fruit Bats',
      authors: 'Leroy et al.',
      year: 2005,
      abstract:
        'Detection of Ebola virus antibodies in fruit bats from Central Africa, suggesting these species may be reservoir hosts for Ebola virus.',
      evidenceInfection: 'infectionLow',
      evidenceSpillover: 'spilloverNot_Investigated',
      virusCategoryId: 2, // Filoviridae
      region: 'Africa',
      publicationDate: '2005-12-01',
      link: 'https://example.com/ebola-antibodies-bats',
    })

    this.createPublication({
      title: 'MERS-CoV in Saudi Arabian Camels',
      authors: 'Azhar et al.',
      year: 2014,
      abstract:
        'Isolation of MERS-CoV from a camel and its infected owner, providing evidence for camel-to-human transmission, with bats as the likely ancestral reservoir.',
      evidenceInfection: 'infectionHigh',
      evidenceSpillover: 'spilloverNot_Investigated',
      virusCategoryId: 1, // Coronaviridae
      region: 'Middle East',
      publicationDate: '2014-06-05',
      link: 'https://example.com/mers-cov-camels',
    })

    // Add background papers
    this.createBackgroundPaper({
      title: 'Origin and evolution of pathogenic coronaviruses',
      virusCategoryId: 1, // Coronaviridae
      link: 'https://example.com/coronavirus-evolution',
      imageUrl: '/assets/viruses/bat-hanging.png',
    })

    this.createBackgroundPaper({
      title: 'Bat coronaviruses in China: A comprehensive review',
      virusCategoryId: 1, // Coronaviridae
      link: 'https://example.com/bat-coronavirus-review',
      imageUrl: '/assets/viruses/bat-flying.png',
    })

    this.createBackgroundPaper({
      title: 'SARS-CoV-2: Zoonotic origins and wildlife reservoirs',
      virusCategoryId: 1, // Coronaviridae
      link: 'https://example.com/sars-cov-2-origins',
    })

    this.createBackgroundPaper({
      title: 'Fruit bats as reservoirs of Ebola virus',
      virusCategoryId: 2, // Filoviridae
      link: 'https://example.com/fruit-bats-ebola',
    })

    this.createBackgroundPaper({
      title: 'Marburg virus ecology in African bat populations',
      virusCategoryId: 2, // Filoviridae
      link: 'https://example.com/marburg-ecology',
    })

    this.createBackgroundPaper({
      title: 'Molecular characterization of filoviruses in bats',
      virusCategoryId: 2, // Filoviridae
      link: 'https://example.com/filovirus-characterization',
    })

    this.createBackgroundPaper({
      title: 'Nipah virus: Transmission dynamics and epidemiology',
      virusCategoryId: 3, // Paramyxoviridae
      link: 'https://example.com/nipah-transmission',
    })

    this.createBackgroundPaper({
      title: 'Hendra virus: Bat-horse-human transmission pathways',
      virusCategoryId: 3, // Paramyxoviridae
      link: 'https://example.com/hendra-pathways',
    })

    this.createBackgroundPaper({
      title: 'Evolutionary dynamics of bat paramyxoviruses',
      virusCategoryId: 3, // Paramyxoviridae
      link: 'https://example.com/paramyxovirus-evolution',
    })

    this.createBackgroundPaper({
      title: 'Bat lyssaviruses: Antigenic and genetic diversity',
      virusCategoryId: 5, // Rhabdoviridae
      link: 'https://example.com/bat-lyssaviruses',
    })

    this.createBackgroundPaper({
      title: 'Global patterns of rabies virus persistence in bat reservoirs',
      virusCategoryId: 5, // Rhabdoviridae
      link: 'https://example.com/rabies-persistence',
    })

    this.createBackgroundPaper({
      title: 'Ecological factors influencing bat-associated rhabdoviruses',
      virusCategoryId: 5, // Rhabdoviridae
      link: 'https://example.com/rhabdovirus-ecology',
    })

    // For simplicity, we'll just create the basic structure
    // In a real application, this would be properly initialized with async/await

    // Add "What We Do" sections - manually assign IDs to avoid async handling in constructor
    const researchSectionId = 1
    this.whatWeDoSections.set(researchSectionId, {
      id: researchSectionId,
      title: 'Research Initiatives',
      subtitle: 'Our Bat-CoV Research Initiatives',
      description:
        'We study bat-borne viruses with an emphasis on understanding viral ecology, host factors, and transmission dynamics.',
      slug: 'research-initiatives',
      imageUrl: '/assets/what-we-do/research.jpg',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const fieldSectionId = 2
    this.whatWeDoSections.set(fieldSectionId, {
      id: fieldSectionId,
      title: 'Field Work',
      subtitle: 'Bat Population Sampling & Monitoring',
      description:
        'Our field teams collect samples from bat populations across multiple continents to track viral prevalence and diversity.',
      slug: 'field-work',
      imageUrl: '/assets/what-we-do/field-work.jpg',
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const labSectionId = 3
    this.whatWeDoSections.set(labSectionId, {
      id: labSectionId,
      title: 'Laboratory Analysis',
      subtitle: 'State-of-the-art Diagnostic Capabilities',
      description:
        'We employ cutting-edge molecular techniques to identify and characterize novel viruses.',
      slug: 'laboratory-analysis',
      imageUrl: '/assets/what-we-do/lab-analysis.jpg',
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const modelingSectionId = 4
    this.whatWeDoSections.set(modelingSectionId, {
      id: modelingSectionId,
      title: 'Epidemic Modeling',
      subtitle: 'Predicting Spillover Events',
      description:
        'We develop computational models to predict viral spillover events and identify high-risk areas.',
      slug: 'epidemic-modeling',
      imageUrl: '/assets/what-we-do/modeling.jpg',
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const capacitySectionId = 5
    this.whatWeDoSections.set(capacitySectionId, {
      id: capacitySectionId,
      title: 'Capacity Building',
      subtitle: 'Training the Next Generation',
      description:
        'We train researchers and public health professionals in low and middle-income countries to enhance global surveillance capacity.',
      slug: 'capacity-building',
      imageUrl: '/assets/what-we-do/capacity-building.jpg',
      sortOrder: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update the section ID counter
    this.whatWeDoSectionCurrentId = 6

    // Add content for Research Initiatives section
    const contentId1 = 1
    this.whatWeDoContents.set(contentId1, {
      id: contentId1,
      sectionId: researchSectionId,
      title: 'Viral Discovery Program',
      contentType: 'text',
      content:
        'Our viral discovery program focuses on identifying novel coronaviruses and other bat-borne viruses with pandemic potential. Using metagenomic sequencing approaches, we have characterized dozens of previously unknown viral species.',
      sortOrder: 0,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const contentId2 = 2
    this.whatWeDoContents.set(contentId2, {
      id: contentId2,
      sectionId: researchSectionId,
      title: 'Host-Pathogen Interactions',
      contentType: 'text',
      content:
        'We study the molecular mechanisms that allow bats to harbor viruses without developing disease. Understanding these immune adaptations may provide insights for human therapeutics.',
      sortOrder: 1,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const contentId3 = 3
    this.whatWeDoContents.set(contentId3, {
      id: contentId3,
      sectionId: researchSectionId,
      title: 'Ecological Monitoring',
      contentType: 'image',
      content: '/assets/what-we-do/ecological-monitoring.jpg',
      metadata: JSON.stringify({
        caption:
          'Our team setting up acoustic monitors to track bat population movements in Southeast Asia.',
        altText: 'Researchers installing bat acoustic monitoring equipment',
      }),
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Add content for Field Work section
    const contentId4 = 4
    this.whatWeDoContents.set(contentId4, {
      id: contentId4,
      sectionId: fieldSectionId,
      title: 'Global Study Sites',
      contentType: 'text',
      content:
        'We operate field sites in over 20 countries across Asia, Africa, and Latin America. These sites represent diverse ecological settings where bat-human interfaces occur frequently.',
      sortOrder: 0,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const contentId5 = 5
    this.whatWeDoContents.set(contentId5, {
      id: contentId5,
      sectionId: fieldSectionId,
      title: 'Sampling Methods',
      contentType: 'image',
      content: '/assets/what-we-do/bat-sampling.jpg',
      metadata: JSON.stringify({
        caption:
          'Our team collecting samples from a cave-dwelling bat colony in Uganda.',
        altText: 'Researchers in PPE collecting bat samples',
      }),
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const contentId6 = 6
    this.whatWeDoContents.set(contentId6, {
      id: contentId6,
      sectionId: fieldSectionId,
      title: 'Community Engagement',
      contentType: 'text',
      content:
        'We work closely with local communities to understand human-bat interactions and develop culturally appropriate risk reduction strategies. Community participation is essential for sustainable surveillance.',
      sortOrder: 2,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update the content ID counter
    this.whatWeDoContentCurrentId = 7

    const generalSettingsId = 1
    this.settings.set(generalSettingsId, {
      id: generalSettingsId,
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

    const kotahiSettingsId = 2
    this.settings.set(1, {
      id: kotahiSettingsId,
      purpose: 'kotahi',
      formData: {
        endpoint: '',
        groupId: '',
        apiKey: '',
      },
    })
  }
}

import { DatabaseStorage } from './db-storage'
import { hashPassword } from './auth'

// Choose which storage implementation to use
export const storage = process.env.POSTGRES_URL
  ? new DatabaseStorage()
  : new MemStorage()
