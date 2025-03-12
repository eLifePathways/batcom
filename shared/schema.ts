import { pgTable, text, serial, integer, boolean, date, timestamp, index } from "drizzle-orm/pg-core";
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
  description: text("description"),
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

// Analytics tables
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  visitedAt: timestamp("visited_at").defaultNow().notNull(),
  sessionId: text("session_id").notNull(),
  referrer: text("referrer"),
  deviceType: text("device_type").notNull(), // 'desktop', 'mobile', 'tablet'
  country: text("country"),
  region: text("region"),
  bounced: boolean("bounced").default(true), // Initially true, updated if user views another page
  timeOnPage: integer("time_on_page"), // in seconds
  isExit: boolean("is_exit").default(true), // Initially true, updated if user views another page
  scrollDepth: integer("scroll_depth"), // percentage of page scrolled
}, (table) => {
  return {
    pathIdx: index("page_views_path_idx").on(table.path),
    sessionIdx: index("page_views_session_idx").on(table.sessionId),
    dateIdx: index("page_views_date_idx").on(table.visitedAt),
  }
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  deviceType: text("device_type").notNull(), // 'desktop', 'mobile', 'tablet'
  browser: text("browser"),
  os: text("os"),
  country: text("country"),
  region: text("region"),
  source: text("source"), // 'direct', 'organic', 'referral', 'social'
  sourceDetail: text("source_detail"), // specific source (e.g., 'google', 'twitter')
  totalPageViews: integer("total_page_views").default(1),
  duration: integer("duration"), // in seconds
  isNewVisitor: boolean("is_new_visitor").default(true),
  entryPage: text("entry_page").notNull(),
  exitPage: text("exit_page"),
}, (table) => {
  return {
    dateIdx: index("sessions_date_idx").on(table.startedAt),
    sourceIdx: index("sessions_source_idx").on(table.source),
  }
});

// Insert schemas for analytics
export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  visitedAt: true,
  bounced: true,
  isExit: true,
  timeOnPage: true,
  scrollDepth: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  startedAt: true,
  endedAt: true,
  totalPageViews: true,
  duration: true,
  exitPage: true,
});

// Analytics types
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type PageView = typeof pageViews.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
