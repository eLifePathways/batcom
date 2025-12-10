import type { Express, Request, Response, NextFunction } from 'express'
import { createServer, type Server } from 'http'
import { storage } from './storage'
import { z } from 'zod'
import { upload, handleUploadErrors, getUploadedFileUrl } from './upload'
import {
  getVisitorStats,
  getDeviceDistribution,
  getTrafficSources,
  getPopularPages,
  resetAnalytics,
} from './analytics-api'
import {
  InsertPublication,
  insertUserSchema,
  KotahiPublishedManuscript,
  KotahiReviewField,
  KotahiSettingsFormData,
} from '@shared/schema'
import {
  comparePassword,
  generateToken,
  hashPassword,
  stripUserPassword,
} from './auth'
import { requireAuth } from './middleware'
import { MANUSCRIPTS_PUBLISHED_SINCE_DATE } from '@shared/queries'
import {
  getValueFromReviewField,
  getYearFromInput,
  isKotahiSettingsFormData,
} from '../shared/utils'
import {
  EvidenceInfection,
  EvidenceSpillover,
  Region,
  REVIEW_EVIDENCE_INFECTION_FIELD,
  REVIEW_EVIDENCE_SPILLOVER_FIELD,
  REVIEW_GEOGRAPHIC_REGION_FIELD,
} from '../shared/constants'

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route('/api')

  // Virus Categories endpoints
  app.get('/api/virus-categories', async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllVirusCategories()
      res.json(categories)
    } catch (error) {
      console.error('Error fetching virus categories:', error)
      res.status(500).json({ message: 'Failed to fetch virus categories' })
    }
  })

  app.get('/api/virus-categories/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid virus category ID' })
      }

      const category = await storage.getVirusCategory(id)
      if (!category) {
        return res.status(404).json({ message: 'Virus category not found' })
      }

      res.json(category)
    } catch (error) {
      console.error('Error fetching virus category:', error)
      res.status(500).json({ message: 'Failed to fetch virus category' })
    }
  })

  // Create virus category
  app.post(
    '/api/virus-categories',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const categoryData = req.body
        const newCategory = await storage.createVirusCategory(categoryData)
        res.json(newCategory)
      } catch (error) {
        console.error('Error creating virus category:', error)
        res.status(500).json({ message: 'Failed to create virus category' })
      }
    },
  )

  // Update virus category
  app.put(
    '/api/virus-categories/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid virus category ID' })
        }

        const categoryData = req.body
        const updatedCategory = await storage.updateVirusCategory(
          id,
          categoryData,
        )

        if (!updatedCategory) {
          return res.status(404).json({ message: 'Virus category not found' })
        }

        res.json(updatedCategory)
      } catch (error) {
        console.error('Error updating virus category:', error)
        res.status(500).json({ message: 'Failed to update virus category' })
      }
    },
  )

  // Delete virus category
  app.delete(
    '/api/virus-categories/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid virus category ID' })
        }

        const success = await storage.deleteVirusCategory(id)
        if (!success) {
          return res.status(404).json({ message: 'Virus category not found' })
        }

        res.status(204).end()
      } catch (error) {
        console.error('Error deleting virus category:', error)
        res.status(500).json({ message: 'Failed to delete virus category' })
      }
    },
  )

  // Team Members endpoints
  app.get('/api/team-members', async (req: Request, res: Response) => {
    try {
      const members = await storage.getAllTeamMembers()
      res.json(members)
    } catch (error) {
      console.error('Error fetching team members:', error)
      res.status(500).json({ message: 'Failed to fetch team members' })
    }
  })

  // Create team member
  app.post(
    '/api/team-members',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const memberData = req.body
        const newMember = await storage.createTeamMember(memberData)
        res.json(newMember)
      } catch (error) {
        console.error('Error creating team member:', error)
        res.status(500).json({ message: 'Failed to create team member' })
      }
    },
  )

  app.get('/api/team-members/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid team member ID' })
      }

      const member = await storage.getTeamMember(id)
      if (!member) {
        return res.status(404).json({ message: 'Team member not found' })
      }

      res.json(member)
    } catch (error) {
      console.error('Error fetching team member:', error)
      res.status(500).json({ message: 'Failed to fetch team member' })
    }
  })

  // Update team member
  app.put(
    '/api/team-members/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid team member ID' })
        }

        const memberData = req.body
        const updatedMember = await storage.updateTeamMember(id, memberData)
        if (!updatedMember) {
          return res.status(404).json({ message: 'Team member not found' })
        }

        res.json(updatedMember)
      } catch (error) {
        console.error('Error updating team member:', error)
        res.status(500).json({ message: 'Failed to update team member' })
      }
    },
  )

  // Delete team member
  app.delete(
    '/api/team-members/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid team member ID' })
        }

        const success = await storage.deleteTeamMember(id)
        if (!success) {
          return res.status(404).json({ message: 'Team member not found' })
        }

        res.status(204).end()
      } catch (error) {
        console.error('Error deleting team member:', error)
        res.status(500).json({ message: 'Failed to delete team member' })
      }
    },
  )

  // Reorder team members
  app.post(
    '/api/team-members/reorder',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { memberIds } = req.body

        console.log('Received memberIds for reordering:', memberIds)

        if (!memberIds || !Array.isArray(memberIds)) {
          console.log('Invalid memberIds:', memberIds)
          return res.status(400).json({ message: 'Invalid request parameters' })
        }

        const reorderedMembers = await storage.reorderTeamMembers(memberIds)
        console.log('Successfully reordered members:', reorderedMembers.length)
        res.json(reorderedMembers)
      } catch (error) {
        console.error('Error reordering team members:', error)
        res.status(500).json({ message: 'Failed to reorder team members' })
      }
    },
  )

  // Publications endpoints
  app.get('/api/publications', async (req: Request, res: Response) => {
    try {
      // Handle filter params
      const {
        virusCategories,
        evidenceInfections,
        evidenceSpillovers,
        yearRanges,
        regions,
        searchQuery,
      }: {
        virusCategories?: string
        evidenceInfections?: string
        evidenceSpillovers?: string
        yearRanges?: string
        regions?: string
        searchQuery?: string
      } = req.query

      const parsedVirusCategoryIds = virusCategories
        ?.split(',')
        .map(x => parseInt(x, 10))
      const parsedEvidenceInfections = evidenceInfections?.split(',') as
        | EvidenceInfection[]
        | undefined
      const parsedEvidenceSpillovers = evidenceSpillovers?.split(',') as
        | EvidenceSpillover[]
        | undefined
      const parsedRegions = regions?.split(',') as Region[]

      const filteredPublications = await storage.getFilteredPublications(
        parsedVirusCategoryIds,
        parsedEvidenceInfections,
        parsedEvidenceSpillovers,
        yearRanges,
        parsedRegions,
        searchQuery,
      )

      res.json(filteredPublications)
    } catch (error) {
      console.error('Error fetching publications:', error)
      res.status(500).json({ message: 'Failed to fetch publications' })
    }
  })

  app.get('/api/publications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid publication ID' })
      }

      const publication = await storage.getPublication(id)
      if (!publication) {
        return res.status(404).json({ message: 'Publication not found' })
      }

      res.json(publication)
    } catch (error) {
      console.error('Error fetching publication:', error)
      res.status(500).json({ message: 'Failed to fetch publication' })
    }
  })

  app.get('/api/publication/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      console.log('fetching pub', id)
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid publication ID' })
      }

      const publication = await storage.getPublication(id)
      if (!publication) {
        return res.status(404).json({ message: 'Publication not found' })
      }

      const reviews = await storage.getReviewsForPublication(id)

      res.json({ publication, reviews })
    } catch (error) {
      console.error('Error fetching publication:', error)
      res.status(500).json({ message: 'Failed to fetch publication' })
    }
  })

  // Create publication
  app.post(
    '/api/publications',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const publicationData: InsertPublication = req.body
        const newPublication = await storage.createPublication(publicationData)
        res.json(newPublication)
      } catch (error) {
        console.error('Error creating publication:', error)
        res.status(500).json({ message: 'Failed to create publication' })
      }
    },
  )

  // Update publication
  app.put(
    '/api/publications/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid publication ID' })
        }

        const publicationData = req.body
        const updatedPublication = await storage.updatePublication(
          id,
          publicationData,
        )

        if (!updatedPublication) {
          return res.status(404).json({ message: 'Publication not found' })
        }

        res.json(updatedPublication)
      } catch (error) {
        console.error('Error updating publication:', error)
        res.status(500).json({ message: 'Failed to update publication' })
      }
    },
  )

  // Delete publication
  app.delete(
    '/api/publications/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid publication ID' })
        }

        const success = await storage.deletePublication(id)
        if (!success) {
          return res.status(404).json({ message: 'Publication not found' })
        }

        res.status(204).end()
      } catch (error) {
        console.error('Error deleting publication:', error)
        res.status(500).json({ message: 'Failed to delete publication' })
      }
    },
  )

  // Background papers endpoints
  app.get('/api/background-papers', async (req: Request, res: Response) => {
    try {
      const { virusCategoryId } = req.query

      let papers

      if (virusCategoryId) {
        const id = parseInt(virusCategoryId as string)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid virus category ID' })
        }
        papers = await storage.getBackgroundPapersByVirusCategory(id)
      } else {
        papers = await storage.getAllBackgroundPapers()
      }

      res.json(papers)
    } catch (error) {
      console.error('Error fetching background papers:', error)
      res.status(500).json({ message: 'Failed to fetch background papers' })
    }
  })

  app.get('/api/background-papers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid background paper ID' })
      }

      const paper = await storage.getBackgroundPaper(id)
      if (!paper) {
        return res.status(404).json({ message: 'Background paper not found' })
      }

      res.json(paper)
    } catch (error) {
      console.error('Error fetching background paper:', error)
      res.status(500).json({ message: 'Failed to fetch background paper' })
    }
  })

  // Create background paper
  app.post(
    '/api/background-papers',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const paperData = req.body
        const newPaper = await storage.createBackgroundPaper(paperData)
        res.json(newPaper)
      } catch (error) {
        console.error('Error creating background paper:', error)
        res.status(500).json({ message: 'Failed to create background paper' })
      }
    },
  )

  // Update background paper
  app.put(
    '/api/background-papers/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res
            .status(400)
            .json({ message: 'Invalid background paper ID' })
        }

        const paperData = req.body
        console.log('Updating background paper ID:', id)
        console.log('Request body:', JSON.stringify(paperData, null, 2))
        console.log('Description field:', paperData.description)

        // Ensure description is properly set
        if (paperData.description === '') {
          paperData.description = null
        }

        const updatedPaper = await storage.updateBackgroundPaper(id, paperData)
        console.log(
          'Updated paper result:',
          JSON.stringify(updatedPaper, null, 2),
        )

        if (!updatedPaper) {
          return res.status(404).json({ message: 'Background paper not found' })
        }

        res.json(updatedPaper)
      } catch (error) {
        console.error('Error updating background paper:', error)
        res.status(500).json({ message: 'Failed to update background paper' })
      }
    },
  )

  // Delete background paper
  app.delete(
    '/api/background-papers/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res
            .status(400)
            .json({ message: 'Invalid background paper ID' })
        }

        const success = await storage.deleteBackgroundPaper(id)
        if (!success) {
          return res.status(404).json({ message: 'Background paper not found' })
        }

        res.status(204).end()
      } catch (error) {
        console.error('Error deleting background paper:', error)
        res.status(500).json({ message: 'Failed to delete background paper' })
      }
    },
  )

  // File upload endpoint
  app.post(
    '/api/upload',
    upload.single('image'),
    handleUploadErrors,
    (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ error: true, message: 'No file uploaded' })
        }

        // Get the file URL path that can be used on the frontend
        const fileUrl = getUploadedFileUrl(req.file.filename)

        // Return the file URL to the client
        res.json({
          success: true,
          fileUrl: fileUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        })
      } catch (error) {
        console.error('Error handling file upload:', error)
        res
          .status(500)
          .json({ error: true, message: 'Server error during file upload' })
      }
    },
  )

  // Analytics endpoints
  app.get('/api/analytics/visitors', requireAuth, getVisitorStats)
  app.get('/api/analytics/devices', requireAuth, getDeviceDistribution)
  app.get('/api/analytics/sources', requireAuth, getTrafficSources)
  app.get('/api/analytics/popular-pages', requireAuth, getPopularPages)
  app.post('/api/analytics/reset', requireAuth, resetAnalytics)

  // Admin auth
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const userValidation = insertUserSchema.safeParse(req.body)

      if (!userValidation.success) {
        return res.status(400).json({
          message: 'Invalid user data',
          errors: userValidation.error.errors,
        })
      }

      const { username, password } = userValidation.data
      const user = await storage.getUserByUsername(username)

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' })
      }

      const valid = await comparePassword(password, user.password)
      if (!valid)
        return res.status(401).json({ error: 'Invalid username or password' })

      const token = generateToken(user.id)
      res.json({ token, user: stripUserPassword(user) })
    } catch (error) {
      console.error('Error logging in:', error)
      res.status(500).json({ message: 'Failed to log in' })
    }
  })

  // User management endpoints
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await (
        await storage.getAllUsers()
      ).map(u => stripUserPassword(u))
      res.json(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json({ message: 'Failed to fetch users' })
    }
  })

  app.get(
    '/api/users/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid user ID' })
        }

        const user = await storage.getUser(id)
        if (!user) {
          return res.status(404).json({ message: 'User not found' })
        }

        res.json(stripUserPassword(user))
      } catch (error) {
        console.error('Error fetching user:', error)
        res.status(500).json({ message: 'Failed to fetch user' })
      }
    },
  )

  app.post('/api/users', requireAuth, async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const userValidation = insertUserSchema.safeParse(req.body)
      if (!userValidation.success) {
        return res.status(400).json({
          message: 'Invalid user data',
          errors: userValidation.error.errors,
        })
      }

      const { username, password } = userValidation.data
      const existingUser = await storage.getUserByUsername(username)

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' })
      }

      const hashedPassword = await hashPassword(password)
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
      })
      res.status(201).json(stripUserPassword(newUser))
    } catch (error) {
      console.error('Error creating user:', error)
      res.status(500).json({ message: 'Failed to create user' })
    }
  })

  app.put(
    '/api/users/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid user ID' })
        }

        const userValidation = insertUserSchema.safeParse(req.body)
        if (!userValidation.success) {
          return res.status(400).json({
            message: 'Invalid user data',
            errors: userValidation.error.errors,
          })
        }

        const { username, password } = userValidation.data
        const hashedPassword = await hashPassword(password)
        const updatedUser = await storage.updateUser(id, {
          username,
          password: hashedPassword,
        })

        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' })
        }

        res.json(stripUserPassword(updatedUser))
      } catch (error) {
        console.error('Error updating user:', error)
        res.status(500).json({ message: 'Failed to update user' })
      }
    },
  )

  app.delete(
    '/api/users/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid user ID' })
        }

        const success = await storage.deleteUser(id)
        if (!success) {
          return res.status(404).json({ message: 'User not found' })
        }

        res.status(204).end()
      } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).json({ message: 'Failed to delete user' })
      }
    },
  )

  // Issue CRUD routes
  app.get('/api/issues', async (req: Request, res: Response) => {
    try {
      const issues = await storage.getAllIssues()
      res.status(200).json(issues)
    } catch (error) {
      console.error('Error getting issues:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  })

  app.get('/api/issues/:id', async (req: Request, res: Response) => {
    try {
      const issueId = parseInt(req.params.id)
      if (isNaN(issueId)) {
        return res.status(400).json({ message: 'Invalid issue ID' })
      }

      const issue = await storage.getIssue(issueId)
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' })
      }

      res.status(200).json(issue)
    } catch (error) {
      console.error('Error getting issue:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  })

  app.post('/api/issues', async (req: Request, res: Response) => {
    try {
      const issueData = req.body

      console.log(
        'Creating issue with data:',
        JSON.stringify(issueData, null, 2),
      )

      const newIssue = await storage.createIssue({
        title: issueData.title,
        description: issueData.description,
        pageUrl: issueData.pageUrl || issueData.url,
        screenshotUrl: issueData.screenshotUrl || null,
        consoleLog: issueData.consoleLog || null,
        browserInfo: issueData.userAgent,
      })

      res.status(201).json(newIssue)
    } catch (error) {
      console.error('Error creating issue:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  })

  app.put(
    '/api/issues/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const issueId = parseInt(req.params.id)
        if (isNaN(issueId)) {
          return res.status(400).json({ message: 'Invalid issue ID' })
        }

        const updateData = req.body
        const updatedIssue = await storage.updateIssue(issueId, updateData)

        if (!updatedIssue) {
          return res.status(404).json({ message: 'Issue not found' })
        }

        res.status(200).json(updatedIssue)
      } catch (error) {
        console.error('Error updating issue:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
    },
  )

  app.delete(
    '/api/issues/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const issueId = parseInt(req.params.id)
        if (isNaN(issueId)) {
          return res.status(400).json({ message: 'Invalid issue ID' })
        }

        const success = await storage.deleteIssue(issueId)
        if (!success) {
          return res.status(404).json({ message: 'Issue not found' })
        }

        res.status(204).end()
      } catch (error) {
        console.error('Error deleting issue:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
    },
  )

  // Issue comments routes
  app.get(
    '/api/issues/:issueId/comments',
    async (req: Request, res: Response) => {
      try {
        const issueId = parseInt(req.params.issueId)
        if (isNaN(issueId)) {
          return res.status(400).json({ message: 'Invalid issue ID' })
        }

        const comments = await storage.getIssueComments(issueId)
        res.status(200).json(comments)
      } catch (error) {
        console.error('Error getting issue comments:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
    },
  )

  app.post(
    '/api/issues/:issueId/comments',
    async (req: Request, res: Response) => {
      try {
        const issueId = parseInt(req.params.issueId)
        if (isNaN(issueId)) {
          return res.status(400).json({ message: 'Invalid issue ID' })
        }

        console.log('Received comment data:', req.body)
        const { comment, content, isInternal } = req.body
        const commentText = comment || content

        if (!commentText) {
          return res
            .status(400)
            .json({ message: 'Comment content is required' })
        }

        // Make sure the issue exists
        const issue = await storage.getIssue(issueId)
        if (!issue) {
          return res.status(404).json({ message: 'Issue not found' })
        }

        const newComment = await storage.createIssueComment({
          issueId,
          content: commentText,
          author: 'Admin',
          isInternal: isInternal || false,
        })

        res.status(201).json(newComment)
      } catch (error) {
        console.error('Error creating issue comment:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
    },
  )

  app.put('/api/issues/comments/:id', async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.id)
      if (isNaN(commentId)) {
        return res.status(400).json({ message: 'Invalid comment ID' })
      }

      const updateData = req.body
      const updatedComment = await storage.updateIssueComment(
        commentId,
        updateData,
      )

      if (!updatedComment) {
        return res.status(404).json({ message: 'Comment not found' })
      }

      res.status(200).json(updatedComment)
    } catch (error) {
      console.error('Error updating issue comment:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  })

  app.delete(
    '/api/issues/comments/:id',
    async (req: Request, res: Response) => {
      try {
        const commentId = parseInt(req.params.id)
        if (isNaN(commentId)) {
          return res.status(400).json({ message: 'Invalid comment ID' })
        }

        const success = await storage.deleteIssueComment(commentId)
        if (!success) {
          return res.status(404).json({ message: 'Comment not found' })
        }

        res.status(204).end()
      } catch (error) {
        console.error('Error deleting issue comment:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
    },
  )

  // What We Do Sections API
  app.get('/api/what-we-do/sections', async (req: Request, res: Response) => {
    try {
      const sections = await storage.getAllWhatWeDoSections()
      res.json(sections)
    } catch (error) {
      console.error('Error fetching what we do sections:', error)
      res.status(500).json({ message: 'Failed to fetch what we do sections' })
    }
  })

  app.get(
    '/api/what-we-do/sections/:id',
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)

        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid section ID' })
        }

        const section = await storage.getWhatWeDoSection(id)

        if (!section) {
          return res.status(404).json({ message: 'Section not found' })
        }

        res.json(section)
      } catch (error) {
        console.error('Error fetching what we do section:', error)
        res.status(500).json({ message: 'Failed to fetch what we do section' })
      }
    },
  )

  app.get(
    '/api/what-we-do/sections/slug/:slug',
    async (req: Request, res: Response) => {
      try {
        const slug = req.params.slug

        if (!slug) {
          return res.status(400).json({ message: 'Slug is required' })
        }

        const section = await storage.getWhatWeDoSectionBySlug(slug)

        if (!section) {
          return res.status(404).json({ message: 'Section not found' })
        }

        res.json(section)
      } catch (error) {
        console.error('Error fetching what we do section by slug:', error)
        res.status(500).json({ message: 'Failed to fetch what we do section' })
      }
    },
  )

  app.post(
    '/api/what-we-do/sections',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        console.log('Creating what-we-do section with data:', req.body)

        // Validate required fields
        if (!req.body.title || !req.body.slug) {
          return res.status(400).json({
            message: 'Title and slug are required fields',
            receivedData: req.body,
          })
        }

        // Ensure proper types and required fields
        const sectionData = {
          title: String(req.body.title).trim(),
          slug: String(req.body.slug).trim(),
          subtitle: req.body.subtitle || null,
          description: req.body.description || null,
          imageUrl: req.body.imageUrl || null,
          sortOrder: parseInt(req.body.sortOrder) || 0,
        }

        const section = await storage.createWhatWeDoSection(sectionData)
        console.log('Successfully created section:', section)
        res.status(201).json(section)
      } catch (error) {
        console.error('Error creating what we do section:', error)
        res.status(500).json({
          message: 'Failed to create what we do section',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    },
  )

  app.put(
    '/api/what-we-do/sections/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)

        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid section ID' })
        }

        const updatedSection = await storage.updateWhatWeDoSection(id, req.body)

        if (!updatedSection) {
          return res.status(404).json({ message: 'Section not found' })
        }

        res.json(updatedSection)
      } catch (error) {
        console.error('Error updating what we do section:', error)
        res.status(500).json({ message: 'Failed to update what we do section' })
      }
    },
  )

  app.delete(
    '/api/what-we-do/sections/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)

        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid section ID' })
        }

        const deleted = await storage.deleteWhatWeDoSection(id)

        if (!deleted) {
          return res.status(404).json({ message: 'Section not found' })
        }

        res.status(204).end()
      } catch (error) {
        console.error('Error deleting what we do section:', error)
        res.status(500).json({ message: 'Failed to delete what we do section' })
      }
    },
  )

  // What We Do Content API
  app.get(
    '/api/what-we-do/content/section/:sectionId',
    async (req: Request, res: Response) => {
      try {
        const sectionId = parseInt(req.params.sectionId)

        if (isNaN(sectionId)) {
          return res.status(400).json({ message: 'Invalid section ID' })
        }

        const content = await storage.getWhatWeDoContentBySection(sectionId)
        res.json(content)
      } catch (error) {
        console.error('Error fetching what we do content:', error)
        res.status(500).json({ message: 'Failed to fetch what we do content' })
      }
    },
  )

  app.get(
    '/api/what-we-do/content/:id',
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)

        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid content ID' })
        }

        const content = await storage.getWhatWeDoContent(id)

        if (!content) {
          return res.status(404).json({ message: 'Content not found' })
        }

        res.json(content)
      } catch (error) {
        console.error('Error fetching what we do content:', error)
        res.status(500).json({ message: 'Failed to fetch what we do content' })
      }
    },
  )

  app.post(
    '/api/what-we-do/content',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const content = await storage.createWhatWeDoContent(req.body)
        res.status(201).json(content)
      } catch (error) {
        console.error('Error creating what we do content:', error)
        res.status(500).json({ message: 'Failed to create what we do content' })
      }
    },
  )

  app.put(
    '/api/what-we-do/content/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)

        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid content ID' })
        }

        const updatedContent = await storage.updateWhatWeDoContent(id, req.body)

        if (!updatedContent) {
          return res.status(404).json({ message: 'Content not found' })
        }

        res.json(updatedContent)
      } catch (error) {
        console.error('Error updating what we do content:', error)
        res.status(500).json({ message: 'Failed to update what we do content' })
      }
    },
  )

  app.delete(
    '/api/what-we-do/content/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)

        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid content ID' })
        }

        const deleted = await storage.deleteWhatWeDoContent(id)

        if (!deleted) {
          return res.status(404).json({ message: 'Content not found' })
        }

        res.status(204).end()
      } catch (error) {
        console.error('Error deleting what we do content:', error)
        res.status(500).json({ message: 'Failed to delete what we do content' })
      }
    },
  )

  app.post(
    '/api/what-we-do/content/reorder',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { sectionId, contentIds } = req.body

        if (!sectionId || !contentIds || !Array.isArray(contentIds)) {
          return res.status(400).json({ message: 'Invalid request parameters' })
        }

        const reorderedContent = await storage.reorderWhatWeDoContent(
          sectionId,
          contentIds,
        )
        res.json(reorderedContent)
      } catch (error) {
        console.error('Error reordering what we do content:', error)
        res
          .status(500)
          .json({ message: 'Failed to reorder what we do content' })
      }
    },
  )

  app.get('/api/settings', requireAuth, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings()
      res.json(settings)
    } catch (error) {
      console.error('Error getting settings:', error)
      res.status(500).json({ message: 'Failed to get settings' })
    }
  })

  app.get(
    '/api/settings/:purpose',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { purpose } = req.params

        console.log('fetching settings for purpose', purpose)

        const settings = await storage.getSettings(purpose)

        if (!settings) {
          return res.status(400).json({ message: 'Invalid request parameters' })
        }

        console.log('sending settings', settings)
        res.json(settings)
      } catch (error) {
        console.error('Error getting settings:', error)
        res.status(500).json({ message: 'Failed to get settings' })
      }
    },
  )

  app.put(
    '/api/settings/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id)

        if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid setting ID' })
        }

        const updatedSettings = await storage.updateSettings(id, req.body)

        if (!updatedSettings) {
          return res.status(400).json({ message: 'Setting not found' })
        }

        res.json(updatedSettings)
      } catch (error) {
        console.error('Error updating settings:', error)
        res.status(500).json({ message: 'Failed to update settings' })
      }
    },
  )

  app.post('/api/kotahi/sync', async (req: Request, res, Response) => {
    const settings = await storage.getSettings('kotahi')

    if (!settings?.formData.endpoint) {
      return res.status(400).json({ message: 'Invalid Kotahi endpoint' })
    }

    const { endpoint, groupId } = settings.formData

    try {
      const results = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'group-id': groupId,
        },
        body: JSON.stringify(MANUSCRIPTS_PUBLISHED_SINCE_DATE),
      })

      const rawManuscripts: Array<KotahiPublishedManuscript> =
        await results.json()

      //   console.log('Got results:', JSON.stringify(data, null, 2))

      const existingPublications = await storage.getAllPublications()
      const virusCategories = await storage.getAllVirusCategories()

      const existingPublicationsMap = new Map(
        existingPublications.map(pub => [pub.id, pub]),
      )
      const virusCategoriesMap = new Map(
        virusCategories.map(virus => [virus.name.toLocaleLowerCase(), virus]),
      )

      await Promise.all(
        // insert only for now, update later
        rawManuscripts.map(async manuscript => {
          //   if (!existingPublicationsMap.has(manuscript.id)) {
          //     const {
          //       $abstract = '',
          //       $sourceUri = '',
          //       $title = '',
          //       datePublished = '',
          //       firstAuthor = '',
          //     } = JSON.parse(manuscript.submission)
          //     // const newPublication = await storage.createPublication({
          //     // 	title: $title,
          //     // 	kotahiManuscriptId: manuscript.id,
          //     // 	authors: firstAuthor,
          //     // 	// year:
          //     // 	abstract: $abstract,
          //     // 	// evidenceQuality:
          //     // 	// evidenceType:
          //     // 	virusCategoryId: virusCategoriesMap.get('other/unknown')?.id || -1,
          //     // 	// region:
          //     // 	publicationDate: datePublished,
          //     // 	link: $sourceUri
          //     // })
          //   }
        }),
      )

      res.json(rawManuscripts)
    } catch (error) {
      console.error('Error fetching publications:', error)
      res.status(500).json({ message: 'Failed to fetch publications' })
    }
  })

  // GraphQL API proxy endpoint to avoid CORS issues
  app.post('/api/graphql-proxy', async (req: Request, res: Response) => {
    try {
      const {
        endpoint,
        query,
        variables,
        apiKey,
        groupId,
        headers = {},
      } = req.body

      if (!endpoint || !query) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'Both endpoint and query are required',
        })
      }

      // Validate endpoint is a URL
      try {
        new URL(endpoint)
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid endpoint URL',
          message: 'The endpoint must be a valid URL',
        })
      }

      // Import node-fetch dynamically
      const fetch = (await import('node-fetch')).default

      // Set up request headers with proper authentication
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      }

      // Add API key to headers if provided
      if (apiKey) {
        requestHeaders['Authorization'] = `Bearer ${apiKey}`
      }

      // Add Group ID to headers if provided
      if (groupId) {
        requestHeaders['X-Group-ID'] = groupId
      }

      // Make request to GraphQL endpoint
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          query,
          variables: variables || {},
        }),
      })

      // Get response as JSON
      const data = await response.json()

      // Return the response
      res.status(response.status).json(data)
    } catch (error) {
      console.error('Error proxying GraphQL request:', error)
      res.status(500).json({
        error: 'Failed to proxy GraphQL request',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  })

  const httpServer = createServer(app)
  return httpServer
}
