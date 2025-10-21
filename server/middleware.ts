import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: number
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization
  if (!header)
    return res.status(401).json({ error: 'Missing Authorization header' })

  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number
    }

    req.userId = payload.userId
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
