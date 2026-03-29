import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  numeric,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod/v4'

/* ─── Users ───────────────────────────────────────────────── */

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true })
export const selectUserSchema = createSelectSchema(usersTable)
export type InsertUser = z.infer<typeof insertUserSchema>
export type User = typeof usersTable.$inferSelect

/* ─── Sessions (connect-pg-simple) ─────────────────────────── */

export const sessionsTable = pgTable('session', {
  sid: varchar('sid').primaryKey(),
  sess: jsonb('sess').notNull(),
  expire: timestamp('expire', { precision: 6 }).notNull(),
})

/* ─── System Ingredients (admin-managed) ─────────────────── */

export const systemIngredientsTable = pgTable('system_ingredients', {
  id: varchar('id', { length: 100 }).primaryKey(),
  nome: text('nome').notNull(),
  nomeEN: text('nome_en'),
  groupName: varchar('group_name', { length: 50 }).notNull(),
  acquaPct: numeric('acqua_pct', { precision: 6, scale: 3 }).notNull().default('0'),
  grassiPct: numeric('grassi_pct', { precision: 6, scale: 3 }).notNull().default('0'),
  slngPct: numeric('slng_pct', { precision: 6, scale: 3 }).notNull().default('0'),
  altriSolidiPct: numeric('altri_solidi_pct', { precision: 6, scale: 3 }).notNull().default('0'),
  zuccheri: jsonb('zuccheri').notNull().default('{}'),
  podDirect: numeric('pod_direct', { precision: 10, scale: 4 }),
  pacDirect: numeric('pac_direct', { precision: 10, scale: 4 }),
  minPct: numeric('min_pct', { precision: 6, scale: 3 }),
  maxPct: numeric('max_pct', { precision: 6, scale: 3 }),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type SystemIngredient = typeof systemIngredientsTable.$inferSelect

/* ─── User Custom Ingredients ────────────────────────────── */

export const userCustomIngredientsTable = pgTable('user_custom_ingredients', {
  id: varchar('id', { length: 100 }).primaryKey(),
  userId: integer('user_id').notNull().references(() => usersTable.id),
  nome: text('nome').notNull(),
  nomeEN: text('nome_en'),
  groupName: varchar('group_name', { length: 50 }).notNull(),
  acquaPct: numeric('acqua_pct', { precision: 6, scale: 3 }).notNull().default('0'),
  grassiPct: numeric('grassi_pct', { precision: 6, scale: 3 }).notNull().default('0'),
  slngPct: numeric('slng_pct', { precision: 6, scale: 3 }).notNull().default('0'),
  altriSolidiPct: numeric('altri_solidi_pct', { precision: 6, scale: 3 }).notNull().default('0'),
  zuccheri: jsonb('zuccheri').notNull().default('{}'),
  podDirect: numeric('pod_direct', { precision: 10, scale: 4 }),
  pacDirect: numeric('pac_direct', { precision: 10, scale: 4 }),
  minPct: numeric('min_pct', { precision: 6, scale: 3 }),
  maxPct: numeric('max_pct', { precision: 6, scale: 3 }),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type UserCustomIngredient = typeof userCustomIngredientsTable.$inferSelect

/* ─── System Recipes (admin-managed, shown to all users) ─── */

export const systemRecipesTable = pgTable('system_recipes', {
  id: varchar('id', { length: 100 }).primaryKey(),
  nome: text('nome').notNull(),
  profile: varchar('profile', { length: 50 }).notNull(),
  lines: jsonb('lines').notNull().default('[]'),
  overrunPct: numeric('overrun_pct', { precision: 6, scale: 2 }).notNull().default('30'),
  thumbnail: text('thumbnail'),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type SystemRecipe = typeof systemRecipesTable.$inferSelect

/* ─── User Recipes ────────────────────────────────────────── */

export const userRecipesTable = pgTable('user_recipes', {
  id: varchar('id', { length: 100 }).primaryKey(),
  userId: integer('user_id').notNull().references(() => usersTable.id),
  nome: text('nome').notNull(),
  profile: varchar('profile', { length: 50 }).notNull(),
  lines: jsonb('lines').notNull().default('[]'),
  overrunPct: numeric('overrun_pct', { precision: 6, scale: 2 }).notNull().default('30'),
  thumbnail: text('thumbnail'),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type UserRecipe = typeof userRecipesTable.$inferSelect
