import type { ProfileRanges, ProfileType } from './types'

export const SUGAR_CONSTANTS: Record<string, { POD: number; PAC: number }> = {
  saccarosio:       { POD: 100,   PAC: 100 },
  destrosio:        { POD: 75,    PAC: 190 },
  fruttosio:        { POD: 140,   PAC: 280 },
  invertito:        { POD: 125,   PAC: 190 },
  lattosio:         { POD: 16,    PAC: 100 },
  miele:            { POD: 130,   PAC: 190 },
  trealosio:        { POD: 45,    PAC: 100 },
  isofruttosio:     { POD: 100,   PAC: 190 },
  maltitolo:        { POD: 90,    PAC: 100 },
  sorbitolo:        { POD: 60,    PAC: 190 },
  mannitolo:        { POD: 64,    PAC: 188 },
  xilitolo:         { POD: 100,   PAC: 225 },
  eritritolo:       { POD: 65,    PAC: 0   },
  tagatosio:        { POD: 90,    PAC: 190 },
  stevia:           { POD: 30000, PAC: 0   },
  glicrizina:       { POD: 5000,  PAC: 42  },
  glucosioAt21DE:   { POD: 20,    PAC: 23  },
  glucosioAt39DE:   { POD: 23,    PAC: 45  },
  glucosioAt42DE:   { POD: 18,    PAC: 37  },
  glucosioAt52DE:   { POD: 20,    PAC: 87  },
  maltodestrina5DE: { POD: 5,     PAC: 9   },
  maltodestrina18DE:{ POD: 13,    PAC: 32  },
  maltodestrina20DE:{ POD: 18,    PAC: 37  },
}

export const DEFAULT_PROFILE_RANGES: Record<ProfileType, ProfileRanges> = {
  gelato: {
    zuccheri:        { min: 16, max: 22 },
    grassi:          { min: 5,  max: 12 },
    slng:            { min: 7.5,max: 11.5 },
    altriSolidi:     { min: 0,  max: 5 },
    solidiTotali:    { min: 35, max: 40 },
    pod:             { min: 16, max: 20 },
    pac:             { min: 26, max: 31 },
    frutta:          { min: 20, max: 40 },
    alcolici:        { min: 1,  max: 2 },
    overrun:         { min: 33, max: 35 },
    alimentiTritati: { min: 5,  max: 10 },
  },
  sorbetto: {
    zuccheri:        { min: 20, max: 32 },
    grassi:          { min: 0,  max: 4 },
    slng:            { min: 0,  max: 2 },
    altriSolidi:     { min: 0,  max: 5 },
    solidiTotali:    { min: 25, max: 35 },
    pod:             { min: 17, max: 25 },
    pac:             { min: 28, max: 35 },
    frutta:          { min: 30, max: 60 },
    alcolici:        { min: 1,  max: 2 },
    overrun:         { min: 33, max: 35 },
    alimentiTritati: { min: 5,  max: 10 },
  },
  granita: {
    zuccheri:        { min: 15, max: 20 },
    grassi:          { min: 0,  max: 4 },
    slng:            { min: 0,  max: 2 },
    altriSolidi:     { min: 0,  max: 5 },
    solidiTotali:    { min: 15, max: 25 },
    pod:             { min: 15, max: 20 },
    pac:             { min: 12, max: 17 },
    frutta:          { min: 30, max: 60 },
    alcolici:        { min: 1,  max: 2 },
    overrun:         { min: 0,  max: 15 },
    alimentiTritati: { min: 0,  max: 0 },
  },
  vegan: {
    zuccheri:        { min: 16, max: 22 },
    grassi:          { min: 4,  max: 12 },
    slng:            { min: 0,  max: 0.5 },
    altriSolidi:     { min: 6,  max: 16 },
    solidiTotali:    { min: 35, max: 40 },
    pod:             { min: 16, max: 20 },
    pac:             { min: 26, max: 31 },
    frutta:          { min: 30, max: 60 },
    alcolici:        { min: 1,  max: 2 },
    overrun:         { min: 33, max: 35 },
    alimentiTritati: { min: 5,  max: 10 },
  },
  gastronomico: {
    zuccheri:        { min: 14, max: 22 },
    grassi:          { min: 4,  max: 15 },
    slng:            { min: 4,  max: 10 },
    altriSolidi:     { min: 0,  max: 15 },
    solidiTotali:    { min: 25, max: 50 },
    pod:             { min: 5,  max: 12 },
    pac:             { min: 25, max: 31 },
    frutta:          { min: 20, max: 40 },
    alcolici:        { min: 1,  max: 2 },
    overrun:         { min: 33, max: 35 },
    alimentiTritati: { min: 5,  max: 10 },
  },
  personalizzato1: {
    zuccheri:        { min: 0,  max: 100 },
    grassi:          { min: 0,  max: 100 },
    slng:            { min: 0,  max: 100 },
    altriSolidi:     { min: 0,  max: 100 },
    solidiTotali:    { min: 0,  max: 100 },
    pod:             { min: 0,  max: 100 },
    pac:             { min: 0,  max: 100 },
    frutta:          { min: 0,  max: 100 },
    alcolici:        { min: 0,  max: 100 },
    overrun:         { min: 0,  max: 100 },
    alimentiTritati: { min: 0,  max: 100 },
  },
  personalizzato2: {
    zuccheri:        { min: 0,  max: 100 },
    grassi:          { min: 0,  max: 100 },
    slng:            { min: 0,  max: 100 },
    altriSolidi:     { min: 0,  max: 100 },
    solidiTotali:    { min: 0,  max: 100 },
    pod:             { min: 0,  max: 100 },
    pac:             { min: 0,  max: 100 },
    frutta:          { min: 0,  max: 100 },
    alcolici:        { min: 0,  max: 100 },
    overrun:         { min: 0,  max: 100 },
    alimentiTritati: { min: 0,  max: 100 },
  },
}

export const DEFAULT_OVERRUN: Record<ProfileType, number> = {
  gelato:         35,
  sorbetto:       35,
  granita:        0,
  vegan:          35,
  gastronomico:   35,
  personalizzato1:35,
  personalizzato2:35,
}

export const GELATO_SLOTS = [
  'Base bianca', 'Base gialla', 'Base cioccolato', 'Gelato alla frutta',
  'Paste di frutta secca', 'Base yogurt', 'Base alcolica bianca', 'Base alcolica gialla',
  'Mio Gelato 2', 'Mio Gelato 3', 'Mio Gelato 4', 'Mio Gelato 5', 'Mio Gelato 6',
  'Mio Gelato 7', 'Mio Gelato 8', 'Mio Gelato 9', 'Mio Gelato 10', 'Mio Gelato 11',
  'Mio Gelato 12', 'Mio Gelato 13', 'Mio Gelato 14', 'Mio Gelato 15',
]

export const SORBETTO_SLOTS = [
  'Sorbetto Limone', 'Sorbetto Agrumi', 'Sorbetto Agrumi Misti', 'Sorbetto Frutta',
  'Sorbetto Frutti Rossi', 'Sorbetto Erbe Aromatiche', 'Sorbetto Verdura',
  'Mio Sorbetto 1', 'Mio Sorbetto 2', 'Mio Sorbetto 3', 'Mio Sorbetto 4',
  'Mio Sorbetto 5', 'Mio Sorbetto 6', 'Mio Sorbetto 7', 'Mio Sorbetto 8',
  'Mio Sorbetto 9', 'Mio Sorbetto 10', 'Mio Sorbetto 11',
]

export const GRANITA_SLOTS = [
  'Granita al Limone', 'Granita alla Fragola',
  ...Array.from({ length: 21 }, (_, i) => `Mia Granita ${i + 1}`),
]

export const VEGAN_SLOTS = Array.from({ length: 10 }, (_, i) => `Mio Gelato Vegan ${i + 1}`)

export const GASTRONOMICO_SLOTS = Array.from({ length: 10 }, (_, i) => `Mio Gelato Gastronomico ${i + 1}`)

export const PERSONALIZZATO1_SLOTS = Array.from({ length: 10 }, (_, i) => `Mia Ricetta 1.${i + 1}`)

export const PERSONALIZZATO2_SLOTS = Array.from({ length: 10 }, (_, i) => `Mia Ricetta 2.${i + 1}`)

export const SLOT_NAMES: Record<ProfileType, string[]> = {
  gelato:          GELATO_SLOTS,
  sorbetto:        SORBETTO_SLOTS,
  granita:         GRANITA_SLOTS,
  vegan:           VEGAN_SLOTS,
  gastronomico:    GASTRONOMICO_SLOTS,
  personalizzato1: PERSONALIZZATO1_SLOTS,
  personalizzato2: PERSONALIZZATO2_SLOTS,
}

export const STORAGE_KEYS = {
  SAVED_SLOTS:         'gelato-balancer:saved-slots',
  CUSTOM_INGREDIENTS:  'gelato-balancer:custom-ingredients',
  PROFILE_RANGES:      'gelato-balancer:profile-ranges',
  LAST_RECIPE:         'gelato-balancer:last-recipe',
  LANGUAGE:            'gelato-balancer:language',
}
