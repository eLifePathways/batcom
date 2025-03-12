import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { pageViews, sessions } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "bat_com_session";
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Device detection helper
const getDeviceType = (userAgent: string): string => {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  
  if (device.type === "mobile") return "mobile";
  if (device.type === "tablet") return "tablet";
  return "desktop";
};

// Get browser and OS info
const getBrowserInfo = (userAgent: string) => {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  
  return {
    browser: `${browser.name || 'Unknown'} ${browser.version || ''}`.trim(),
    os: `${os.name || 'Unknown'} ${os.version || ''}`.trim()
  };
};

// Parse traffic source
const getTrafficSource = (referrer: string) => {
  if (!referrer) return { source: "direct", sourceDetail: "direct" };
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    // Check for search engines
    if (hostname.includes("google")) return { source: "organic", sourceDetail: "google" };
    if (hostname.includes("bing")) return { source: "organic", sourceDetail: "bing" };
    if (hostname.includes("yahoo")) return { source: "organic", sourceDetail: "yahoo" };
    if (hostname.includes("duckduckgo")) return { source: "organic", sourceDetail: "duckduckgo" };
    
    // Check for social media
    if (hostname.includes("facebook") || hostname.includes("fb.com")) return { source: "social", sourceDetail: "facebook" };
    if (hostname.includes("twitter") || hostname.includes("t.co")) return { source: "social", sourceDetail: "twitter" };
    if (hostname.includes("linkedin")) return { source: "social", sourceDetail: "linkedin" };
    if (hostname.includes("instagram")) return { source: "social", sourceDetail: "instagram" };
    
    // Default to referral with the hostname as the source detail
    return { source: "referral", sourceDetail: hostname };
  } catch (e) {
    return { source: "unknown", sourceDetail: "unknown" };
  }
};

// Middleware to track page views
export const analyticsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Skip tracking for admin routes, API calls, and asset requests
  const path = req.path;
  if (
    path.startsWith("/admin") || 
    path.startsWith("/api") || 
    path.match(/\.(ico|css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
  ) {
    return next();
  }

  try {
    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.headers.referer || "";
    const deviceType = getDeviceType(userAgent);
    const { browser, os } = getBrowserInfo(userAgent);
    const { source, sourceDetail } = getTrafficSource(referrer);

    // Get or create session
    let sessionId = req.cookies[SESSION_COOKIE];
    let isNewVisitor = false;
    let isNewSession = false;

    if (!sessionId) {
      // No session cookie, create a new session
      sessionId = uuidv4();
      isNewVisitor = true;
      isNewSession = true;
      
      // Set session cookie
      res.cookie(SESSION_COOKIE, sessionId, {
        maxAge: SESSION_DURATION,
        httpOnly: true,
        sameSite: "lax"
      });
    } else {
      // Check if session exists in database
      const existingSession = await db.select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);
      
      if (existingSession.length === 0) {
        // Session ID exists in cookie but not in database (might have been cleared)
        isNewSession = true;
      }
    }

    // Handle new session
    if (isNewSession) {
      await db.insert(sessions).values({
        id: sessionId,
        deviceType,
        browser,
        os,
        source,
        sourceDetail,
        isNewVisitor,
        entryPage: path,
        // Location info can be added here if available
      });
    } else {
      // Update existing session
      await db.update(sessions)
        .set({ 
          totalPageViews: sessions.totalPageViews + 1,
          endedAt: new Date(), // Update the last activity time
          exitPage: path // Update exit page (will be overwritten if user continues browsing)
        })
        .where(eq(sessions.id, sessionId));
    }

    // Record page view
    await db.insert(pageViews).values({
      path,
      sessionId,
      deviceType,
      referrer,
      // Location info can be added here if available
    });

    // Update previous page view's "isExit" and "bounced" status
    if (!isNewSession) {
      // Get the most recent page view for this session
      const recentPageViews = await db.select()
        .from(pageViews)
        .where(eq(pageViews.sessionId, sessionId))
        .orderBy(pageViews.visitedAt, 'desc')
        .limit(2);
      
      if (recentPageViews.length > 1) {
        const previousPageView = recentPageViews[1]; // second most recent
        
        await db.update(pageViews)
          .set({ 
            isExit: false,
            bounced: false
          })
          .where(eq(pageViews.id, previousPageView.id));
      }
    }
  } catch (error) {
    console.error("Analytics error:", error);
    // Don't block the request if analytics fails
  }

  next();
};

// Function to add scroll depth tracking
export const trackScrollDepth = async (sessionId: string, path: string, scrollDepth: number) => {
  try {
    // Find the most recent page view for this session and path
    const recentPageViews = await db.select()
      .from(pageViews)
      .where(eq(pageViews.sessionId, sessionId))
      .where(eq(pageViews.path, path))
      .orderBy(pageViews.visitedAt, 'desc')
      .limit(1);
    
    if (recentPageViews.length > 0) {
      const pageView = recentPageViews[0];
      
      // Update the scroll depth if it's higher than what was previously recorded
      if (!pageView.scrollDepth || scrollDepth > pageView.scrollDepth) {
        await db.update(pageViews)
          .set({ scrollDepth })
          .where(eq(pageViews.id, pageView.id));
      }
    }
  } catch (error) {
    console.error("Error tracking scroll depth:", error);
  }
};

// Function to record time on page
export const trackTimeOnPage = async (sessionId: string, path: string, timeOnPage: number) => {
  try {
    // Find the most recent page view for this session and path
    const recentPageViews = await db.select()
      .from(pageViews)
      .where(eq(pageViews.sessionId, sessionId))
      .where(eq(pageViews.path, path))
      .orderBy(pageViews.visitedAt, 'desc')
      .limit(1);
    
    if (recentPageViews.length > 0) {
      const pageView = recentPageViews[0];
      
      await db.update(pageViews)
        .set({ timeOnPage })
        .where(eq(pageViews.id, pageView.id));
    }
  } catch (error) {
    console.error("Error tracking time on page:", error);
  }
};

// Function to update session duration
export const updateSessionDuration = async (sessionId: string) => {
  try {
    const sessionData = await db.select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);
    
    if (sessionData.length > 0) {
      const session = sessionData[0];
      
      if (session.startedAt && session.endedAt) {
        const duration = Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000); // in seconds
        
        await db.update(sessions)
          .set({ duration })
          .where(eq(sessions.id, session.id));
      }
    }
  } catch (error) {
    console.error("Error updating session duration:", error);
  }
};