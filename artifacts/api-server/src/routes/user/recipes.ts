import { Router } from 'express'
import { db, userRecipesTable, systemRecipesTable } from '@workspace/db'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../middlewares/requireAuth'

const router = Router()

function mapRecipe(row: typeof userRecipesTable.$inferSelect) {
  return {
    id: row.id,
    nome: row.nome,
    profile: row.profile,
    lines: row.lines,
    overrunPct: parseFloat(row.overrunPct),
    thumbnail: row.thumbnail,
    isArchived: row.isArchived,
    isSystemRecipe: false,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function mapSystemRecipe(row: typeof systemRecipesTable.$inferSelect) {
  return {
    id: row.id,
    nome: row.nome,
    profile: row.profile,
    lines: row.lines,
    overrunPct: parseFloat(row.overrunPct),
    thumbnail: row.thumbnail,
    isArchived: row.isArchived,
    isSystemRecipe: true,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

router.get('/user/recipes', requireAuth, async (req, res) => {
  try {
    const [systemRecipes, userRecipes] = await Promise.all([
      db.select().from(systemRecipesTable).where(eq(systemRecipesTable.isArchived, false)),
      db.select().from(userRecipesTable).where(and(
        eq(userRecipesTable.userId, req.user!.id),
        eq(userRecipesTable.isArchived, false)
      )),
    ])
    res.json([
      ...systemRecipes.map(mapSystemRecipe),
      ...userRecipes.map(mapRecipe),
    ])
  } catch (err) {
    req.log.error({ err }, 'User: fetch recipes failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/user/recipes', requireAuth, async (req, res) => {
  const body = req.body as {
    id?: string; nome?: string; profile?: string
    lines?: unknown[]; overrunPct?: number; thumbnail?: string
  }
  if (!body.nome || !body.profile) {
    res.status(400).json({ error: 'nome and profile are required' })
    return
  }
  try {
    const id = body.id ?? `user-recipe-${Date.now()}`
    const [row] = await db.insert(userRecipesTable).values({
      id,
      userId: req.user!.id,
      nome: body.nome,
      profile: body.profile,
      lines: body.lines ?? [],
      overrunPct: String(body.overrunPct ?? 30),
      thumbnail: body.thumbnail,
    }).returning()
    res.status(201).json(mapRecipe(row))
  } catch (err) {
    req.log.error({ err }, 'User: create recipe failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.patch('/user/recipes/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const body = req.body as {
    nome?: string; profile?: string; lines?: unknown[]
    overrunPct?: number; thumbnail?: string; isArchived?: boolean
  }
  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (body.nome !== undefined) updates.nome = body.nome
    if (body.profile !== undefined) updates.profile = body.profile
    if (body.lines !== undefined) updates.lines = body.lines
    if (body.overrunPct !== undefined) updates.overrunPct = String(body.overrunPct)
    if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail
    if (body.isArchived !== undefined) updates.isArchived = body.isArchived
    const [row] = await db.update(userRecipesTable)
      .set(updates as Parameters<typeof db.update>[0] extends undefined ? never : Record<string, unknown>)
      .where(and(
        eq(userRecipesTable.id, id),
        eq(userRecipesTable.userId, req.user!.id)
      ))
      .returning()
    if (!row) { res.status(404).json({ error: 'Not found' }); return }
    res.json(mapRecipe(row))
  } catch (err) {
    req.log.error({ err }, 'User: update recipe failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/user/recipes/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  try {
    await db.update(userRecipesTable)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(
        eq(userRecipesTable.id, id),
        eq(userRecipesTable.userId, req.user!.id)
      ))
    res.json({ success: true })
  } catch (err) {
    req.log.error({ err }, 'User: delete recipe failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
