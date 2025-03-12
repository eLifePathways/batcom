import { 
  users, type User, type InsertUser,
  virusCategories, type VirusCategory, type InsertVirusCategory,
  teamMembers, type TeamMember, type InsertTeamMember,
  publications, type Publication, type InsertPublication,
  backgroundPapers, type BackgroundPaper, type InsertBackgroundPaper,
  issues, type Issue, type InsertIssue,
  issueComments, type IssueComment, type InsertIssueComment
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, gte, lte, or } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      return undefined;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.count > 0;
  }

  // Virus category operations
  async getAllVirusCategories(): Promise<VirusCategory[]> {
    return await db.select().from(virusCategories);
  }

  async getVirusCategory(id: number): Promise<VirusCategory | undefined> {
    const [category] = await db.select().from(virusCategories).where(eq(virusCategories.id, id));
    return category || undefined;
  }

  async createVirusCategory(category: InsertVirusCategory): Promise<VirusCategory> {
    const [newCategory] = await db
      .insert(virusCategories)
      .values(category)
      .returning();
    return newCategory;
  }
  
  async updateVirusCategory(id: number, data: Partial<VirusCategory>): Promise<VirusCategory | undefined> {
    const existingCategory = await this.getVirusCategory(id);
    if (!existingCategory) {
      return undefined;
    }
    
    const [updatedCategory] = await db
      .update(virusCategories)
      .set(data)
      .where(eq(virusCategories.id, id))
      .returning();
      
    return updatedCategory;
  }
  
  async deleteVirusCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(virusCategories)
      .where(eq(virusCategories.id, id));
    
    return true; // Postgres doesn't easily return affected rows count
  }

  // Team member operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member || undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values(member)
      .returning();
    return newMember;
  }
  
  async updateTeamMember(id: number, data: Partial<TeamMember>): Promise<TeamMember | undefined> {
    const existingMember = await this.getTeamMember(id);
    if (!existingMember) {
      return undefined;
    }
    
    const [updatedMember] = await db
      .update(teamMembers)
      .set(data)
      .where(eq(teamMembers.id, id))
      .returning();
      
    return updatedMember;
  }
  
  async deleteTeamMember(id: number): Promise<boolean> {
    const result = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id));
    
    return true; // Postgres doesn't easily return affected rows count
  }

  // Publication operations
  async getAllPublications(): Promise<Publication[]> {
    return await db.select().from(publications);
  }

  async getPublication(id: number): Promise<Publication | undefined> {
    const [publication] = await db.select().from(publications).where(eq(publications.id, id));
    return publication || undefined;
  }

  async createPublication(publication: InsertPublication): Promise<Publication> {
    const [newPublication] = await db
      .insert(publications)
      .values(publication)
      .returning();
    return newPublication;
  }
  
  async updatePublication(id: number, data: Partial<Publication>): Promise<Publication | undefined> {
    const existingPublication = await this.getPublication(id);
    if (!existingPublication) {
      return undefined;
    }
    
    const [updatedPublication] = await db
      .update(publications)
      .set(data)
      .where(eq(publications.id, id))
      .returning();
      
    return updatedPublication;
  }
  
  async deletePublication(id: number): Promise<boolean> {
    const result = await db
      .delete(publications)
      .where(eq(publications.id, id));
    
    return true; // Postgres doesn't easily return affected rows count
  }

  async getPublicationsByVirusCategory(virusCategoryId: number): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.virusCategoryId, virusCategoryId));
  }

  async getPublicationsByEvidenceQuality(quality: string): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.evidenceQuality, quality));
  }

  async getPublicationsByEvidenceType(type: string): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.evidenceType, type));
  }

  async getPublicationsByYear(year: number): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.year, year));
  }

  async getPublicationsByYearRange(startYear: number, endYear: number): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(
        and(
          gte(publications.year, startYear),
          lte(publications.year, endYear)
        )
      );
  }

  async getPublicationsByRegion(region: string): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.region, region));
  }

  async searchPublications(query: string): Promise<Publication[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(publications)
      .where(
        or(
          like(publications.title, searchPattern),
          like(publications.authors, searchPattern),
          like(publications.abstract, searchPattern)
        )
      );
  }

  // Background paper operations
  async getAllBackgroundPapers(): Promise<BackgroundPaper[]> {
    return await db.select().from(backgroundPapers);
  }

  async getBackgroundPaper(id: number): Promise<BackgroundPaper | undefined> {
    const [paper] = await db.select().from(backgroundPapers).where(eq(backgroundPapers.id, id));
    return paper || undefined;
  }

  async createBackgroundPaper(paper: InsertBackgroundPaper): Promise<BackgroundPaper> {
    // Properly handle the description field
    const paperData = { ...paper };
    if (paperData.description === '') {
      paperData.description = null;
    }
    
    console.log('Creating background paper with data:', paperData);
    
    const [newPaper] = await db
      .insert(backgroundPapers)
      .values(paperData)
      .returning();
      
    console.log('Created background paper result:', newPaper);
    
    return newPaper;
  }
  
  async updateBackgroundPaper(id: number, data: Partial<BackgroundPaper>): Promise<BackgroundPaper | undefined> {
    const existingPaper = await this.getBackgroundPaper(id);
    if (!existingPaper) {
      return undefined;
    }
    
    // Properly handle the description field to avoid 's' character issue
    const updatedData = { ...data };
    if (updatedData.description === '') {
      updatedData.description = null;
    }
    
    console.log('DB storage update paper data:', updatedData);
    
    const [updatedPaper] = await db
      .update(backgroundPapers)
      .set(updatedData)
      .where(eq(backgroundPapers.id, id))
      .returning();
    
    console.log('DB storage updated paper result:', updatedPaper);
      
    return updatedPaper;
  }
  
  async deleteBackgroundPaper(id: number): Promise<boolean> {
    const result = await db
      .delete(backgroundPapers)
      .where(eq(backgroundPapers.id, id));
    
    return true; // Postgres doesn't easily return affected rows count
  }

  async getBackgroundPapersByVirusCategory(virusCategoryId: number): Promise<BackgroundPaper[]> {
    return await db
      .select()
      .from(backgroundPapers)
      .where(eq(backgroundPapers.virusCategoryId, virusCategoryId));
  }

  // Issue operations
  async getAllIssues(): Promise<Issue[]> {
    return await db.select().from(issues);
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue || undefined;
  }

  async createIssue(issueData: InsertIssue): Promise<Issue> {
    const [newIssue] = await db
      .insert(issues)
      .values({
        ...issueData,
        status: "open",
        priority: "medium",
        submittedAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newIssue;
  }

  async updateIssue(id: number, data: Partial<Issue>): Promise<Issue | undefined> {
    const existingIssue = await this.getIssue(id);
    if (!existingIssue) {
      return undefined;
    }
    
    const [updatedIssue] = await db
      .update(issues)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(issues.id, id))
      .returning();
      
    return updatedIssue;
  }

  async deleteIssue(id: number): Promise<boolean> {
    // First delete all comments associated with this issue
    await db
      .delete(issueComments)
      .where(eq(issueComments.issueId, id));
      
    // Then delete the issue
    const result = await db
      .delete(issues)
      .where(eq(issues.id, id));
    
    return true;
  }

  async getIssuesByStatus(status: string): Promise<Issue[]> {
    return await db
      .select()
      .from(issues)
      .where(eq(issues.status, status));
  }

  async getIssuesByPriority(priority: string): Promise<Issue[]> {
    return await db
      .select()
      .from(issues)
      .where(eq(issues.priority, priority));
  }

  // Issue comment operations
  async getIssueComments(issueId: number): Promise<IssueComment[]> {
    return await db
      .select()
      .from(issueComments)
      .where(eq(issueComments.issueId, issueId));
  }

  async createIssueComment(commentData: InsertIssueComment): Promise<IssueComment> {
    const [newComment] = await db
      .insert(issueComments)
      .values(commentData)
      .returning();
    
    // Update the issue's updatedAt timestamp
    await db
      .update(issues)
      .set({ updatedAt: new Date() })
      .where(eq(issues.id, commentData.issueId));
    
    return newComment;
  }

  async updateIssueComment(id: number, data: Partial<IssueComment>): Promise<IssueComment | undefined> {
    const [comment] = await db
      .select()
      .from(issueComments)
      .where(eq(issueComments.id, id));
      
    if (!comment) {
      return undefined;
    }
    
    // Don't allow changing the issue
    const updatedData = { ...data };
    delete updatedData.issueId;
    delete updatedData.createdAt;
    
    const [updatedComment] = await db
      .update(issueComments)
      .set(updatedData)
      .where(eq(issueComments.id, id))
      .returning();
      
    return updatedComment;
  }

  async deleteIssueComment(id: number): Promise<boolean> {
    const result = await db
      .delete(issueComments)
      .where(eq(issueComments.id, id));
    
    return true;
  }

  // Database initialization
  async initializeDatabase(): Promise<void> {
    console.log("Initializing database with sample data...");

    // Check if we already have data
    const existingCategories = await this.getAllVirusCategories();
    if (existingCategories.length > 0) {
      console.log("Database already contains data, skipping initialization.");
      return;
    }

    try {
      // Add virus categories
      const [coronaviridae] = await db
        .insert(virusCategories)
        .values({
          name: "Coronaviridae",
          description: "Family of enveloped, positive-sense, single-stranded RNA viruses.",
          imageUrl: "/assets/viruses/coronavirus.svg"
        })
        .returning();

      const [filoviridae] = await db
        .insert(virusCategories)
        .values({
          name: "Filoviridae",
          description: "Family of filamentous, enveloped, negative-sense RNA viruses.",
          imageUrl: "/assets/viruses/filovirus.svg"
        })
        .returning();

      const [paramyxoviridae] = await db
        .insert(virusCategories)
        .values({
          name: "Paramyxoviridae",
          description: "Family of negative-sense RNA viruses, including measles and mumps.",
          imageUrl: "/assets/viruses/paramyxovirus.svg"
        })
        .returning();

      const [sedoreoviridae] = await db
        .insert(virusCategories)
        .values({
          name: "Sedoreoviridae",
          description: "Subfamily of viruses within the family Reoviridae.",
          imageUrl: "/assets/viruses/sedoreovirus.svg"
        })
        .returning();

      const [rhabdoviridae] = await db
        .insert(virusCategories)
        .values({
          name: "Rhabdoviridae",
          description: "Family of negative-sense RNA viruses, including rabies virus.",
          imageUrl: "/assets/viruses/rhabdovirus.svg"
        })
        .returning();

      const [otherUnknown] = await db
        .insert(virusCategories)
        .values({
          name: "Other/Unknown",
          description: "Additional viral families and unclassified viruses under investigation.",
          imageUrl: "/assets/viruses/unknown-virus.svg"
        })
        .returning();

      // Add team members
      await db
        .insert(teamMembers)
        .values({
          name: "Emily Gurley",
          title: "Professor of Epidemiology",
          institution: "Johns Hopkins University - Bloomberg School of Public Health",
          description: "Professor of Epidemiology specializing in zoonotic disease transmission and viral spillover events.",
          imageUrl: "/assets/team/emily-gurley.png",
          email: "egurley@jhu.edu",
          website: "https://www.jhsph.edu/faculty/directory/profile/emily-gurley",
          socialMedia: "https://www.linkedin.com/in/emily-gurley"
        });

      await db
        .insert(teamMembers)
        .values({
          name: "Clif McKee",
          title: "Research Scientist",
          institution: "Johns Hopkins University - Bloomberg School of Public Health",
          description: "Research Scientist focused on bat ecology and viral evolution in bat populations.",
          imageUrl: "/assets/team/cliff-whitworth.png",
          email: "cmckee@jhu.edu",
          website: "https://www.jhsph.edu/faculty/directory/profile/clif-mckee",
          socialMedia: "https://twitter.com/clif_mckee"
        });

      // Add publications
      await db
        .insert(publications)
        .values({
          title: "Bat Coronaviruses in China",
          authors: "Li et al.",
          year: 2018,
          abstract: "Comprehensive study of SARSr-CoV prevalence and geographical distribution in Chinese bat populations, identifying novel coronaviruses with potential for human infection.",
          evidenceQuality: "high",
          evidenceType: "infection",
          virusCategoryId: coronaviridae.id,
          region: "Asia",
          publicationDate: "2018-03-15",
          link: "https://example.com/bat-coronaviruses-china"
        });

      await db
        .insert(publications)
        .values({
          title: "Nipah Virus Emergence in Malaysia",
          authors: "Chua et al.",
          year: 2000,
          abstract: "Investigation of the 1998-1999 outbreak of encephalitis in humans and respiratory disease in pigs, identifying fruit bats as the natural reservoir of Nipah virus.",
          evidenceQuality: "medium",
          evidenceType: "spillover",
          virusCategoryId: paramyxoviridae.id,
          region: "Asia",
          publicationDate: "2000-09-26",
          link: "https://example.com/nipah-virus-emergence"
        });

      await db
        .insert(publications)
        .values({
          title: "Ebola Virus Antibodies in Fruit Bats",
          authors: "Leroy et al.",
          year: 2005,
          abstract: "Detection of Ebola virus antibodies in fruit bats from Central Africa, suggesting these species may be reservoir hosts for Ebola virus.",
          evidenceQuality: "low",
          evidenceType: "infection",
          virusCategoryId: filoviridae.id,
          region: "Africa",
          publicationDate: "2005-12-01",
          link: "https://example.com/ebola-antibodies-bats"
        });

      await db
        .insert(publications)
        .values({
          title: "MERS-CoV in Saudi Arabian Camels",
          authors: "Azhar et al.",
          year: 2014,
          abstract: "Isolation of MERS-CoV from a camel and its infected owner, providing evidence for camel-to-human transmission, with bats as the likely ancestral reservoir.",
          evidenceQuality: "high",
          evidenceType: "spillover",
          virusCategoryId: coronaviridae.id,
          region: "Middle East",
          publicationDate: "2014-06-05",
          link: "https://example.com/mers-cov-camels"
        });

      // Add background papers
      await db
        .insert(backgroundPapers)
        .values({
          title: "Origin and evolution of pathogenic coronaviruses",
          virusCategoryId: coronaviridae.id,
          link: "https://example.com/coronavirus-evolution",
          imageUrl: "/assets/viruses/bat-hanging.png"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Bat coronaviruses in China: A comprehensive review",
          virusCategoryId: coronaviridae.id,
          link: "https://example.com/bat-coronavirus-review",
          imageUrl: "/assets/viruses/bat-flying.png"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "SARS-CoV-2: Zoonotic origins and wildlife reservoirs",
          virusCategoryId: coronaviridae.id,
          link: "https://example.com/sars-cov-2-origins"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Fruit bats as reservoirs of Ebola virus",
          virusCategoryId: filoviridae.id,
          link: "https://example.com/fruit-bats-ebola"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Marburg virus ecology in African bat populations",
          virusCategoryId: filoviridae.id,
          link: "https://example.com/marburg-ecology"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Molecular characterization of filoviruses in bats",
          virusCategoryId: filoviridae.id,
          link: "https://example.com/filovirus-characterization"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Nipah virus: Transmission dynamics and epidemiology",
          virusCategoryId: paramyxoviridae.id,
          link: "https://example.com/nipah-transmission"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Hendra virus: Bat-horse-human transmission pathways",
          virusCategoryId: paramyxoviridae.id,
          link: "https://example.com/hendra-pathways"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Evolutionary dynamics of bat paramyxoviruses",
          virusCategoryId: paramyxoviridae.id,
          link: "https://example.com/paramyxovirus-evolution"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Bat lyssaviruses: Antigenic and genetic diversity",
          virusCategoryId: rhabdoviridae.id,
          link: "https://example.com/bat-lyssaviruses"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Global patterns of rabies virus persistence in bat reservoirs",
          virusCategoryId: rhabdoviridae.id,
          link: "https://example.com/rabies-persistence"
        });

      await db
        .insert(backgroundPapers)
        .values({
          title: "Ecological factors influencing bat-associated rhabdoviruses",
          virusCategoryId: rhabdoviridae.id,
          link: "https://example.com/rhabdovirus-ecology"
        });

      console.log("Sample data successfully inserted.");
    } catch (error) {
      console.error("Error inserting sample data:", error);
      throw error;
    }
  }
}