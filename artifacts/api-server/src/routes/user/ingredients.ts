import { Router } from 'express'
import { db, userCustomIngredientsTable } from '@workspace/db'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../middlewares/requireAuth'
import { mapUserIngredient } from '../../lib/ingredientMapper'

const router = Router()

router.get('/user/ingredients', requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(userCustomIngredientsTable)
      .where(eq(userCustomIngredientsTable.userId, req.user!.id))
    res.json(rows.map(mapUserIngredient))
  } catch (err) {
    req.log.error({ err }, 'User: fetch ingredients failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/user/ingredients', requireAuth, async (req, res) => {
  const body = req.body as {
    id?: string; nome?: string; nomeEN?: string; group?: string
    acquaPct?: number; grassiPct?: number; slngPct?: number; altriSolidiPct?: number
    zuccheri?: Record<string, number>; minPct?: number; maxPct?: number
  }
  if (!body.nome || !body.group) {
    res.status(400).json({ error: 'nome and group are required' })
    return
  }
  try {
    const id = body.id ?? `user-ing-${Date.now()}`
    const [row] = await db.insert(userCustomIngredientsTable).values({
      id,
      userId: req.user!.id,
      nome: body.nome,
      nomeEN: body.nomeEN,
      groupName: body.group,
      acquaPct: String(body.acquaPct ?? 0),
      grassiPct: String(body.grassiPct ?? 0),
      slngPct: String(body.slngPct ?? 0),
      altriSolidiPct: String(body.altriSolidiPct ?? 0),
      zuccheri: body.zuccheri ?? {},
      minPct: body.minPct != null ? String(body.minPct) : undefined,
      maxPct: body.maxPct != null ? String(body.maxPct) : undefined,
    }).returning()
    res.status(201).json(mapUserIngredient(row))
  } catch (err) {
    req.log.error({ err }, 'User: create ingredient failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.patch('/user/ingredients/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const body = req.body as {
    nome?: string; nomeEN?: string; group?: string
    acquaPct?: number; grassiPct?: number; slngPct?: number; altriSolidiPct?: number
    zuccheri?: Record<string, number>; minPct?: number; maxPct?: number; isArchived?: boolean
  }
  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (body.nome !== undefined) updates.nome = body.nome
    if (body.nomeEN !== undefined) updates.nomeEN = body.nomeEN
    if (body.group !== undefined) updates.groupName = body.group
    if (body.acquaPct !== undefined) updates.acquaPct = String(body.acquaPct)
    if (body.grassiPct !== undefined) updates.grassiPct = String(body.grassiPct)
    if (body.slngPct !== undefined) updates.slngPct = String(body.slngPct)
    if (body.altriSolidiPct !== undefined) updates.altriSolidiPct = String(body.altriSolidiPct)
    if (body.zuccheri !== undefined) updates.zuccheri = body.zuccheri
    if (body.minPct !== undefined) updates.minPct = String(body.minPct)
    if (body.maxPct !== undefined) updates.maxPct = String(body.maxPct)
    if (body.isArchived !== undefined) updates.isArchived = body.isArchived
    const [row] = await db.update(userCustomIngredientsTable)
      .set(updates as Parameters<typeof db.update>[0] extends undefined ? never : Record<string, unknown>)
      .where(and(
        eq(userCustomIngredientsTable.id, id),
        eq(userCustomIngredientsTable.userId, req.user!.id)
      ))
      .returning()
    if (!row) { res.status(404).json({ error: 'Not found' }); return }
    res.json(mapUserIngredient(row))
  } catch (err) {
    req.log.error({ err }, 'User: update ingredient failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/user/ingredients/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  try {
    await db.update(userCustomIngredientsTable)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(
        eq(userCustomIngredientsTable.id, id),
        eq(userCustomIngredientsTable.userId, req.user!.id)
      ))
    res.json({ success: true })
  } catch (err) {
    req.log.error({ err }, 'User: delete ingredient failed')
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
