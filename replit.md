# Gelato Balancer PRO

A professional gelato recipe balancing web application for gelato makers. Balance recipes across sugar, fat, MSNF (SLNG), POD (sweetening power), PAC (antifreeze power), and other solids simultaneously — all in real time.

## Architecture

- **Full-stack** — React + Vite frontend + Express API server + PostgreSQL database
- **Auth** — Email/password with bcrypt + express-session (stored in PostgreSQL via connect-pg-simple)
- **RBAC** — Two roles: `admin` (system ingredient/recipe management) and `user` (personal recipes)
- **State management** — Zustand; ingredients + saved recipes come from API (API-backed); profile ranges + active recipe persisted to localStorage
- **Language** — Bilingual (Italian / English), defaults to Italian
- **Styling** — Tailwind CSS v4 with custom design tokens (warm cream palette, terracotta accent)

## Artifacts

| Artifact | Kind | Preview Path |
|---|---|---|
| `artifacts/gelato-balancer` | web | `/` |
| `artifacts/api-server` | api | `/api` |
| `artifacts/mockup-sandbox` | design | `/__mockup` |

## Admin Credentials (auto-created on first startup)

- **Email:** `admin@gelato.local`
- **Password:** `admin123`
- Change via direct DB update after first login.

## API Routes

| Route | Auth | Description |
|---|---|---|
| `POST /api/auth/signup` | — | Create user account |
| `POST /api/auth/login` | — | Log in, get session cookie |
| `POST /api/auth/logout` | auth | End session |
| `GET /api/auth/me` | auth | Current user info |
| `GET /api/ingredients` | auth | All ingredients (system + user custom) |
| `GET /api/user/ingredients` | auth | User custom ingredients |
| `POST /api/user/ingredients` | auth | Create custom ingredient |
| `PATCH /api/user/ingredients/:id` | auth | Update custom ingredient |
| `DELETE /api/user/ingredients/:id` | auth | Delete custom ingredient |
| `GET /api/user/recipes` | auth | All recipes (system + user) |
| `POST /api/user/recipes` | auth | Save recipe |
| `PATCH /api/user/recipes/:id` | auth | Update saved recipe |
| `DELETE /api/user/recipes/:id` | auth | Delete saved recipe |
| `GET /api/admin/ingredients` | admin | All system ingredients |
| `POST /api/admin/ingredients` | admin | Create system ingredient |
| `PATCH /api/admin/ingredients/:id` | admin | Update system ingredient |
| `GET /api/admin/recipes` | admin | All system recipes |
| `PATCH /api/admin/recipes/:id` | admin | Update/archive system recipe |

## Database Schema (PostgreSQL via Drizzle ORM)

- `users` — id, email, passwordHash, role ('admin'|'user'), createdAt
- `session` — sid, sess (jsonb), expire (for express-session)
- `system_ingredients` — id, nome, nomeEN, groupName, acquaPct, grassiPct, slngPct, altriSolidiPct, zuccheri (jsonb), isArchived
- `user_custom_ingredients` — id, userId, nome, nomeEN, groupName, ... (same structure as system)
- `system_recipes` — id, nome, profile, overrunPct, thumbnail, lines (jsonb [{ingredientId, weightG}]), isArchived
- `user_recipes` — id, userId, nome, profile, overrunPct, thumbnail, lines (jsonb), createdAt, updatedAt

## Key Files

```
artifacts/gelato-balancer/src/
  lib/
    authContext.tsx          — React auth context (AuthProvider + useAuth hook)
    balancer/
      types.ts               — TypeScript interfaces (TabType includes 'admin')
      constants.ts           — Sugar POD/PAC constants, profile target ranges
      calculations.ts        — Recipe balance computation (Corvitto formulas)
      defaultIngredients.ts  — Fallback ingredient list (used if API unavailable)
      defaultRecipeData.ts   — Default recipe templates (for BilanciamentoTab load modal)
      i18n.ts                — EN/IT translations
  store/
    balancerStore.ts         — Zustand store; loadAppData() fetches from API on login
  components/
    auth/
      AuthModal.tsx          — Login/signup form (shown when not authenticated)
    admin/
      AdminTab.tsx           — Admin panel: system ingredients + recipes CRUD
    balancer/
      BalancerApp.tsx        — App shell: auth gate, header, tab nav, user menu
      tabs/
        GelatiSalvatiTab.tsx — Shows system + user recipes (both from API)
        BilanciamentoTab.tsx — Recipe editor + real-time balance sidebar
        IngredientiTab.tsx   — Ingredient database + custom ingredient CRUD
        ConfigurazioneTab.tsx— Target range configuration
        CalcolatoriTab.tsx   — PAC calculators
        IstruzioniTab.tsx    — Instructions

artifacts/api-server/src/
  app.ts                     — Express app: CORS, sessions, auth middleware
  index.ts                   — Server entry: auto-seeds DB on startup
  lib/
    auth.ts                  — Session middleware, password hashing
    ingredientMapper.ts      — Drizzle → IngredientDefinition mapper
  middlewares/
    authMiddleware.ts        — Sets req.user from session
    requireAuth.ts           — 401 if not logged in
    requireAdmin.ts          — 403 if not admin
  routes/
    auth.ts                  — /api/auth/* endpoints
    ingredients.ts           — /api/ingredients (system + custom combined)
    admin/ingredients.ts     — /api/admin/ingredients
    admin/recipes.ts         — /api/admin/recipes
    user/ingredients.ts      — /api/user/ingredients
    user/recipes.ts          — /api/user/recipes
  scripts/
    seed.ts                  — Seeds 75 system ingredients, 5 recipes, admin account

lib/db/src/
  schema/gelato.ts           — Drizzle schema (all tables)
```

## Features

- **Auth gate** — app requires login; signup open to all; admin account auto-created on first startup
- **Role-based UI** — Admin tab only visible to admin users; shows ★ Admin badge in user dropdown
- **6+ tabs**: Recipes, Balance Tool, Ingredients, Admin (admin only), Instructions, Configuration, Calculators
- **7 profile types**: Gelato, Sorbetto, Granita, Vegan, Gastronomico, Personalizzato 1 & 2
- **Real-time balancing**: Zuccheri, Grassi, SLNG, Altri Solidi, Solidi Totali, POD, PAC, Frutta, Alcolici, Alimenti Tritati
- **System recipes** — 5 pre-seeded recipes (Fiordilatte, Pistacchio, Lampone, Crema, Granita Fragola) from DB
- **User recipes** — saved to DB, load/delete/overwrite support
- **Bilingual** — EN/IT switch, ingredient names bilingual (nomeEN field)

## Design Tokens

| Token | Value |
|---|---|
| Background | `#F5F0E8` (warm cream) |
| Surface | `#EDE8DF` |
| Accent | `#C4622D` (terracotta) |
| Success | `#2D7A3A` |
| Warning | `#A87820` |
| Error | `#C4362D` |
| Font display | Cormorant Garamond italic (app title only) |
| Font body | Inter |

## localStorage Keys (still used for non-sensitive session data)

- `gelato-balancer:profile-ranges` — custom target ranges per profile
- `gelato-balancer:last-recipe` — active recipe for session restoration
- `gelato-balancer:language` — `'en'` or `'it'`
- `gelato-balancer:onboarded` — onboarding dismissal flag

## Formulas

- **PAC** = Σ (sugarWeight × sugarPAC / 100) — based on Corvitto/BilanciaLi methodology
- **POD** = Σ (sugarWeight × sugarPOD / 100)
- **Serving temperature** = −3.7 × (PAC / 100) °C
- **Calories** = (fat% × 9 + sugar% × 4 + SLNG% × 0.35 × 4) / (1 + overrun/100)
