import type { Recipe, RecipeLine, ProfileType } from './types'
import type { IngredientDefinition } from './types'

export interface DefaultRecipeTemplate {
  id: string
  nomeIT: string
  nomeEN: string
  profile: ProfileType
  overrunPct: number
  imageUrl: string
  lines: Array<{ ingredientId: string; weightG: number }>
}

export const DEFAULT_RECIPE_TEMPLATES: DefaultRecipeTemplate[] = [
  {
    id: 'default-fiordilatte',
    nomeIT: 'Fiordilatte',
    nomeEN: 'Milk Gelato',
    profile: 'gelato',
    overrunPct: 35,
    imageUrl: '/recipes/fiordilatte.png',
    lines: [
      { ingredientId: 'latte-intero',  weightG: 588 },
      { ingredientId: 'panna-35',      weightG: 178 },
      { ingredientId: 'lps',           weightG: 40  },
      { ingredientId: 'carrube',       weightG: 4   },
      { ingredientId: 'saccarosio',    weightG: 141 },
      { ingredientId: 'destrosio',     weightG: 50  },
    ],
  },
  {
    id: 'default-pistacchio',
    nomeIT: 'Pistacchio',
    nomeEN: 'Pistachio',
    profile: 'gelato',
    overrunPct: 35,
    imageUrl: '/recipes/pistacchio.png',
    lines: [
      { ingredientId: 'latte-intero',    weightG: 628 },
      { ingredientId: 'panna-35',        weightG: 50  },
      { ingredientId: 'lps',             weightG: 26  },
      { ingredientId: 'carrube',         weightG: 4   },
      { ingredientId: 'saccarosio',      weightG: 127 },
      { ingredientId: 'destrosio',       weightG: 53  },
      { ingredientId: 'pasta-pistacchio',weightG: 81  },
      { ingredientId: 'sale',            weightG: 2   },
    ],
  },
  {
    id: 'default-lampone',
    nomeIT: 'Lampone',
    nomeEN: 'Raspberry',
    profile: 'sorbetto',
    overrunPct: 35,
    imageUrl: '/recipes/lampone.png',
    lines: [
      { ingredientId: 'carrube',   weightG: 3   },
      { ingredientId: 'saccarosio',weightG: 113 },
      { ingredientId: 'destrosio', weightG: 84  },
      { ingredientId: 'acqua',     weightG: 259 },
      { ingredientId: 'inulina',   weightG: 12  },
      { ingredientId: 'lampone',   weightG: 498 },
      { ingredientId: 'limone',    weightG: 27  },
    ],
  },
  {
    id: 'default-crema',
    nomeIT: 'Crema',
    nomeEN: 'Italian Custard',
    profile: 'gelato',
    overrunPct: 35,
    imageUrl: '/recipes/crema.png',
    lines: [
      { ingredientId: 'latte-intero', weightG: 600 },
      { ingredientId: 'panna-35',     weightG: 50  },
      { ingredientId: 'lps',          weightG: 40  },
      { ingredientId: 'tuorlo',       weightG: 120 },
      { ingredientId: 'carrube',      weightG: 4   },
      { ingredientId: 'saccarosio',   weightG: 130 },
      { ingredientId: 'destrosio',    weightG: 58  },
    ],
  },
  {
    id: 'default-granita-fragola',
    nomeIT: 'Granita alla Fragola',
    nomeEN: 'Strawberry Granita',
    profile: 'granita',
    overrunPct: 0,
    imageUrl: '/recipes/granita-fragola.png',
    lines: [
      { ingredientId: 'saccarosio', weightG: 122 },
      { ingredientId: 'acqua',      weightG: 512 },
      { ingredientId: 'fragola',    weightG: 342 },
      { ingredientId: 'limone',     weightG: 24  },
    ],
  },
]

export function buildRecipeFromTemplate(
  template: DefaultRecipeTemplate,
  allIngredients: IngredientDefinition[],
): Recipe {
  const lines: RecipeLine[] = template.lines.map(l => {
    const ingredient = allIngredients.find(i => i.id === l.ingredientId)
    if (!ingredient) throw new Error(`Ingredient not found: ${l.ingredientId}`)
    return {
      id: `${template.id}-${l.ingredientId}`,
      ingredientId: l.ingredientId,
      ingredient,
      weightG: l.weightG,
    }
  })
  return {
    id: template.id,
    nome: template.nomeIT,
    profile: template.profile,
    lines,
    overrunPct: template.overrunPct,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

export function getTemplateName(template: DefaultRecipeTemplate, lang: 'en' | 'it'): string {
  return lang === 'it' ? template.nomeIT : template.nomeEN
}
