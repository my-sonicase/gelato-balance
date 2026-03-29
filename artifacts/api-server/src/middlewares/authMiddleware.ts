import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/auth'

declare module 'express-session' {
  interface SessionData {
    userId: number
    userEmail: string
    userRole: string
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string }
      isAuthenticated(): boolean
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // 1. Try Bearer token (works in Replit production proxy)
  const authHeader = req.headers['authorization']
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (payload) {
      req.user = { id: payload.id, email: payload.email, role: payload.role }
    }
  }

  // 2. Fall back to session cookie (works in dev / non-proxy environments)
  if (!req.user && req.session?.userId) {
    req.user = {
      id: req.session.userId,
      email: req.session.userEmail ?? '',
      role: req.session.userRole ?? 'user',
    }
  }

  req.isAuthenticated = function () {
    return !!this.user
  }
  next()
}
