import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../shared/schema'

const SALT_ROUNDS = 13

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

export const generateToken = (userId: number) => {
  const secret: string = process.env.JWT_SECRET!
  const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign(
    { userId },
    secret as jwt.Secret,
    { expiresIn } as jwt.SignOptions,
  )
}

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET!
  return jwt.verify(token, secret)
}

export const stripUserPassword = (user: User): Partial<User> => ({
  id: user.id,
  username: user.username,
})
