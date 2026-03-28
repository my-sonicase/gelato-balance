import type { Lang } from '../../../lib/balancer/i18n'
import { TRANSLATIONS } from '../../../lib/balancer/i18n'

interface Props { lang: Lang }

const CONTENT = {
  en: {
    intro: 'The Gelato Balancer is a professional tool used by gelato makers to balance recipes. "Balancing" means adjusting ingredient quantities until the mix hits precise targets for sugar content, fat, MSNF, other solids, total solids, sweetening power (POD), and antifreeze power (PAC) — all simultaneously.',
    tabs: [
      { name: 'Configuration', desc: 'Set target ranges for each of 7 profile types (Gelato, Sorbet, Granita, Vegan, Savory, Custom 1 & 2). Every parameter has a min and max. You can reset any column to its defaults.' },
      { name: 'Balancing', desc: 'The main tab. Add ingredients from the database to 7 collapsible groups. Enter weights in grams. Watch the real-time balance panel update as you type. The balance bar shows each parameter vs. its target range.' },
      { name: 'Saved Recipes', desc: 'Save up to ~23 gelato recipes, 18 sorbets, 23 granitas, and 10 each for the other profile types. Named slots for classic formulations, open slots for your creations.' },
      { name: 'Calculators', desc: 'Three advanced tools: (1) PAC from molecular weight for pure sugars; (2) PAC for fatty pastes like pistachio or hazelnut paste; (3) PAC for chocolate coatings.' },
      { name: 'Ingredients', desc: 'Browse, search, and manage the ingredient database. Built-in ingredients are read-only. Add, edit, and delete your own custom ingredients.' },
    ],
    glossary: [
      { term: 'POD (Potere Dolcificante)', def: 'Sweetening power, relative to sucrose = 100. Higher POD means the recipe tastes sweeter at the same sugar weight.' },
      { term: 'PAC (Potere Anti-Congelante)', def: 'Antifreeze power. Higher PAC lowers the serving temperature and makes the gelato softer. Calculated from each sugar\'s molecular weight.' },
      { term: 'MSNF (Milk Solids Non-Fat)', def: 'Milk proteins + lactose. In Italian: SLNG (Solidi del Latte Non Grassi). Affects structure and firmness.' },
      { term: 'Solidi Totali', def: 'Total solids = Fat + MSNF + Sugars + Other Solids. Target range typically 35–40% for gelato.' },
      { term: 'Overrun', def: 'The volume increase during churning, as a percentage. 35% overrun means 100g mix becomes ~135g gelato.' },
      { term: 'Temperatura di Servizio', def: 'Serving temperature, calculated from PAC: T = −3.7 × (PAC / 100) °C.' },
    ],
    credits: 'Formulas based on Angelo Corvitto\'s gelato science methodology, as presented in "I segreti del gelato" and used in BilanciaLi (Italian gelato balancing software).',
  },
  it: {
    intro: 'Il Bilanciatore è uno strumento professionale usato dai gelatieri per bilanciare le ricette. "Bilanciare" significa aggiustare le quantità degli ingredienti finché la miscela raggiunge target precisi per zuccheri, grassi, SLNG, altri solidi, solidi totali, potere dolcificante (POD) e potere anticongelante (PAC) — tutti contemporaneamente.',
    tabs: [
      { name: 'Configurazione', desc: 'Imposta i range target per ognuno dei 7 tipi di profilo (Gelato, Sorbetto, Granita, Vegan, Gastronomico, Personalizzato 1 & 2). Ogni parametro ha un min e un max. Puoi ripristinare qualsiasi colonna ai valori predefiniti.' },
      { name: 'Bilanciamento', desc: 'La scheda principale. Aggiungi ingredienti dal database a 7 gruppi comprimibili. Inserisci i pesi in grammi. Il pannello di bilanciamento si aggiorna in tempo reale mentre digiti. La barra mostra ogni parametro rispetto al suo range target.' },
      { name: 'Gelati Salvati', desc: 'Salva fino a ~23 ricette di gelato, 18 sorbetti, 23 granite e 10 per ognuno degli altri tipi di profilo. Slot nominati per le preparazioni classiche, slot liberi per le tue creazioni.' },
      { name: 'Calcolatori', desc: 'Tre strumenti avanzati: (1) PAC dal peso molecolare per zuccheri puri; (2) PAC per paste grasse come pasta di pistacchio o nocciola; (3) PAC per coperture di cioccolato.' },
      { name: 'Ingredienti', desc: 'Sfoglia, cerca e gestisci il database degli ingredienti. Gli ingredienti predefiniti sono in sola lettura. Aggiungi, modifica ed elimina i tuoi ingredienti personalizzati.' },
    ],
    glossary: [
      { term: 'POD (Potere Dolcificante)', def: 'Dolcezza relativa al saccarosio = 100. Un POD più alto significa che la ricetta è più dolce a parità di peso di zuccheri.' },
      { term: 'PAC (Potere Anti-Congelante)', def: 'Capacità di abbassare il punto di congelamento. Un PAC più alto abbassa la temperatura di servizio e rende il gelato più morbido. Calcolato dal peso molecolare di ogni zucchero.' },
      { term: 'SLNG (Solidi del Latte Non Grassi)', def: 'Proteine del latte + lattosio. Influisce sulla struttura e sulla consistenza.' },
      { term: 'Solidi Totali', def: 'Solidi totali = Grassi + SLNG + Zuccheri + Altri Solidi. Range target tipico 35–40% per il gelato.' },
      { term: 'Overrun', def: "L'aumento di volume durante la mantecazione, in percentuale. 35% di overrun significa che 100g di miscela diventano ~135g di gelato." },
      { term: 'Temperatura di Servizio', def: 'Temperatura di servizio, calcolata dal PAC: T = −3.7 × (PAC / 100) °C.' },
    ],
    credits: 'Formule basate sulla metodologia scientifica del gelato di Angelo Corvitto, come presentata in "I segreti del gelato" e utilizzata in BilanciaLi (software italiano di bilanciamento del gelato).',
  },
}

export default function IstruzioniTab({ lang }: Props) {
  const t = TRANSLATIONS[lang]
  const c = CONTENT[lang]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '28px', fontWeight: 500, color: 'var(--color-text)' }}>
          {t.istruzioni.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {c.intro}
        </p>
      </div>

      {/* How to use each tab */}
      <section>
        <h2 className="text-base font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-text)', fontSize: '11px', letterSpacing: '0.1em' }}>
          {t.istruzioni.howToUse}
        </h2>
        <div className="space-y-3">
          {c.tabs.map(tab => (
            <div key={tab.name} className="p-4 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>{tab.name}</div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tab.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Glossary */}
      <section>
        <h2 className="text-base font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-text)', fontSize: '11px', letterSpacing: '0.1em' }}>
          {t.istruzioni.glossary}
        </h2>
        <div className="space-y-3">
          {c.glossary.map(item => (
            <div key={item.term} className="p-4 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-accent)' }}>{item.term}</div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.def}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Credits */}
      <section>
        <h2 className="text-base font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--color-text)', fontSize: '11px', letterSpacing: '0.1em' }}>
          {t.istruzioni.credits}
        </h2>
        <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>{c.credits}</p>
      </section>
    </div>
  )
}
