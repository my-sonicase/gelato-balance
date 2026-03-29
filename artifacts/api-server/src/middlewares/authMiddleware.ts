import type { Request, Response, NextFunction } from 'express'

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
      isAuthenticated: () => this is Request & { user: { id: number; email: string; role: string } }
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.session?.userId) {
    req.user = {
      id: req.session.userId,
      email: req.session.userEmail,
      role: req.session.userRole,
    }
  }
  req.isAuthenticated = function () {
    return !!this.user
  }
  next()
}
