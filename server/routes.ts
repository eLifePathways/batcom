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

  const httpServer = createServer(app);
  return httpServer;
}
