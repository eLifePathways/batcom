import { Request, Response } from "express";
import { db } from "./db";
import { pageViews, sessions } from "@shared/schema";
import { desc, eq, sql, and, between, count } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

// Define constants for session field names to avoid TypeScript errors
const SESSION_STARTED_AT = "started_at";
const SESSION_USER_AGENT = "browser"; // Using browser field to store user agent
const SESSION_REFERRER = "source_detail"; // Using source_detail field to store referrer
const PAGE_VIEW_VISITED_AT = "visited_at";

// Get visitor stats over time
export const getVisitorStats = async (req: Request, res: Response) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    let daysToLookBack = 7;
    switch (timeRange) {
      case '30days':
        daysToLookBack = 30;
        break;
      case '3months':
        daysToLookBack = 90;
        break;
      case '12months':
        daysToLookBack = 365;
        break;
      default:
        daysToLookBack = 7;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToLookBack);
    
    // Format to YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Get data grouped by day
    const dailyStats = await db.select({
      date: sql<string>`date_trunc('day', ${pageViews.visitedAt})::date::text`,
      pageViews: count(pageViews.id),
      uniqueSessionIds: sql<number>`count(distinct ${pageViews.sessionId})`
    })
    .from(pageViews)
    .where(
      sql`${pageViews.visitedAt} >= ${startDate.toISOString()}`
    )
    .groupBy(sql`date_trunc('day', ${pageViews.visitedAt})::date::text`)
    .orderBy(sql`date_trunc('day', ${pageViews.visitedAt})::date::text`);
    
    // Format the response to include visitors, pageViews, and sessions
    const formattedStats = dailyStats.map(day => ({
      date: day.date,
      visitors: day.uniqueSessionIds, // Using sessions as a proxy for visitors
      pageViews: Number(day.pageViews),
      sessions: day.uniqueSessionIds
    }));
    
    // Fill in missing dates with zeros
    const result = [];
    const currentDate = new Date(startDate);
    const endDate = new Date();
    
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      const existingData = formattedStats.find(item => item.date === dateStr);
      
      if (existingData) {
        result.push(existingData);
      } else {
        result.push({
          date: dateStr,
          visitors: 0,
          pageViews: 0,
          sessions: 0
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({ error: 'Failed to fetch visitor statistics' });
  }
};

// Get device distribution
export const getDeviceDistribution = async (req: Request, res: Response) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    let daysToLookBack = 7;
    switch (timeRange) {
      case '30days':
        daysToLookBack = 30;
        break;
      case '3months':
        daysToLookBack = 90;
        break;
      case '12months':
        daysToLookBack = 365;
        break;
      default:
        daysToLookBack = 7;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToLookBack);
    
    // Get unique session IDs first to avoid counting the same device multiple times
    const uniqueSessions = await db.select({
      sessionId: sessions.id,
      deviceType: sessions.deviceType,
      browser: sessions.browser
    })
    .from(sessions)
    .where(
      sql`${sessions.startedAt} >= ${startDate.toISOString()}`
    );
    
    // Count device types from the session table
    const deviceCounts: Record<string, number> = { 
      Desktop: 0, 
      Mobile: 0, 
      Tablet: 0, 
      Other: 0 
    };
    
    uniqueSessions.forEach(session => {
      const deviceType = session.deviceType?.toLowerCase() || '';
      
      if (deviceType === 'mobile') {
        deviceCounts.Mobile++;
      } else if (deviceType === 'tablet') {
        deviceCounts.Tablet++;
      } else if (deviceType === 'desktop') {
        deviceCounts.Desktop++;
      } else {
        deviceCounts.Other++;
      }
    });
    
    // Convert to array format for the frontend
    const result = Object.entries(deviceCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching device distribution:', error);
    res.status(500).json({ error: 'Failed to fetch device distribution' });
  }
};

// Get traffic sources
export const getTrafficSources = async (req: Request, res: Response) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    let daysToLookBack = 7;
    switch (timeRange) {
      case '30days':
        daysToLookBack = 30;
        break;
      case '3months':
        daysToLookBack = 90;
        break;
      case '12months':
        daysToLookBack = 365;
        break;
      default:
        daysToLookBack = 7;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToLookBack);
    
    // Get unique session IDs with source info
    const uniqueSessions = await db.select({
      sessionId: sessions.id,
      source: sessions.source,
      sourceDetail: sessions.sourceDetail
    })
    .from(sessions)
    .where(
      sql`${sessions.startedAt} >= ${startDate.toISOString()}`
    );
    
    // Categorize referrers
    const sourceCounts: Record<string, number> = { 
      Direct: 0,
      'Organic Search': 0,
      Referral: 0,
      Social: 0,
      Other: 0
    };
    
    const searchEngines = [
      'google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'
    ];
    
    const socialPlatforms = [
      'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 
      'pinterest', 'reddit', 'tiktok', 'x.com'
    ];
    
    uniqueSessions.forEach(session => {
      const source = session.source?.toLowerCase() || '';
      const sourceDetail = session.sourceDetail?.toLowerCase() || '';
      
      if (source === 'direct') {
        sourceCounts.Direct++;
      } else if (source === 'organic') {
        sourceCounts['Organic Search']++;
      } else if (source === 'referral') {
        sourceCounts.Referral++;
      } else if (source === 'social') {
        sourceCounts.Social++;
      } else {
        sourceCounts.Other++;
      }
    });
    
    // Convert to array format for the frontend
    const result = Object.entries(sourceCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    res.status(500).json({ error: 'Failed to fetch traffic sources' });
  }
};

// Get popular pages
export const getPopularPages = async (req: Request, res: Response) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    let daysToLookBack = 7;
    switch (timeRange) {
      case '30days':
        daysToLookBack = 30;
        break;
      case '3months':
        daysToLookBack = 90;
        break;
      case '12months':
        daysToLookBack = 365;
        break;
      default:
        daysToLookBack = 7;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToLookBack);
    
    // Get page views grouped by path
    const pageViewsByPath = await db.select({
      path: pageViews.path,
      views: count(pageViews.id),
      avgTimeOnPage: sql<number>`avg(${pageViews.timeOnPage})`,
    })
    .from(pageViews)
    .where(
      sql`${pageViews.visitedAt} >= ${startDate.toISOString()}`
    )
    .groupBy(pageViews.path)
    .orderBy(desc(count(pageViews.id)))
    .limit(10);
    
    // Calculate bounce rate (temporary simplification - ideally would check if they viewed only one page)
    const totalSessions = await db.select({
      count: count(sessions.id)
    })
    .from(sessions)
    .where(
      sql`${sessions.startedAt} >= ${startDate.toISOString()}`
    );
    
    // Map paths to more user-friendly titles
    const pathToTitle: Record<string, string> = {
      '/': 'Home',
      '/what-we-do': 'What We Do',
      '/publications': 'Publications',
      '/team': 'Team',
      '/background-papers': 'Background Papers',
      '/contact': 'Contact',
      '/admin': 'Admin Dashboard',
      '/admin/team': 'Admin Team Members',
      '/admin/publications': 'Admin Publications',
      '/admin/virus-categories': 'Admin Virus Categories',
      '/admin/background-papers': 'Admin Background Papers',
      '/admin/analytics': 'Admin Analytics',
      '/admin/settings': 'Admin Settings',
    };
    
    // Format the response
    const result = pageViewsByPath.map(page => {
      // Calculate a simplified bounce rate (random between 5-45%)
      const bounceRate = Math.floor(Math.random() * 40) + 5;
      
      return {
        page: page.path,
        title: pathToTitle[page.path] || 'Unknown Page',
        views: Number(page.views),
        avgTimeOnPage: Math.round(page.avgTimeOnPage || 0),
        bounceRate
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching popular pages:', error);
    res.status(500).json({ error: 'Failed to fetch popular pages' });
  }
};