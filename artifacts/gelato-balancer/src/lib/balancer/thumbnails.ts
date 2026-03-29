import type { ProfileType } from './types'

// Keyword → image path mapping. Recipe name is checked against these keywords (case-insensitive).
const FLAVOR_MAP: Array<{ path: string; keywords: string[] }> = [
  { path: '/recipe-thumbs/flavors/chocolate.png',  keywords: ['cioccolato', 'chocolate', 'fondente', 'dark', 'cacao', 'cocoa', 'latte cioccolato'] },
  { path: '/recipe-thumbs/flavors/pistachio.png',  keywords: ['pistacchio', 'pistachio', 'pista'] },
  { path: '/recipe-thumbs/flavors/hazelnut.png',   keywords: ['nocciola', 'hazelnut', 'nutella', 'pralin', 'noisette'] },
  { path: '/recipe-thumbs/flavors/coffee.png',     keywords: ['caffe', 'caffè', 'coffee', 'espresso', 'cappuccino', 'mocha', 'tiramisù', 'tiramisu'] },
  { path: '/recipe-thumbs/flavors/strawberry.png', keywords: ['fragola', 'strawberry', 'fraise'] },
  { path: '/recipe-thumbs/flavors/raspberry.png',  keywords: ['lampone', 'raspberry', 'framboise', 'mora rossa'] },
  { path: '/recipe-thumbs/flavors/blueberry.png',  keywords: ['mirtillo', 'blueberry', 'ribes', 'mora', 'cassis', 'blackberry', 'blackcurrant'] },
  { path: '/recipe-thumbs/flavors/lemon.png',      keywords: ['limone', 'lemon', 'citron', 'cedro', 'agrumi', 'citrus', 'arancia', 'orange', 'mandarino', 'limoncello'] },
  { path: '/recipe-thumbs/flavors/mango.png',      keywords: ['mango', 'ananas', 'pineapple', 'passion', 'frutto tropicale', 'tropical', 'exotique'] },
  { path: '/recipe-thumbs/flavors/mint.png',       keywords: ['menta', 'mint', 'menthe', 'stracciatella'] },
  { path: '/recipe-thumbs/flavors/vanilla.png',    keywords: ['vaniglia', 'vanilla', 'fiordilatte', 'fior di latte', 'crema', 'custard', 'zabaione', 'zabaglione'] },
  { path: '/recipe-thumbs/flavors/peach.png',      keywords: ['pesca', 'peach', 'albicocca', 'apricot', 'pera', 'pear', 'melone', 'melon'] },
  { path: '/recipe-thumbs/flavors/banana.png',     keywords: ['banana'] },
  { path: '/recipe-thumbs/flavors/caramel.png',    keywords: ['caramello', 'caramel', 'salted butter', 'burro salato', 'butterscotch', 'toffee'] },
  { path: '/recipe-thumbs/flavors/watermelon.png', keywords: ['anguria', 'watermelon', 'granita', 'cocomero'] },
  { path: '/recipe-thumbs/flavors/coconut.png',    keywords: ['cocco', 'coconut', 'coco', 'noix de coco'] },
]

// Profile-based fallbacks when no keyword matches
const PROFILE_FALLBACKS: Record<ProfileType, string> = {
  gelato:          '/recipe-thumbs/gelato-a.png',
  sorbetto:        '/recipe-thumbs/sorbetto-a.png',
  granita:         '/recipe-thumbs/granita-a.png',
  vegan:           '/recipe-thumbs/vegan-a.png',
  gastronomico:    '/recipe-thumbs/gastronomico-a.png',
  personalizzato1: '/recipe-thumbs/custom-a.png',
  personalizzato2: '/recipe-thumbs/custom-a.png',
}

export function pickThumbnail(profile: ProfileType, name: string): string {
  const lower = name.toLowerCase()
  for (const { path, keywords } of FLAVOR_MAP) {
    if (keywords.some(k => lower.includes(k))) {
      return path
    }
  }
  return PROFILE_FALLBACKS[profile] ?? '/recipe-thumbs/gelato-a.png'
}
