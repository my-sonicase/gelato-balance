import { Router } from 'express'
import { db, systemIngredientsTable, userCustomIngredientsTable } from '@workspace/db'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../middlewares/requireAuth'
import { mapSystemIngredient, mapUserIngredient } from '../lib/ingredientMapper'

const router = Router()

router.get('/ingredients', requireAuth, async (req, res) => {
  try {
    const system = await db.select().from(systemIngredientsTable)
      .where(eq(systemIngredientsTable.isArchived, false))
    const userCustom = await db.select().from(userCustomIngredientsTable)
      .where(and(
        eq(userCustomIngredientsTable.userId, req.user!.id),
        eq(userCustomIngredientsTable.isArchived, false)
      ))
    res.json([
      ...system.map(mapSystemIngredient),
      ...userCustom.map(mapUserIngredient),
    ])
  } catch (err) {
    req.log.error({ err }, 'Failed to fetch ingredients')
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
