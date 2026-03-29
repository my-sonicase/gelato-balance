import bcrypt from 'bcryptjs'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import { pool } from '@workspace/db'
import jwt from 'jsonwebtoken'

const PgStore = connectPgSimple(session)

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET env variable is required')
}

const JWT_SECRET = process.env.SESSION_SECRET

export const sessionMiddleware = session({
  store: new PgStore({ pool, tableName: 'session', createTableIfMissing: false }),
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
})

export interface JwtPayload {
  id: number
  email: string
  role: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
