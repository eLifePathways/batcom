import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { upload, handleUploadErrors, getUploadedFileUrl } from "./upload";
import { 
  getVisitorStats,
  getDeviceDistribution,
  getTrafficSources,
  getPopularPages
} from "./analytics-api";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route('/api');

  // Virus Categories endpoints
  app.get('/api/virus-categories', async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllVirusCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching virus categories:', error);
      res.status(500).json({ message: 'Failed to fetch virus categories' });
    }
  });

  app.get('/api/virus-categories/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid virus category ID' });
      }
      
      const category = await storage.getVirusCategory(id);
      if (!category) {
        return res.status(404).json({ message: 'Virus category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error fetching virus category:', error);
      res.status(500).json({ message: 'Failed to fetch virus category' });
    }
  });
  
  // Create virus category
  app.post('/api/virus-categories', async (req: Request, res: Response) => {
    try {
      const categoryData = req.body;
      const newCategory = await storage.createVirusCategory(categoryData);
      res.json(newCategory);
    } catch (error) {
      console.error('Error creating virus category:', error);
      res.status(500).json({ message: 'Failed to create virus category' });
    }
  });
  
  // Update virus category
  app.put('/api/virus-categories/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid virus category ID' });
      }
      
      const categoryData = req.body;
      const updatedCategory = await storage.updateVirusCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Virus category not found' });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating virus category:', error);
      res.status(500).json({ message: 'Failed to update virus category' });
    }
  });
  
  // Delete virus category
  app.delete('/api/virus-categories/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid virus category ID' });
      }
      
      const success = await storage.deleteVirusCategory(id);
      if (!success) {
        return res.status(404).json({ message: 'Virus category not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting virus category:', error);
      res.status(500).json({ message: 'Failed to delete virus category' });
    }
  });

  // Team Members endpoints
  app.get('/api/team-members', async (req: Request, res: Response) => {
    try {
      const members = await storage.getAllTeamMembers();
      res.json(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ message: 'Failed to fetch team members' });
    }
  });
  
  // Create team member
  app.post('/api/team-members', async (req: Request, res: Response) => {
    try {
      const memberData = req.body;
      const newMember = await storage.createTeamMember(memberData);
      res.json(newMember);
    } catch (error) {
      console.error('Error creating team member:', error);
      res.status(500).json({ message: 'Failed to create team member' });
    }
  });

  app.get('/api/team-members/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid team member ID' });
      }
      
      const member = await storage.getTeamMember(id);
      if (!member) {
        return res.status(404).json({ message: 'Team member not found' });
      }
      
      res.json(member);
    } catch (error) {
      console.error('Error fetching team member:', error);
      res.status(500).json({ message: 'Failed to fetch team member' });
    }
  });
  
  // Update team member
  app.put('/api/team-members/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid team member ID' });
      }
      
      const memberData = req.body;
      const updatedMember = await storage.updateTeamMember(id, memberData);
      if (!updatedMember) {
        return res.status(404).json({ message: 'Team member not found' });
      }
      
      res.json(updatedMember);
    } catch (error) {
      console.error('Error updating team member:', error);
      res.status(500).json({ message: 'Failed to update team member' });
    }
  });
  
  // Delete team member
  app.delete('/api/team-members/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid team member ID' });
      }
      
      const success = await storage.deleteTeamMember(id);
      if (!success) {
        return res.status(404).json({ message: 'Team member not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting team member:', error);
      res.status(500).json({ message: 'Failed to delete team member' });
    }
  });

  // Publications endpoints
  app.get('/api/publications', async (req: Request, res: Response) => {
    try {
      // Handle filter params
      const { virusCategoryId, evidenceQuality, evidenceType, year, yearStart, yearEnd, region, query } = req.query;
      
      let publications;
      
      if (virusCategoryId) {
        const id = parseInt(virusCategoryId as string);
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid virus category ID' });
        }
        publications = await storage.getPublicationsByVirusCategory(id);
      } else if (evidenceQuality) {
        publications = await storage.getPublicationsByEvidenceQuality(evidenceQuality as string);
      } else if (evidenceType) {
        publications = await storage.getPublicationsByEvidenceType(evidenceType as string);
      } else if (year) {
        const yearNum = parseInt(year as string);
        if (isNaN(yearNum)) {
          return res.status(400).json({ message: 'Invalid year' });
        }
        publications = await storage.getPublicationsByYear(yearNum);
      } else if (yearStart && yearEnd) {
        const start = parseInt(yearStart as string);
        const end = parseInt(yearEnd as string);
        if (isNaN(start) || isNaN(end)) {
          return res.status(400).json({ message: 'Invalid year range' });
        }
        publications = await storage.getPublicationsByYearRange(start, end);
      } else if (region) {
        publications = await storage.getPublicationsByRegion(region as string);
      } else if (query) {
        publications = await storage.searchPublications(query as string);
      } else {
        publications = await storage.getAllPublications();
      }
      
      res.json(publications);
    } catch (error) {
      console.error('Error fetching publications:', error);
      res.status(500).json({ message: 'Failed to fetch publications' });
    }
  });

  app.get('/api/publications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid publication ID' });
      }
      
      const publication = await storage.getPublication(id);
      if (!publication) {
        return res.status(404).json({ message: 'Publication not found' });
      }
      
      res.json(publication);
    } catch (error) {
      console.error('Error fetching publication:', error);
      res.status(500).json({ message: 'Failed to fetch publication' });
    }
  });
  
  // Create publication
  app.post('/api/publications', async (req: Request, res: Response) => {
    try {
      const publicationData = req.body;
      const newPublication = await storage.createPublication(publicationData);
      res.json(newPublication);
    } catch (error) {
      console.error('Error creating publication:', error);
      res.status(500).json({ message: 'Failed to create publication' });
    }
  });
  
  // Update publication
  app.put('/api/publications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid publication ID' });
      }
      
      const publicationData = req.body;
      const updatedPublication = await storage.updatePublication(id, publicationData);
      
      if (!updatedPublication) {
        return res.status(404).json({ message: 'Publication not found' });
      }
      
      res.json(updatedPublication);
    } catch (error) {
      console.error('Error updating publication:', error);
      res.status(500).json({ message: 'Failed to update publication' });
    }
  });
  
  // Delete publication
  app.delete('/api/publications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid publication ID' });
      }
      
      const success = await storage.deletePublication(id);
      if (!success) {
        return res.status(404).json({ message: 'Publication not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting publication:', error);
      res.status(500).json({ message: 'Failed to delete publication' });
    }
  });

  // Background papers endpoints
  app.get('/api/background-papers', async (req: Request, res: Response) => {
    try {
      const { virusCategoryId } = req.query;
      
      let papers;
      
      if (virusCategoryId) {
        const id = parseInt(virusCategoryId as string);
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid virus category ID' });
        }
        papers = await storage.getBackgroundPapersByVirusCategory(id);
      } else {
        papers = await storage.getAllBackgroundPapers();
      }
      
      res.json(papers);
    } catch (error) {
      console.error('Error fetching background papers:', error);
      res.status(500).json({ message: 'Failed to fetch background papers' });
    }
  });

  app.get('/api/background-papers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid background paper ID' });
      }
      
      const paper = await storage.getBackgroundPaper(id);
      if (!paper) {
        return res.status(404).json({ message: 'Background paper not found' });
      }
      
      res.json(paper);
    } catch (error) {
      console.error('Error fetching background paper:', error);
      res.status(500).json({ message: 'Failed to fetch background paper' });
    }
  });
  
  // Create background paper
  app.post('/api/background-papers', async (req: Request, res: Response) => {
    try {
      const paperData = req.body;
      const newPaper = await storage.createBackgroundPaper(paperData);
      res.json(newPaper);
    } catch (error) {
      console.error('Error creating background paper:', error);
      res.status(500).json({ message: 'Failed to create background paper' });
    }
  });
  
  // Update background paper
  app.put('/api/background-papers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid background paper ID' });
      }
      
      const paperData = req.body;
      console.log('Updating background paper ID:', id);
      console.log('Request body:', JSON.stringify(paperData, null, 2));
      console.log('Description field:', paperData.description);
      
      // Ensure description is properly set
      if (paperData.description === '') {
        paperData.description = null;
      }
      
      const updatedPaper = await storage.updateBackgroundPaper(id, paperData);
      console.log('Updated paper result:', JSON.stringify(updatedPaper, null, 2));
      
      if (!updatedPaper) {
        return res.status(404).json({ message: 'Background paper not found' });
      }
      
      res.json(updatedPaper);
    } catch (error) {
      console.error('Error updating background paper:', error);
      res.status(500).json({ message: 'Failed to update background paper' });
    }
  });
  
  // Delete background paper
  app.delete('/api/background-papers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid background paper ID' });
      }
      
      const success = await storage.deleteBackgroundPaper(id);
      if (!success) {
        return res.status(404).json({ message: 'Background paper not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting background paper:', error);
      res.status(500).json({ message: 'Failed to delete background paper' });
    }
  });

  // File upload endpoint
  app.post('/api/upload', upload.single('image'), handleUploadErrors, (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: true, message: 'No file uploaded' });
      }
      
      // Get the file URL path that can be used on the frontend
      const fileUrl = getUploadedFileUrl(req.file.filename);
      
      // Return the file URL to the client
      res.json({
        success: true,
        fileUrl: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (error) {
      console.error('Error handling file upload:', error);
      res.status(500).json({ error: true, message: 'Server error during file upload' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/visitors', getVisitorStats);
  app.get('/api/analytics/devices', getDeviceDistribution);
  app.get('/api/analytics/sources', getTrafficSources);
  app.get('/api/analytics/popular-pages', getPopularPages);

  // User management endpoints
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const userValidation = insertUserSchema.safeParse(req.body);
      if (!userValidation.success) {
        return res.status(400).json({ 
          message: 'Invalid user data',
          errors: userValidation.error.errors 
        });
      }

      const userData = userValidation.data;
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const userData = req.body;
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Issue CRUD routes
  app.get('/api/issues', async (req: Request, res: Response) => {
    try {
      const issues = await storage.getAllIssues();
      res.status(200).json(issues);
    } catch (error) {
      console.error('Error getting issues:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/issues/:id', async (req: Request, res: Response) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: 'Invalid issue ID' });
      }
      
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      
      res.status(200).json(issue);
    } catch (error) {
      console.error('Error getting issue:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/issues', async (req: Request, res: Response) => {
    try {
      const issueData = req.body;
      
      console.log("Creating issue with data:", JSON.stringify(issueData, null, 2));
      
      const newIssue = await storage.createIssue({
        title: issueData.title,
        description: issueData.description,
        pageUrl: issueData.pageUrl || issueData.url,
        screenshotUrl: issueData.screenshotUrl || null,
        consoleLog: issueData.consoleLog || null,
        browserInfo: issueData.userAgent,
      });
      
      res.status(201).json(newIssue);
    } catch (error) {
      console.error('Error creating issue:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.put('/api/issues/:id', async (req: Request, res: Response) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: 'Invalid issue ID' });
      }
      
      const updateData = req.body;
      const updatedIssue = await storage.updateIssue(issueId, updateData);
      
      if (!updatedIssue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      
      res.status(200).json(updatedIssue);
    } catch (error) {
      console.error('Error updating issue:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.delete('/api/issues/:id', async (req: Request, res: Response) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: 'Invalid issue ID' });
      }
      
      const success = await storage.deleteIssue(issueId);
      if (!success) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting issue:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Issue comments routes
  app.get('/api/issues/:issueId/comments', async (req: Request, res: Response) => {
    try {
      const issueId = parseInt(req.params.issueId);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: 'Invalid issue ID' });
      }
      
      const comments = await storage.getIssueComments(issueId);
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error getting issue comments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/issues/:issueId/comments', async (req: Request, res: Response) => {
    try {
      const issueId = parseInt(req.params.issueId);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: 'Invalid issue ID' });
      }
      
      console.log('Received comment data:', req.body);
      const { comment, content, isInternal } = req.body;
      const commentText = comment || content;
      
      if (!commentText) {
        return res.status(400).json({ message: 'Comment content is required' });
      }
      
      // Make sure the issue exists
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      
      const newComment = await storage.createIssueComment({
        issueId,
        content: commentText,
        author: 'Admin',
        isInternal: isInternal || false,
      });
      
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error creating issue comment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.put('/api/issues/comments/:id', async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: 'Invalid comment ID' });
      }
      
      const updateData = req.body;
      const updatedComment = await storage.updateIssueComment(commentId, updateData);
      
      if (!updatedComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      res.status(200).json(updatedComment);
    } catch (error) {
      console.error('Error updating issue comment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.delete('/api/issues/comments/:id', async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: 'Invalid comment ID' });
      }
      
      const success = await storage.deleteIssueComment(commentId);
      if (!success) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting issue comment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // What We Do Sections API
  app.get('/api/what-we-do/sections', async (req: Request, res: Response) => {
    try {
      const sections = await storage.getAllWhatWeDoSections();
      res.json(sections);
    } catch (error) {
      console.error('Error fetching what we do sections:', error);
      res.status(500).json({ message: 'Failed to fetch what we do sections' });
    }
  });
  
  app.get('/api/what-we-do/sections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }
      
      const section = await storage.getWhatWeDoSection(id);
      
      if (!section) {
        return res.status(404).json({ message: 'Section not found' });
      }
      
      res.json(section);
    } catch (error) {
      console.error('Error fetching what we do section:', error);
      res.status(500).json({ message: 'Failed to fetch what we do section' });
    }
  });
  
  app.get('/api/what-we-do/sections/slug/:slug', async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      
      if (!slug) {
        return res.status(400).json({ message: 'Slug is required' });
      }
      
      const section = await storage.getWhatWeDoSectionBySlug(slug);
      
      if (!section) {
        return res.status(404).json({ message: 'Section not found' });
      }
      
      res.json(section);
    } catch (error) {
      console.error('Error fetching what we do section by slug:', error);
      res.status(500).json({ message: 'Failed to fetch what we do section' });
    }
  });
  
  app.post('/api/what-we-do/sections', async (req: Request, res: Response) => {
    try {
      console.log('Creating what-we-do section with data:', req.body);
      
      // Validate required fields
      if (!req.body.title || !req.body.slug) {
        return res.status(400).json({ 
          message: 'Title and slug are required fields',
          receivedData: req.body
        });
      }
      
      // Ensure proper types and required fields
      const sectionData = {
        title: String(req.body.title).trim(),
        slug: String(req.body.slug).trim(),
        subtitle: req.body.subtitle || null,
        description: req.body.description || null,
        imageUrl: req.body.imageUrl || null,
        sortOrder: parseInt(req.body.sortOrder) || 0
      };
      
      const section = await storage.createWhatWeDoSection(sectionData);
      console.log('Successfully created section:', section);
      res.status(201).json(section);
    } catch (error) {
      console.error('Error creating what we do section:', error);
      res.status(500).json({ 
        message: 'Failed to create what we do section',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.put('/api/what-we-do/sections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }
      
      const updatedSection = await storage.updateWhatWeDoSection(id, req.body);
      
      if (!updatedSection) {
        return res.status(404).json({ message: 'Section not found' });
      }
      
      res.json(updatedSection);
    } catch (error) {
      console.error('Error updating what we do section:', error);
      res.status(500).json({ message: 'Failed to update what we do section' });
    }
  });
  
  app.delete('/api/what-we-do/sections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }
      
      const deleted = await storage.deleteWhatWeDoSection(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Section not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting what we do section:', error);
      res.status(500).json({ message: 'Failed to delete what we do section' });
    }
  });
  
  // What We Do Content API
  app.get('/api/what-we-do/content/section/:sectionId', async (req: Request, res: Response) => {
    try {
      const sectionId = parseInt(req.params.sectionId);
      
      if (isNaN(sectionId)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }
      
      const content = await storage.getWhatWeDoContentBySection(sectionId);
      res.json(content);
    } catch (error) {
      console.error('Error fetching what we do content:', error);
      res.status(500).json({ message: 'Failed to fetch what we do content' });
    }
  });
  
  app.get('/api/what-we-do/content/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid content ID' });
      }
      
      const content = await storage.getWhatWeDoContent(id);
      
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      res.json(content);
    } catch (error) {
      console.error('Error fetching what we do content:', error);
      res.status(500).json({ message: 'Failed to fetch what we do content' });
    }
  });
  
  app.post('/api/what-we-do/content', async (req: Request, res: Response) => {
    try {
      const content = await storage.createWhatWeDoContent(req.body);
      res.status(201).json(content);
    } catch (error) {
      console.error('Error creating what we do content:', error);
      res.status(500).json({ message: 'Failed to create what we do content' });
    }
  });
  
  app.put('/api/what-we-do/content/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid content ID' });
      }
      
      const updatedContent = await storage.updateWhatWeDoContent(id, req.body);
      
      if (!updatedContent) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      res.json(updatedContent);
    } catch (error) {
      console.error('Error updating what we do content:', error);
      res.status(500).json({ message: 'Failed to update what we do content' });
    }
  });
  
  app.delete('/api/what-we-do/content/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid content ID' });
      }
      
      const deleted = await storage.deleteWhatWeDoContent(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting what we do content:', error);
      res.status(500).json({ message: 'Failed to delete what we do content' });
    }
  });
  
  app.post('/api/what-we-do/content/reorder', async (req: Request, res: Response) => {
    try {
      const { sectionId, contentIds } = req.body;
      
      if (!sectionId || !contentIds || !Array.isArray(contentIds)) {
        return res.status(400).json({ message: 'Invalid request parameters' });
      }
      
      const reorderedContent = await storage.reorderWhatWeDoContent(sectionId, contentIds);
      res.json(reorderedContent);
    } catch (error) {
      console.error('Error reordering what we do content:', error);
      res.status(500).json({ message: 'Failed to reorder what we do content' });
    }
  });

  // GraphQL API proxy endpoint to avoid CORS issues
  app.post('/api/graphql-proxy', async (req: Request, res: Response) => {
    try {
      const { endpoint, query, variables, apiKey, groupId, headers = {} } = req.body;
      
      if (!endpoint || !query) {
        return res.status(400).json({ 
          error: 'Missing required parameters', 
          message: 'Both endpoint and query are required' 
        });
      }

      // Validate endpoint is a URL
      try {
        new URL(endpoint);
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid endpoint URL', 
          message: 'The endpoint must be a valid URL' 
        });
      }

      // Import node-fetch dynamically
      const fetch = (await import('node-fetch')).default;

      // Set up request headers with proper authentication
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers
      };

      // Add API key to headers if provided
      if (apiKey) {
        requestHeaders['Authorization'] = `Bearer ${apiKey}`;
      }
      
      // Add Group ID to headers if provided
      if (groupId) {
        requestHeaders['X-Group-ID'] = groupId;
      }

      // Make request to GraphQL endpoint
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          query,
          variables: variables || {}
        })
      });

      // Get response as JSON
      const data = await response.json();
      
      // Return the response
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Error proxying GraphQL request:", error);
      res.status(500).json({ 
        error: "Failed to proxy GraphQL request", 
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
