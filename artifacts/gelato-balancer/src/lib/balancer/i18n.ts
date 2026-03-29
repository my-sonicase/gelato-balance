export type Lang = 'en' | 'it'

export interface Translations {
  appName: string
  pro: string
  tabs: {
    istruzioni: string
    configurazione: string
    bilanciamento: string
    gelatiSalvati: string
    calcolatori: string
    ingredienti: string
  }
  actions: {
    nuovo: string
    salva: string
    stampa: string
    carica: string
    elimina: string
    aggiungiIngrediente: string
    reset: string
    aggiungi: string
    annulla: string
    conferma: string
    cerca: string
    salvaQui: string
  }
  balancer: {
    nomeRicetta: string
    profilo: string
    totalePeso: string
    pesoMiscela: string
    pesoGelato: string
    calorie: string
    tempServizio: string
    overrun: string
    bilanciata: string
    quasiBilanciata: string
    daCorreggere: string
    parametriOutOfRange: string
    totali: string
    grammi: string
    percentSulTotale: string
    percentMin: string
    percentMax: string
  }
  parameters: {
    zuccheri: string
    grassi: string
    slng: string
    altriSolidi: string
    solidiTotali: string
    pod: string
    pac: string
    frutta: string
    alcolici: string
    overrun: string
    alimentiTritati: string
    acqua: string
  }
  groups: {
    latticiniUova: string
    neutriBasi: string
    zuccheri: string
    ingredientiPrincipali: string
    fruttaVerdura: string
    alcolici: string
    alimentiTritati: string
  }
  profiles: {
    gelato: string
    sorbetto: string
    granita: string
    vegan: string
    gastronomico: string
    personalizzato1: string
    personalizzato2: string
  }
  configurazione: {
    title: string
    ripristina: string
    rangesDescription: string
    minLabel: string
    maxLabel: string
  }
  savedRecipes: {
    title: string
    vuoto: string
    dataSalvataggio: string
    caricaInBalancer: string
  }
  calculators: {
    pac_mol: {
      title: string
      desc: string
      pesomolecolare: string
      risultato: string
      tabellaRiferimento: string
    }
    pac_paste: {
      title: string
      desc: string
      grassiPct: string
      zuccheriPct: string
      tipoZucchero: string
      risultato: string
    }
    pac_cioccolato: {
      title: string
      desc: string
      burrodiCacao: string
      cacaoSecco: string
      zucchero: string
      risultato: string
    }
  }
  ingredienti: {
    title: string
    nome: string
    acqua: string
    grassi: string
    slng: string
    altriSolidi: string
    zuccheri: string
    minPct: string
    maxPct: string
    aggiungiCustom: string
    ingredienteReadOnly: string
    confermaElimina: string
    group: string
  }
  istruzioni: {
    title: string
    welcome: string
    howToUse: string
    glossary: string
    credits: string
  }
  nav: {
    myRecipes: string
    balanceTool: string
    ingredientsDb: string
    settings: string
    instructions: string
    configuration: string
    calculators: string
    newRecipe: string
  }
  onboarding: {
    title: string
    subtitle: string
    bullet1: string
    bullet2: string
    bullet3: string
    cta: string
  }
  myRecipes: {
    emptyTitle: string
    emptyDesc: string
    createFirst: string
    savedOn: string
    loadRecipe: string
    noRecipesYet: string
  }
}

const en: Translations = {
  appName: 'Gelato Balancer',
  pro: 'PRO',
  tabs: {
    istruzioni: 'Instructions',
    configurazione: 'Configuration',
    bilanciamento: 'Balancing',
    gelatiSalvati: 'Saved Recipes',
    calcolatori: 'Calculators',
    ingredienti: 'Ingredients',
  },
  actions: {
    nuovo: 'New',
    salva: 'Save',
    stampa: 'Print',
    carica: 'Load',
    elimina: 'Delete',
    aggiungiIngrediente: '+ Add ingredient',
    reset: 'Reset to defaults',
    aggiungi: 'Add',
    annulla: 'Cancel',
    conferma: 'Confirm',
    cerca: 'Search...',
    salvaQui: 'Save here',
  },
  balancer: {
    nomeRicetta: 'Recipe name',
    profilo: 'Profile',
    totalePeso: 'Total weight',
    pesoMiscela: 'Mix weight',
    pesoGelato: 'Gelato weight',
    calorie: 'Calories',
    tempServizio: 'Serving temp.',
    overrun: 'Overrun %',
    bilanciata: 'Balanced recipe ✓',
    quasiBilanciata: 'Nearly balanced ⚠',
    daCorreggere: 'Needs correction ✗',
    parametriOutOfRange: 'parameters out of range',
    totali: 'TOTALS',
    grammi: 'g',
    percentSulTotale: '% of total',
    percentMin: '% min',
    percentMax: '% max',
  },
  parameters: {
    zuccheri: 'Sugars',
    grassi: 'Fat',
    slng: 'MSNF',
    altriSolidi: 'Other Solids',
    solidiTotali: 'Total Solids',
    pod: 'POD',
    pac: 'PAC',
    frutta: 'Fruit',
    alcolici: 'Alcohol',
    overrun: 'Overrun',
    alimentiTritati: 'Mix-ins',
    acqua: 'Water',
  },
  groups: {
    latticiniUova: 'Dairy & Eggs',
    neutriBasi: 'Neutrals & Bases',
    zuccheri: 'Sugars',
    ingredientiPrincipali: 'Main Ingredients',
    fruttaVerdura: 'Fruit & Vegetables',
    alcolici: 'Alcoholic',
    alimentiTritati: 'Chopped Mix-ins',
  },
  profiles: {
    gelato: 'Gelato',
    sorbetto: 'Sorbet',
    granita: 'Granita',
    vegan: 'Vegan Gelato',
    gastronomico: 'Savory Gelato',
    personalizzato1: 'Custom 1',
    personalizzato2: 'Custom 2',
  },
  configurazione: {
    title: 'Target Range Configuration',
    ripristina: 'Reset',
    rangesDescription: 'Edit the target ranges for each profile type. Values are percentages of total mix weight.',
    minLabel: 'Min',
    maxLabel: 'Max',
  },
  savedRecipes: {
    title: 'Saved Recipes',
    vuoto: 'Empty',
    dataSalvataggio: 'Saved',
    caricaInBalancer: 'Load',
  },
  calculators: {
    pac_mol: {
      title: 'PAC from Molecular Weight',
      desc: 'Calculate the PAC constant for any pure sugar molecule. Formula: PAC = 34,200 / molecular weight.',
      pesomolecolare: 'Molecular weight (g/mol)',
      risultato: 'PAC =',
      tabellaRiferimento: 'Common sugars reference',
    },
    pac_paste: {
      title: 'PAC for Fatty Pastes',
      desc: 'Calculate the net PAC contribution of pastes that contain both fat and sugar (e.g. pistachio paste, hazelnut paste).',
      grassiPct: 'Fat %',
      zuccheriPct: 'Sugar %',
      tipoZucchero: 'Sugar type',
      risultato: 'Net PAC per 100g =',
    },
    pac_cioccolato: {
      title: 'PAC for Chocolate & Coatings',
      desc: 'Calculate the net PAC of chocolate products combining cocoa butter, dry cocoa, and sugar.',
      burrodiCacao: 'Cocoa butter %',
      cacaoSecco: 'Dry cocoa %',
      zucchero: 'Sugar %',
      risultato: 'Net PAC per 100g =',
    },
  },
  ingredienti: {
    title: 'Ingredient Database',
    nome: 'Name',
    acqua: 'Water %',
    grassi: 'Fat %',
    slng: 'MSNF %',
    altriSolidi: 'Other Solids %',
    zuccheri: 'Sugars',
    minPct: 'Min %',
    maxPct: 'Max %',
    aggiungiCustom: '+ Add Custom Ingredient',
    ingredienteReadOnly: 'Built-in ingredient (read-only)',
    confermaElimina: 'Are you sure you want to delete this ingredient?',
    group: 'Group',
  },
  istruzioni: {
    title: 'How to use the Gelato Balancer',
    welcome: 'This professional tool helps you balance gelato recipes to hit precise targets for sugar, fat, MSNF, POD (sweetening power), and PAC (antifreeze power) — all simultaneously.',
    howToUse: 'How to use each tab',
    glossary: 'Glossary',
    credits: 'Credits',
  },
  nav: {
    myRecipes: 'My Recipes',
    balanceTool: 'Balance Tool',
    ingredientsDb: 'Ingredients',
    settings: 'Settings',
    instructions: 'Instructions',
    configuration: 'Configuration',
    calculators: 'Calculators',
    newRecipe: 'New Recipe',
  },
  onboarding: {
    title: 'Welcome to Gelato Balancer PRO',
    subtitle: 'A professional workspace for balanced gelato recipes.',
    bullet1: 'Build recipes by adding ingredients with precise gram weights',
    bullet2: 'Get real-time balance scores for sugar, fat, PAC, POD and more',
    bullet3: 'Save and compare recipes across 7 profile types',
    cta: 'Start Balancing',
  },
  myRecipes: {
    emptyTitle: 'No recipes saved yet',
    emptyDesc: 'Create your first recipe in the Balance Tool, then save it here.',
    createFirst: 'Create your first recipe',
    savedOn: 'Saved',
    loadRecipe: 'Open',
    noRecipesYet: 'No recipes yet',
  },
}

const it: Translations = {
  appName: 'Gelato Balancer',
  pro: 'PRO',
  tabs: {
    istruzioni: 'Istruzioni',
    configurazione: 'Configurazione',
    bilanciamento: 'Bilanciamento',
    gelatiSalvati: 'Gelati Salvati',
    calcolatori: 'Calcolatori',
    ingredienti: 'Ingredienti',
  },
  actions: {
    nuovo: 'Nuovo',
    salva: 'Salva',
    stampa: 'Stampa',
    carica: 'Carica',
    elimina: 'Elimina',
    aggiungiIngrediente: '+ Aggiungi ingrediente',
    reset: 'Ripristina valori predefiniti',
    aggiungi: 'Aggiungi',
    annulla: 'Annulla',
    conferma: 'Conferma',
    cerca: 'Cerca...',
    salvaQui: 'Salva qui',
  },
  balancer: {
    nomeRicetta: 'Nome ricetta',
    profilo: 'Profilo',
    totalePeso: 'Peso totale',
    pesoMiscela: 'Peso Miscela',
    pesoGelato: 'Peso Gelato',
    calorie: 'Calorie',
    tempServizio: 'Temp. servizio',
    overrun: 'Overrun %',
    bilanciata: 'Ricetta bilanciata ✓',
    quasiBilanciata: 'Quasi bilanciata ⚠',
    daCorreggere: 'Da correggere ✗',
    parametriOutOfRange: 'parametri fuori range',
    totali: 'TOTALI',
    grammi: 'g',
    percentSulTotale: '% sul totale',
    percentMin: '% min',
    percentMax: '% max',
  },
  parameters: {
    zuccheri: 'Zuccheri',
    grassi: 'Grassi',
    slng: 'SLNG',
    altriSolidi: 'Altri Solidi',
    solidiTotali: 'Solidi Totali',
    pod: 'POD',
    pac: 'PAC',
    frutta: 'Frutta',
    alcolici: 'Alcolici',
    overrun: 'Overrun',
    alimentiTritati: 'Alim. Tritati',
    acqua: 'Acqua',
  },
  groups: {
    latticiniUova: 'Latticini & Uova',
    neutriBasi: 'Neutri & Basi',
    zuccheri: 'Zuccheri',
    ingredientiPrincipali: 'Ingredienti principali',
    fruttaVerdura: 'Frutta & Verdura',
    alcolici: 'Alcolici',
    alimentiTritati: 'Alimenti Tritati',
  },
  profiles: {
    gelato: 'Gelato',
    sorbetto: 'Sorbetto',
    granita: 'Granita',
    vegan: 'Gelato Vegan',
    gastronomico: 'Gelato Gastronomico',
    personalizzato1: 'Personalizzato 1',
    personalizzato2: 'Personalizzato 2',
  },
  configurazione: {
    title: 'Configurazione Range Target',
    ripristina: 'Ripristina',
    rangesDescription: 'Modifica i range target per ogni tipo di profilo. I valori sono percentuali sul peso totale della miscela.',
    minLabel: 'Min',
    maxLabel: 'Max',
  },
  savedRecipes: {
    title: 'Gelati Salvati',
    vuoto: 'Vuoto',
    dataSalvataggio: 'Salvato',
    caricaInBalancer: 'Carica',
  },
  calculators: {
    pac_mol: {
      title: 'PAC da Peso Molecolare',
      desc: 'Calcola la costante PAC per qualsiasi molecola di zucchero puro. Formula: PAC = 34.200 / peso molecolare.',
      pesomolecolare: 'Peso molecolare (g/mol)',
      risultato: 'PAC =',
      tabellaRiferimento: 'Riferimento zuccheri comuni',
    },
    pac_paste: {
      title: 'PAC per Paste Grasse',
      desc: 'Calcola il contributo PAC netto di paste che contengono sia grassi che zuccheri (es. pasta di pistacchio, pasta di nocciola).',
      grassiPct: 'Grassi %',
      zuccheriPct: 'Zuccheri %',
      tipoZucchero: 'Tipo zucchero',
      risultato: 'PAC netto per 100g =',
    },
    pac_cioccolato: {
      title: 'PAC per Coperture e Cioccolato',
      desc: 'Calcola il PAC netto di prodotti al cioccolato combinando burro di cacao, cacao secco e zucchero.',
      burrodiCacao: 'Burro di cacao %',
      cacaoSecco: 'Cacao secco %',
      zucchero: 'Zucchero %',
      risultato: 'PAC netto per 100g =',
    },
  },
  ingredienti: {
    title: 'Database Ingredienti',
    nome: 'Nome',
    acqua: 'Acqua %',
    grassi: 'Grassi %',
    slng: 'SLNG %',
    altriSolidi: 'Altri Solidi %',
    zuccheri: 'Zuccheri',
    minPct: 'Min %',
    maxPct: 'Max %',
    aggiungiCustom: '+ Aggiungi ingrediente custom',
    ingredienteReadOnly: 'Ingrediente integrato (sola lettura)',
    confermaElimina: 'Vuoi davvero eliminare questo ingrediente?',
    group: 'Gruppo',
  },
  istruzioni: {
    title: 'Come usare il Bilanciatore',
    welcome: 'Questo strumento professionale ti aiuta a bilanciare ricette di gelato per raggiungere target precisi di zuccheri, grassi, SLNG, POD (potere dolcificante) e PAC (potere anticongelante) — tutto contemporaneamente.',
    howToUse: 'Come usare ogni scheda',
    glossary: 'Glossario',
    credits: 'Crediti',
  },
  nav: {
    myRecipes: 'Le Mie Ricette',
    balanceTool: 'Bilanciamento',
    ingredientsDb: 'Ingredienti',
    settings: 'Impostazioni',
    instructions: 'Istruzioni',
    configuration: 'Configurazione',
    calculators: 'Calcolatori',
    newRecipe: 'Nuova Ricetta',
  },
  onboarding: {
    title: 'Benvenuto in Gelato Balancer PRO',
    subtitle: 'Lo spazio di lavoro professionale per ricette di gelato bilanciate.',
    bullet1: 'Costruisci ricette aggiungendo ingredienti con pesi in grammi precisi',
    bullet2: 'Visualizza in tempo reale zuccheri, grassi, PAC, POD e molto altro',
    bullet3: 'Salva e confronta ricette su 7 tipi di profilo diversi',
    cta: 'Inizia a Bilanciare',
  },
  myRecipes: {
    emptyTitle: 'Nessuna ricetta salvata',
    emptyDesc: 'Crea la tua prima ricetta nello strumento di bilanciamento, poi salvala qui.',
    createFirst: 'Crea la tua prima ricetta',
    savedOn: 'Salvato',
    loadRecipe: 'Apri',
    noRecipesYet: 'Ancora nessuna ricetta',
  },
}

export const TRANSLATIONS: Record<Lang, Translations> = { en, it }
