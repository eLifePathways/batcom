import {
  users, type User, type InsertUser,
  virusCategories, type VirusCategory, type InsertVirusCategory,
  teamMembers, type TeamMember, type InsertTeamMember,
  publications, type Publication, type InsertPublication,
  backgroundPapers, type BackgroundPaper, type InsertBackgroundPaper
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Virus category operations
  getAllVirusCategories(): Promise<VirusCategory[]>;
  getVirusCategory(id: number): Promise<VirusCategory | undefined>;
  createVirusCategory(category: InsertVirusCategory): Promise<VirusCategory>;

  // Team member operations
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;

  // Publication operations
  getAllPublications(): Promise<Publication[]>;
  getPublication(id: number): Promise<Publication | undefined>;
  createPublication(publication: InsertPublication): Promise<Publication>;
  getPublicationsByVirusCategory(virusCategoryId: number): Promise<Publication[]>;
  getPublicationsByEvidenceQuality(quality: string): Promise<Publication[]>;
  getPublicationsByEvidenceType(type: string): Promise<Publication[]>;
  getPublicationsByYear(year: number): Promise<Publication[]>;
  getPublicationsByYearRange(startYear: number, endYear: number): Promise<Publication[]>;
  getPublicationsByRegion(region: string): Promise<Publication[]>;
  searchPublications(query: string): Promise<Publication[]>;

  // Background paper operations
  getAllBackgroundPapers(): Promise<BackgroundPaper[]>;
  getBackgroundPaper(id: number): Promise<BackgroundPaper | undefined>;
  createBackgroundPaper(paper: InsertBackgroundPaper): Promise<BackgroundPaper>;
  getBackgroundPapersByVirusCategory(virusCategoryId: number): Promise<BackgroundPaper[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private virusCategories: Map<number, VirusCategory>;
  private teamMembers: Map<number, TeamMember>;
  private publications: Map<number, Publication>;
  private backgroundPapers: Map<number, BackgroundPaper>;
  
  private userCurrentId: number;
  private virusCategoryCurrentId: number;
  private teamMemberCurrentId: number;
  private publicationCurrentId: number;
  private backgroundPaperCurrentId: number;

  constructor() {
    this.users = new Map();
    this.virusCategories = new Map();
    this.teamMembers = new Map();
    this.publications = new Map();
    this.backgroundPapers = new Map();
    
    this.userCurrentId = 1;
    this.virusCategoryCurrentId = 1;
    this.teamMemberCurrentId = 1;
    this.publicationCurrentId = 1;
    this.backgroundPaperCurrentId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Virus category operations
  async getAllVirusCategories(): Promise<VirusCategory[]> {
    return Array.from(this.virusCategories.values());
  }

  async getVirusCategory(id: number): Promise<VirusCategory | undefined> {
    return this.virusCategories.get(id);
  }

  async createVirusCategory(category: InsertVirusCategory): Promise<VirusCategory> {
    const id = this.virusCategoryCurrentId++;
    const virusCategory: VirusCategory = { 
      ...category, 
      id,
      imageUrl: category.imageUrl ?? null 
    };
    this.virusCategories.set(id, virusCategory);
    return virusCategory;
  }

  // Team member operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberCurrentId++;
    const teamMember: TeamMember = { 
      ...member, 
      id,
      imageUrl: member.imageUrl ?? null,
      email: member.email ?? null,
      website: member.website ?? null,
      socialMedia: member.socialMedia ?? null
    };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }

  // Publication operations
  async getAllPublications(): Promise<Publication[]> {
    return Array.from(this.publications.values());
  }

  async getPublication(id: number): Promise<Publication | undefined> {
    return this.publications.get(id);
  }

  async createPublication(publication: InsertPublication): Promise<Publication> {
    const id = this.publicationCurrentId++;
    const newPublication: Publication = { 
      ...publication, 
      id,
      link: publication.link ?? null
    };
    this.publications.set(id, newPublication);
    return newPublication;
  }

  async getPublicationsByVirusCategory(virusCategoryId: number): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.virusCategoryId === virusCategoryId
    );
  }

  async getPublicationsByEvidenceQuality(quality: string): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.evidenceQuality === quality
    );
  }

  async getPublicationsByEvidenceType(type: string): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.evidenceType === type
    );
  }

  async getPublicationsByYear(year: number): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.year === year
    );
  }

  async getPublicationsByYearRange(startYear: number, endYear: number): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.year >= startYear && publication.year <= endYear
    );
  }

  async getPublicationsByRegion(region: string): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      publication => publication.region === region
    );
  }

  async searchPublications(query: string): Promise<Publication[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.publications.values()).filter(
      publication => 
        publication.title.toLowerCase().includes(lowercaseQuery) ||
        publication.authors.toLowerCase().includes(lowercaseQuery) ||
        publication.abstract.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Background paper operations
  async getAllBackgroundPapers(): Promise<BackgroundPaper[]> {
    return Array.from(this.backgroundPapers.values());
  }

  async getBackgroundPaper(id: number): Promise<BackgroundPaper | undefined> {
    return this.backgroundPapers.get(id);
  }

  async createBackgroundPaper(paper: InsertBackgroundPaper): Promise<BackgroundPaper> {
    const id = this.backgroundPaperCurrentId++;
    const backgroundPaper: BackgroundPaper = { 
      ...paper, 
      id,
      link: paper.link ?? null,
      imageUrl: paper.imageUrl ?? null
    };
    this.backgroundPapers.set(id, backgroundPaper);
    return backgroundPaper;
  }

  async getBackgroundPapersByVirusCategory(virusCategoryId: number): Promise<BackgroundPaper[]> {
    return Array.from(this.backgroundPapers.values()).filter(
      paper => paper.virusCategoryId === virusCategoryId
    );
  }

  // Initialize sample data
  private initializeData() {
    // Add virus categories
    const coronaviridae = this.createVirusCategory({
      name: "Coronaviridae",
      description: "Family of enveloped, positive-sense, single-stranded RNA viruses.",
      imageUrl: "/assets/viruses/coronavirus.svg"
    });

    const filoviridae = this.createVirusCategory({
      name: "Filoviridae",
      description: "Family of filamentous, enveloped, negative-sense RNA viruses.",
      imageUrl: "/assets/viruses/filovirus.svg"
    });

    const paramyxoviridae = this.createVirusCategory({
      name: "Paramyxoviridae",
      description: "Family of negative-sense RNA viruses, including measles and mumps.",
      imageUrl: "/assets/viruses/paramyxovirus.svg"
    });

    const sedoreoviridae = this.createVirusCategory({
      name: "Sedoreoviridae",
      description: "Subfamily of viruses within the family Reoviridae.",
      imageUrl: "/assets/viruses/sedoreovirus.svg"
    });

    const rhabdoviridae = this.createVirusCategory({
      name: "Rhabdoviridae",
      description: "Family of negative-sense RNA viruses, including rabies virus.",
      imageUrl: "/assets/viruses/rhabdovirus.svg"
    });

    const otherUnknown = this.createVirusCategory({
      name: "Other/Unknown",
      description: "Additional viral families and unclassified viruses under investigation.",
      imageUrl: "/assets/viruses/unknown-virus.svg"
    });

    // Add team members
    this.createTeamMember({
      name: "Emily Gurley",
      title: "Professor of Epidemiology",
      institution: "Johns Hopkins University - Bloomberg School of Public Health",
      description: "Professor of Epidemiology specializing in zoonotic disease transmission and viral spillover events.",
      imageUrl: "/assets/team/emily-gurley.png",
      email: "egurley@jhu.edu",
      website: "https://www.jhsph.edu/faculty/directory/profile/emily-gurley",
      socialMedia: "https://www.linkedin.com/in/emily-gurley"
    });

    this.createTeamMember({
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
    this.createPublication({
      title: "Bat Coronaviruses in China",
      authors: "Li et al.",
      year: 2018,
      abstract: "Comprehensive study of SARSr-CoV prevalence and geographical distribution in Chinese bat populations, identifying novel coronaviruses with potential for human infection.",
      evidenceQuality: "high",
      evidenceType: "infection",
      virusCategoryId: 1, // Coronaviridae
      region: "Asia",
      publicationDate: "2018-03-15",
      link: "https://example.com/bat-coronaviruses-china"
    });

    this.createPublication({
      title: "Nipah Virus Emergence in Malaysia",
      authors: "Chua et al.",
      year: 2000,
      abstract: "Investigation of the 1998-1999 outbreak of encephalitis in humans and respiratory disease in pigs, identifying fruit bats as the natural reservoir of Nipah virus.",
      evidenceQuality: "medium",
      evidenceType: "spillover",
      virusCategoryId: 3, // Paramyxoviridae
      region: "Asia",
      publicationDate: "2000-09-26",
      link: "https://example.com/nipah-virus-emergence"
    });

    this.createPublication({
      title: "Ebola Virus Antibodies in Fruit Bats",
      authors: "Leroy et al.",
      year: 2005,
      abstract: "Detection of Ebola virus antibodies in fruit bats from Central Africa, suggesting these species may be reservoir hosts for Ebola virus.",
      evidenceQuality: "low",
      evidenceType: "infection",
      virusCategoryId: 2, // Filoviridae
      region: "Africa",
      publicationDate: "2005-12-01",
      link: "https://example.com/ebola-antibodies-bats"
    });

    this.createPublication({
      title: "MERS-CoV in Saudi Arabian Camels",
      authors: "Azhar et al.",
      year: 2014,
      abstract: "Isolation of MERS-CoV from a camel and its infected owner, providing evidence for camel-to-human transmission, with bats as the likely ancestral reservoir.",
      evidenceQuality: "high",
      evidenceType: "spillover",
      virusCategoryId: 1, // Coronaviridae
      region: "Middle East",
      publicationDate: "2014-06-05",
      link: "https://example.com/mers-cov-camels"
    });

    // Add background papers
    this.createBackgroundPaper({
      title: "Origin and evolution of pathogenic coronaviruses",
      virusCategoryId: 1, // Coronaviridae
      link: "https://example.com/coronavirus-evolution",
      imageUrl: "/assets/viruses/bat-hanging.png"
    });

    this.createBackgroundPaper({
      title: "Bat coronaviruses in China: A comprehensive review",
      virusCategoryId: 1, // Coronaviridae
      link: "https://example.com/bat-coronavirus-review",
      imageUrl: "/assets/viruses/bat-flying.png"
    });

    this.createBackgroundPaper({
      title: "SARS-CoV-2: Zoonotic origins and wildlife reservoirs",
      virusCategoryId: 1, // Coronaviridae
      link: "https://example.com/sars-cov-2-origins"
    });

    this.createBackgroundPaper({
      title: "Fruit bats as reservoirs of Ebola virus",
      virusCategoryId: 2, // Filoviridae
      link: "https://example.com/fruit-bats-ebola"
    });

    this.createBackgroundPaper({
      title: "Marburg virus ecology in African bat populations",
      virusCategoryId: 2, // Filoviridae
      link: "https://example.com/marburg-ecology"
    });

    this.createBackgroundPaper({
      title: "Molecular characterization of filoviruses in bats",
      virusCategoryId: 2, // Filoviridae
      link: "https://example.com/filovirus-characterization"
    });

    this.createBackgroundPaper({
      title: "Nipah virus: Transmission dynamics and epidemiology",
      virusCategoryId: 3, // Paramyxoviridae
      link: "https://example.com/nipah-transmission"
    });

    this.createBackgroundPaper({
      title: "Hendra virus: Bat-horse-human transmission pathways",
      virusCategoryId: 3, // Paramyxoviridae
      link: "https://example.com/hendra-pathways"
    });

    this.createBackgroundPaper({
      title: "Evolutionary dynamics of bat paramyxoviruses",
      virusCategoryId: 3, // Paramyxoviridae
      link: "https://example.com/paramyxovirus-evolution"
    });

    this.createBackgroundPaper({
      title: "Bat lyssaviruses: Antigenic and genetic diversity",
      virusCategoryId: 5, // Rhabdoviridae
      link: "https://example.com/bat-lyssaviruses"
    });

    this.createBackgroundPaper({
      title: "Global patterns of rabies virus persistence in bat reservoirs",
      virusCategoryId: 5, // Rhabdoviridae
      link: "https://example.com/rabies-persistence"
    });

    this.createBackgroundPaper({
      title: "Ecological factors influencing bat-associated rhabdoviruses",
      virusCategoryId: 5, // Rhabdoviridae
      link: "https://example.com/rhabdovirus-ecology"
    });
  }
}

import { PostgresStorage } from './pg-storage';

// Choose which storage implementation to use
export const storage = process.env.DATABASE_URL 
  ? new PostgresStorage() 
  : new MemStorage();
