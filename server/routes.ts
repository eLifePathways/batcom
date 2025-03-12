import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { upload, handleUploadErrors, getUploadedFileUrl } from "./upload";

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

  const httpServer = createServer(app);
  return httpServer;
}
