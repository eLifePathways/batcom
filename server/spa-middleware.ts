import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// This middleware handles SPA (Single Page Application) routing
// It ensures that routes like /admin are handled by the React router
export const spaMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip API routes 
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Skip asset files
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  
  // For all other routes, let the SPA router handle it
  console.log(`SPA middleware handling route: ${req.path}`);
  next();
};

export default spaMiddleware;