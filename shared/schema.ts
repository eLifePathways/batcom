import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const virusCategories = pgTable("virus_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  institution: text("institution").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  email: text("email"),
  website: text("website"),
  socialMedia: text("social_media"),
});

export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  year: integer("year").notNull(),
  abstract: text("abstract").notNull(),
  evidenceQuality: text("evidence_quality").notNull(), // 'high', 'medium', 'low'
  evidenceType: text("evidence_type").notNull(), // 'infection', 'spillover'
  virusCategoryId: integer("virus_category_id").notNull(),
  region: text("region").notNull(),
  publicationDate: date("publication_date").notNull(),
  link: text("link"),
});

export const backgroundPapers = pgTable("background_papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  virusCategoryId: integer("virus_category_id").notNull(),
  link: text("link"),
  imageUrl: text("image_url"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Insert schemas
export const insertVirusCategorySchema = createInsertSchema(virusCategories).omit({
  id: true
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true
});

export const insertPublicationSchema = createInsertSchema(publications).omit({
  id: true
});

export const insertBackgroundPaperSchema = createInsertSchema(backgroundPapers).omit({
  id: true
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertVirusCategory = z.infer<typeof insertVirusCategorySchema>;
export type VirusCategory = typeof virusCategories.$inferSelect;

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertPublication = z.infer<typeof insertPublicationSchema>;
export type Publication = typeof publications.$inferSelect;

export type InsertBackgroundPaper = z.infer<typeof insertBackgroundPaperSchema>;
export type BackgroundPaper = typeof backgroundPapers.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
