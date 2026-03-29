import type { ProfileType } from './types'

const THUMBNAILS: Record<ProfileType, string[]> = {
  gelato:          ['/recipe-thumbs/gelato-a.png', '/recipe-thumbs/gelato-b.png'],
  sorbetto:        ['/recipe-thumbs/sorbetto-a.png'],
  granita:         ['/recipe-thumbs/granita-a.png'],
  vegan:           ['/recipe-thumbs/vegan-a.png'],
  gastronomico:    ['/recipe-thumbs/gastronomico-a.png'],
  personalizzato1: ['/recipe-thumbs/custom-a.png'],
  personalizzato2: ['/recipe-thumbs/custom-a.png'],
}

export function pickThumbnail(profile: ProfileType, name: string): string {
  const pool = THUMBNAILS[profile] ?? THUMBNAILS.gelato
  const hash = [...name].reduce((a, c) => ((a * 31) + c.charCodeAt(0)) | 0, 0)
  return pool[Math.abs(hash) % pool.length]
}
