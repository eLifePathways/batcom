import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Express, Request, Response, NextFunction } from 'express';

const UPLOAD_DIR = path.join(process.cwd(), 'client', 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer upload instance
export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to handle upload errors
export const handleUploadErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred during file upload
    return res.status(400).json({ 
      error: true, 
      message: `Upload error: ${err.message}` 
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({ 
      error: true, 
      message: err.message || 'An unknown error occurred during file upload' 
    });
  }
  next();
};

// Helper to convert uploaded file path to a URL path
export const getUploadedFileUrl = (filename: string) => {
  // Return the public URL path for the uploaded file
  return `/uploads/${filename}`;
};