# Gelato Balancer PRO

A professional gelato recipe balancing web application for gelato makers. Balance recipes across sugar, fat, MSNF (SLNG), POD (sweetening power), PAC (antifreeze power), and other solids simultaneously — all in real time.

## Architecture

- **Frontend-only** — pure React + Vite app, no backend required
- **State management** — Zustand with localStorage persistence (no server needed)
- **Language** — Bilingual (Italian / English), defaults to Italian
- **Styling** — Tailwind CSS v4 with custom design tokens (warm cream palette, terracotta accent)

## Artifacts

| Artifact | Kind | Preview Path |
|---|---|---|
| `artifacts/gelato-balancer` | web | `/` |
| `artifacts/api-server` | api | `/api` |
| `artifacts/mockup-sandbox` | design | `/__mockup` |

## Key Files

```
artifacts/gelato-balancer/src/
  lib/balancer/
    types.ts             — TypeScript interfaces
    constants.ts         — Sugar POD/PAC constants, profile target ranges, slot names
    calculations.ts      — Recipe balance computation (Corvitto formulas)
    defaultIngredients.ts— 60+ built-in ingredients (dairy, sugars, fruit, etc.) + acqua, sale
    defaultRecipeData.ts — 5 default "included" recipe templates with images + buildRecipeFromTemplate()
    i18n.ts              — EN/IT translations
  store/
    balancerStore.ts     — Zustand store with full recipe/profile/slot management
  components/balancer/
    BalancerApp.tsx      — App shell: header, tab nav, lang toggle
    tabs/
      IstruzioniTab.tsx  — Instructions, glossary, credits
      ConfigurazioneTab.tsx — Target range table (7 profiles × 11 parameters)
      BilanciamentoTab.tsx  — Main recipe editor + real-time balance sidebar
      GelatiSalvatiTab.tsx  — Named slot save/load UI for all 7 profile types
      CalcolatoriTab.tsx    — 3 PAC calculators (MW, fatty pastes, chocolate)
      IngredientiTab.tsx    — Searchable ingredient database + custom ingredient CRUD
```

## Features

- **6 tabs**: Instructions, Configuration, Balancing, Saved Recipes, Calculators, Ingredients
- **7 profile types**: Gelato, Sorbetto, Granita, Vegan, Gastronomico, Personalizzato 1 & 2
- **Real-time balancing**: Zuccheri, Grassi, SLNG, Altri Solidi, Solidi Totali, POD, PAC, Frutta, Alcolici, Alimenti Tritati
- **Per-parameter target ranges**: configurable min/max per profile, reset to defaults
- **Named recipe slots**: 23 gelato, 18 sorbetto, 23 granita, 10 each for other profiles
- **PAC calculators**: from molecular weight, for fatty pastes, for chocolate coatings
- **Custom ingredients**: add/edit/delete; built-in ingredients are read-only
- **Print support**: Stampa button triggers window.print(), ingredient table + balance panel
- **Bilingual**: EN / IT switch persists to localStorage

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

## Storage Keys (localStorage)

- `gelato-balancer:saved-slots` — saved recipe slots
- `gelato-balancer:custom-ingredients` — user-added ingredients
- `gelato-balancer:profile-ranges` — custom target ranges
- `gelato-balancer:last-recipe` — auto-saved current recipe
- `gelato-balancer:language` — `'en'` or `'it'`

## Formulas

- **PAC** = Σ (sugarWeight × sugarPAC / 100) — based on Corvitto/BilanciaLi methodology
- **POD** = Σ (sugarWeight × sugarPOD / 100)
- **Serving temperature** = −3.7 × (PAC / 100) °C
- **Calories** = (fat% × 9 + sugar% × 4 + SLNG% × 0.35 × 4) / (1 + overrun/100)
