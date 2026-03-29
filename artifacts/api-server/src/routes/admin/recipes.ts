import { Router } from 'express'
import { db, systemRecipesTable } from '@workspace/db'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '../../middlewares/requireAdmin'

const router = Router()

function mapRecipe(row: typeof systemRecipesTable.$inferSelect) {
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

router.get('/admin/recipes', requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(systemRecipesTable)
    res.json(rows.map(mapRecipe))
  } catch (err) {
    req.log.error({ err }, 'Admin: fetch recipes failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/admin/recipes', requireAdmin, async (req, res) => {
  const body = req.body as {
    id?: string; nome?: string; profile?: string
    lines?: unknown[]; overrunPct?: number; thumbnail?: string
  }
  if (!body.nome || !body.profile) {
    res.status(400).json({ error: 'nome and profile are required' })
    return
  }
  try {
    const id = body.id ?? `sys-${Date.now()}`
    const [row] = await db.insert(systemRecipesTable).values({
      id,
      nome: body.nome,
      profile: body.profile,
      lines: body.lines ?? [],
      overrunPct: String(body.overrunPct ?? 30),
      thumbnail: body.thumbnail,
    }).returning()
    res.status(201).json(mapRecipe(row))
  } catch (err) {
    req.log.error({ err }, 'Admin: create recipe failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.patch('/admin/recipes/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  const body = req.body as {
    nome?: string; profile?: string; lines?: unknown[]; overrunPct?: number
    thumbnail?: string; isArchived?: boolean
  }
  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (body.nome !== undefined) updates.nome = body.nome
    if (body.profile !== undefined) updates.profile = body.profile
    if (body.lines !== undefined) updates.lines = body.lines
    if (body.overrunPct !== undefined) updates.overrunPct = String(body.overrunPct)
    if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail
    if (body.isArchived !== undefined) updates.isArchived = body.isArchived
    const [row] = await db.update(systemRecipesTable)
      .set(updates as Parameters<typeof db.update>[0] extends undefined ? never : Record<string, unknown>)
      .where(eq(systemRecipesTable.id, id))
      .returning()
    if (!row) { res.status(404).json({ error: 'Not found' }); return }
    res.json(mapRecipe(row))
  } catch (err) {
    req.log.error({ err }, 'Admin: update recipe failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
