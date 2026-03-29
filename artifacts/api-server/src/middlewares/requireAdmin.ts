import type { Request, Response, NextFunction } from 'express'

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }
  next()
}
