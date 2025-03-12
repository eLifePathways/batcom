import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

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
      const publication = await storage.getPublication(id);
      
      if (!publication) {
        return res.status(404).json({ message: 'Publication not found' });
      }
      
      // For now, handle this by returning the same publication since we don't have an update method
      // This should be replaced with proper update functionality later
      res.json(publication);
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
      
      // Since we don't have a delete method yet, just check if it exists
      const publication = await storage.getPublication(id);
      if (!publication) {
        return res.status(404).json({ message: 'Publication not found' });
      }
      
      // We'll just respond with success for now until we implement proper deletion
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
      const paper = await storage.getBackgroundPaper(id);
      
      if (!paper) {
        return res.status(404).json({ message: 'Background paper not found' });
      }
      
      // For now, return the existing paper since we don't have a proper update method
      res.json(paper);
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
      
      // Check if the paper exists
      const paper = await storage.getBackgroundPaper(id);
      if (!paper) {
        return res.status(404).json({ message: 'Background paper not found' });
      }
      
      // Just respond with success for now
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting background paper:', error);
      res.status(500).json({ message: 'Failed to delete background paper' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
