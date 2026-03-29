import { Router } from 'express'
import { db, usersTable } from '@workspace/db'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '../lib/auth'
import { requireAuth } from '../middlewares/requireAuth'

const router = Router()

router.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1)
    if (existing.length > 0) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }
    const passwordHash = await hashPassword(password)
    const [user] = await db.insert(usersTable).values({
      email: email.toLowerCase(),
      passwordHash,
      role: 'user',
    }).returning()
    req.session.userId = user.id
    req.session.userEmail = user.email
    req.session.userRole = user.role
    res.json({ id: user.id, email: user.email, role: user.role })
  } catch (err) {
    req.log.error({ err }, 'Signup error')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1)
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    req.session.userId = user.id
    req.session.userEmail = user.email
    req.session.userRole = user.role
    res.json({ id: user.id, email: user.email, role: user.role })
  } catch (err) {
    req.log.error({ err }, 'Login error')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
})

router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ id: req.user!.id, email: req.user!.email, role: req.user!.role })
})

export default router
