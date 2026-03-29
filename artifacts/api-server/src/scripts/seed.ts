/**
 * Seed script: creates admin account + seeds system ingredients and recipes.
 * Run with: npx tsx src/scripts/seed.ts
 * Or auto-runs on server startup when DB is empty.
 */
import { db, usersTable, systemIngredientsTable, systemRecipesTable } from '@workspace/db'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@gelato.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'

const SYSTEM_INGREDIENTS = [
  // LATTICINI & UOVA
  { id: 'latte-intero',        nome: 'Latte intero',                    nomeEN: 'Whole milk',                 groupName: 'latticiniUova', acquaPct: '87.2', grassiPct: '3.5',  slngPct: '8.7',  zuccheri: { lattosio: 4.8 },                    altriSolidiPct: '0.6' },
  { id: 'latte-parz-scremato', nome: 'Latte parz. scremato',            nomeEN: 'Semi-skimmed milk',          groupName: 'latticiniUova', acquaPct: '89.0', grassiPct: '1.6',  slngPct: '8.9',  zuccheri: { lattosio: 4.8 },                    altriSolidiPct: '0.5' },
  { id: 'latte-scremato',      nome: 'Latte scremato',                  nomeEN: 'Skimmed milk',               groupName: 'latticiniUova', acquaPct: '90.5', grassiPct: '0.1',  slngPct: '9.0',  zuccheri: { lattosio: 4.9 },                    altriSolidiPct: '0.5' },
  { id: 'panna-35',            nome: 'Panna 35%',                       nomeEN: 'Cream 35%',                  groupName: 'latticiniUova', acquaPct: '59.5', grassiPct: '35.0', slngPct: '5.0',  zuccheri: { lattosio: 2.9 },                    altriSolidiPct: '0.6' },
  { id: 'panna-38',            nome: 'Panna 38%',                       nomeEN: 'Cream 38%',                  groupName: 'latticiniUova', acquaPct: '57.0', grassiPct: '38.0', slngPct: '5.0',  zuccheri: { lattosio: 2.7 },                    altriSolidiPct: '0.3' },
  { id: 'burro',               nome: 'Burro',                           nomeEN: 'Butter',                     groupName: 'latticiniUova', acquaPct: '15.8', grassiPct: '82.0', slngPct: '1.2',  zuccheri: {},                                   altriSolidiPct: '1.0' },
  { id: 'lps',                 nome: 'Latte in polvere scremato (LPS)', nomeEN: 'Skim milk powder (SMP)',     groupName: 'latticiniUova', acquaPct: '3.5',  grassiPct: '0.8',  slngPct: '95.0', zuccheri: { lattosio: 50.5 },                   altriSolidiPct: '0.7' },
  { id: 'lpi',                 nome: 'Latte in polvere intero (LPI)',   nomeEN: 'Whole milk powder (WMP)',    groupName: 'latticiniUova', acquaPct: '3.0',  grassiPct: '26.0', slngPct: '70.0', zuccheri: { lattosio: 36.5 },                   altriSolidiPct: '1.0' },
  { id: 'tuorlo',              nome: "Tuorlo d'uovo fresco",            nomeEN: 'Fresh egg yolk',             groupName: 'latticiniUova', acquaPct: '51.0', grassiPct: '31.0', slngPct: '0.0',  zuccheri: {},                                   altriSolidiPct: '18.0' },
  { id: 'albume',              nome: "Albume d'uovo fresco",            nomeEN: 'Fresh egg white',            groupName: 'latticiniUova', acquaPct: '88.0', grassiPct: '0.0',  slngPct: '0.0',  zuccheri: {},                                   altriSolidiPct: '12.0' },
  { id: 'ricotta',             nome: 'Ricotta intera',                  nomeEN: 'Whole ricotta',              groupName: 'latticiniUova', acquaPct: '71.0', grassiPct: '12.0', slngPct: '8.0',  zuccheri: { lattosio: 3.0 },                    altriSolidiPct: '6.0' },
  { id: 'mascarpone',          nome: 'Mascarpone',                      nomeEN: 'Mascarpone',                 groupName: 'latticiniUova', acquaPct: '44.0', grassiPct: '44.0', slngPct: '5.5',  zuccheri: { lattosio: 2.5 },                    altriSolidiPct: '4.0' },
  { id: 'yogurt',              nome: 'Yogurt intero',                   nomeEN: 'Whole yogurt',               groupName: 'latticiniUova', acquaPct: '85.0', grassiPct: '3.5',  slngPct: '7.5',  zuccheri: { lattosio: 4.0 },                    altriSolidiPct: '0.0' },
  { id: 'formaggio-fresco',    nome: 'Formaggio fresco spalmabile',     nomeEN: 'Cream cheese',               groupName: 'latticiniUova', acquaPct: '54.0', grassiPct: '34.0', slngPct: '6.5',  zuccheri: { lattosio: 2.7 },                    altriSolidiPct: '2.8' },
  { id: 'latte-condensato',    nome: 'Latte condensato zuccherato',     nomeEN: 'Sweetened condensed milk',   groupName: 'latticiniUova', acquaPct: '26.0', grassiPct: '8.5',  slngPct: '17.0', zuccheri: { saccarosio: 44.0 },                 altriSolidiPct: '4.5' },
  { id: 'panna-polvere',       nome: 'Panna in polvere',                nomeEN: 'Cream powder',               groupName: 'latticiniUova', acquaPct: '3.0',  grassiPct: '42.0', slngPct: '46.0', zuccheri: { lattosio: 25.0 },                   altriSolidiPct: '9.0' },
  // ZUCCHERI
  { id: 'saccarosio',          nome: 'Saccarosio',                      nomeEN: 'Sucrose',                    groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { saccarosio: 100 },                  altriSolidiPct: '0', minPct: '8', maxPct: '15' },
  { id: 'destrosio',           nome: 'Destrosio (Glucosio)',            nomeEN: 'Dextrose (Glucose)',          groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { destrosio: 100 },                   altriSolidiPct: '0' },
  { id: 'fruttosio',           nome: 'Fruttosio',                       nomeEN: 'Fructose',                   groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { fruttosio: 100 },                   altriSolidiPct: '0' },
  { id: 'zucchero-invertito',  nome: 'Zucchero Invertito',              nomeEN: 'Invert sugar',               groupName: 'zuccheri',       acquaPct: '23',   grassiPct: '0',    slngPct: '0',    zuccheri: { invertito: 75 },                    altriSolidiPct: '2' },
  { id: 'miele',               nome: 'Miele',                           nomeEN: 'Honey',                      groupName: 'zuccheri',       acquaPct: '17',   grassiPct: '0',    slngPct: '0',    zuccheri: { miele: 80 },                        altriSolidiPct: '3' },
  { id: 'trealosio',           nome: 'Trealosio',                       nomeEN: 'Trehalose',                  groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { trealosio: 100 },                   altriSolidiPct: '0' },
  { id: 'isofruttosio',        nome: 'Isofruttosio',                    nomeEN: 'Isofructose',                groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { isofruttosio: 100 },                altriSolidiPct: '0' },
  { id: 'maltitolo',           nome: 'Maltitolo',                       nomeEN: 'Maltitol',                   groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { maltitolo: 100 },                   altriSolidiPct: '0' },
  { id: 'sorbitolo',           nome: 'Sorbitolo',                       nomeEN: 'Sorbitol',                   groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { sorbitolo: 100 },                   altriSolidiPct: '0' },
  { id: 'eritritolo',          nome: 'Eritritolo',                      nomeEN: 'Erythritol',                 groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { eritritolo: 100 },                  altriSolidiPct: '0' },
  { id: 'tagatosio',           nome: 'Tagatosio',                       nomeEN: 'Tagatose',                   groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { tagatosio: 100 },                   altriSolidiPct: '0' },
  { id: 'sciroppo-glucosio-21',nome: 'Sciroppo glucosio 21DE',          nomeEN: 'Glucose syrup 21DE',         groupName: 'zuccheri',       acquaPct: '20',   grassiPct: '0',    slngPct: '0',    zuccheri: { glucosioAt21DE: 80 },               altriSolidiPct: '0' },
  { id: 'sciroppo-glucosio-39',nome: 'Sciroppo glucosio 39DE',          nomeEN: 'Glucose syrup 39DE',         groupName: 'zuccheri',       acquaPct: '20',   grassiPct: '0',    slngPct: '0',    zuccheri: { glucosioAt39DE: 80 },               altriSolidiPct: '0' },
  { id: 'sciroppo-glucosio-42',nome: 'Sciroppo glucosio 42DE',          nomeEN: 'Glucose syrup 42DE',         groupName: 'zuccheri',       acquaPct: '20',   grassiPct: '0',    slngPct: '0',    zuccheri: { glucosioAt42DE: 80 },               altriSolidiPct: '0' },
  { id: 'sciroppo-glucosio-52',nome: 'Sciroppo glucosio 52DE',          nomeEN: 'Glucose syrup 52DE',         groupName: 'zuccheri',       acquaPct: '20',   grassiPct: '0',    slngPct: '0',    zuccheri: { glucosioAt52DE: 80 },               altriSolidiPct: '0' },
  { id: 'maltodestrina-5',     nome: 'Maltodestrina 5DE',               nomeEN: 'Maltodextrin 5DE',           groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { maltodestrina5DE: 100 },            altriSolidiPct: '0' },
  { id: 'maltodestrina-18',    nome: 'Maltodestrina 18DE',              nomeEN: 'Maltodextrin 18DE',          groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { maltodestrina18DE: 100 },           altriSolidiPct: '0' },
  { id: 'maltodestrina-20',    nome: 'Maltodestrina 20DE',              nomeEN: 'Maltodextrin 20DE',          groupName: 'zuccheri',       acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: { maltodestrina20DE: 100 },           altriSolidiPct: '0' },
  // NEUTRI E BASI
  { id: 'acqua',               nome: 'Acqua',                           nomeEN: 'Water',                      groupName: 'neutriBasi',     acquaPct: '100',  grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '0' },
  { id: 'sale',                nome: 'Sale marino',                     nomeEN: 'Sea salt',                   groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'carrube',             nome: 'Farina di carrube',               nomeEN: 'Carob flour',                groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'neutro-gelato',       nome: 'Neutro per gelato',               nomeEN: 'Gelato stabilizer',          groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'neutro-sorbetto',     nome: 'Neutro per sorbetto',             nomeEN: 'Sorbet stabilizer',          groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'inulina',             nome: 'Inulina',                         nomeEN: 'Inulin',                     groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'xantano',             nome: 'Gomma xantana',                   nomeEN: 'Xanthan gum',                groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'guar',                nome: 'Gomma di guar',                   nomeEN: 'Guar gum',                   groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'alginato',            nome: 'Alginato di sodio',               nomeEN: 'Sodium alginate',            groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'pectina',             nome: 'Pectina NH',                      nomeEN: 'Pectin NH',                  groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'agar-agar',           nome: 'Agar agar',                       nomeEN: 'Agar agar',                  groupName: 'neutriBasi',     acquaPct: '0',    grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '100' },
  { id: 'latte-di-cocco',      nome: 'Latte di cocco',                  nomeEN: 'Coconut milk',               groupName: 'neutriBasi',     acquaPct: '67.0', grassiPct: '21.0', slngPct: '3.5',  zuccheri: {},                                   altriSolidiPct: '5.0' },
  { id: 'latte-mandorla',      nome: 'Latte di mandorla',               nomeEN: 'Almond milk',                groupName: 'neutriBasi',     acquaPct: '88.0', grassiPct: '2.5',  slngPct: '0.5',  zuccheri: {},                                   altriSolidiPct: '2.5' },
  { id: 'latte-avena',         nome: 'Latte di avena',                  nomeEN: 'Oat milk',                   groupName: 'neutriBasi',     acquaPct: '87.0', grassiPct: '1.5',  slngPct: '1.0',  zuccheri: { maltodestrina5DE: 6.5 },            altriSolidiPct: '1.0' },
  { id: 'latte-soia',          nome: 'Latte di soia',                   nomeEN: 'Soy milk',                   groupName: 'neutriBasi',     acquaPct: '88.0', grassiPct: '2.0',  slngPct: '3.5',  zuccheri: {},                                   altriSolidiPct: '2.0' },
  // INGREDIENTI PRINCIPALI
  { id: 'pasta-pistacchio',    nome: 'Pasta di pistacchio',             nomeEN: 'Pistachio paste',            groupName: 'ingredientiPrincipali', acquaPct: '3.0', grassiPct: '52.0', slngPct: '3.0', zuccheri: {},                                altriSolidiPct: '35.0', minPct: '5', maxPct: '15' },
  { id: 'pasta-nocciola',      nome: 'Pasta di nocciola',               nomeEN: 'Hazelnut paste',             groupName: 'ingredientiPrincipali', acquaPct: '3.0', grassiPct: '60.0', slngPct: '0.5', zuccheri: {},                                altriSolidiPct: '28.0', minPct: '5', maxPct: '15' },
  { id: 'pasta-mandorla',      nome: 'Pasta di mandorla',               nomeEN: 'Almond paste',               groupName: 'ingredientiPrincipali', acquaPct: '3.5', grassiPct: '53.0', slngPct: '0.5', zuccheri: {},                                altriSolidiPct: '30.0', minPct: '5', maxPct: '15' },
  { id: 'cacao-amaro',         nome: 'Cacao amaro in polvere',          nomeEN: 'Unsweetened cocoa powder',   groupName: 'ingredientiPrincipali', acquaPct: '5.0', grassiPct: '22.0', slngPct: '0',   zuccheri: {},                                altriSolidiPct: '60.0', minPct: '4', maxPct: '12' },
  { id: 'cioccolato-fondente', nome: 'Cioccolato fondente 70%',         nomeEN: 'Dark chocolate 70%',         groupName: 'ingredientiPrincipali', acquaPct: '0',   grassiPct: '40.0', slngPct: '0',   zuccheri: { saccarosio: 28.0 },              altriSolidiPct: '30.0', minPct: '10', maxPct: '30' },
  { id: 'caffe-solubile',      nome: 'Caffè solubile',                  nomeEN: 'Instant coffee',             groupName: 'ingredientiPrincipali', acquaPct: '4.0', grassiPct: '0.5',  slngPct: '0',   zuccheri: {},                                altriSolidiPct: '90.0', minPct: '2', maxPct: '8' },
  { id: 'vaniglia-bacche',     nome: 'Vaniglia (bacche)',                nomeEN: 'Vanilla (beans)',            groupName: 'ingredientiPrincipali', acquaPct: '20.0', grassiPct: '0.1', slngPct: '0',   zuccheri: {},                                altriSolidiPct: '70.0', minPct: '0', maxPct: '2' },
  { id: 'estratto-vaniglia',   nome: 'Estratto di vaniglia',            nomeEN: 'Vanilla extract',            groupName: 'ingredientiPrincipali', acquaPct: '65.0', grassiPct: '0',   slngPct: '0',   zuccheri: {},                                altriSolidiPct: '5.0' },
  { id: 'limone',              nome: 'Succo di limone',                  nomeEN: 'Lemon juice',                groupName: 'ingredientiPrincipali', acquaPct: '91.0', grassiPct: '0.3', slngPct: '0.5', zuccheri: { fruttosio: 1.4, saccarosio: 0.4 }, altriSolidiPct: '1.0' },
  { id: 'zest-limone',         nome: 'Zest di limone',                  nomeEN: 'Lemon zest',                 groupName: 'ingredientiPrincipali', acquaPct: '80.0', grassiPct: '0.3', slngPct: '0',   zuccheri: {},                                altriSolidiPct: '10.0' },
  // FRUTTA E VERDURA
  { id: 'lampone',             nome: 'Lampone',                         nomeEN: 'Raspberry',                  groupName: 'fruttaVerdura',  acquaPct: '86.0', grassiPct: '0.7',  slngPct: '0',    zuccheri: { fruttosio: 4.9, saccarosio: 1.1 }, altriSolidiPct: '3.5', minPct: '40', maxPct: '80' },
  { id: 'fragola',             nome: 'Fragola',                         nomeEN: 'Strawberry',                 groupName: 'fruttaVerdura',  acquaPct: '90.0', grassiPct: '0.3',  slngPct: '0',    zuccheri: { fruttosio: 4.3, saccarosio: 1.0 }, altriSolidiPct: '1.5', minPct: '40', maxPct: '80' },
  { id: 'mango',               nome: 'Mango',                           nomeEN: 'Mango',                      groupName: 'fruttaVerdura',  acquaPct: '83.0', grassiPct: '0.4',  slngPct: '0',    zuccheri: { fruttosio: 4.7, saccarosio: 8.9 }, altriSolidiPct: '1.2', minPct: '40', maxPct: '80' },
  { id: 'limone-frutto',       nome: 'Limone (frutto intero)',          nomeEN: 'Lemon (whole fruit)',        groupName: 'fruttaVerdura',  acquaPct: '89.0', grassiPct: '0.3',  slngPct: '0',    zuccheri: { fruttosio: 1.4, saccarosio: 0.4 }, altriSolidiPct: '3.5' },
  { id: 'cocco-polpa',         nome: 'Cocco polpa fresca',              nomeEN: 'Fresh coconut pulp',         groupName: 'fruttaVerdura',  acquaPct: '47.0', grassiPct: '33.0', slngPct: '0',    zuccheri: { saccarosio: 5.0 },                  altriSolidiPct: '9.0', minPct: '20', maxPct: '60' },
  { id: 'passion-fruit',       nome: 'Passion fruit (maracuja)',        nomeEN: 'Passion fruit',              groupName: 'fruttaVerdura',  acquaPct: '73.0', grassiPct: '0.7',  slngPct: '0',    zuccheri: { fruttosio: 7.0, saccarosio: 4.6 }, altriSolidiPct: '3.5', minPct: '30', maxPct: '70' },
  { id: 'pesca',               nome: 'Pesca',                           nomeEN: 'Peach',                      groupName: 'fruttaVerdura',  acquaPct: '87.0', grassiPct: '0.1',  slngPct: '0',    zuccheri: { fruttosio: 4.3, saccarosio: 3.1 }, altriSolidiPct: '1.0', minPct: '40', maxPct: '70' },
  { id: 'mirtillo',            nome: 'Mirtillo',                        nomeEN: 'Blueberry',                  groupName: 'fruttaVerdura',  acquaPct: '84.0', grassiPct: '0.3',  slngPct: '0',    zuccheri: { fruttosio: 5.1, saccarosio: 2.1 }, altriSolidiPct: '2.5', minPct: '40', maxPct: '80' },
  { id: 'anguria',             nome: 'Anguria',                         nomeEN: 'Watermelon',                 groupName: 'fruttaVerdura',  acquaPct: '91.5', grassiPct: '0.1',  slngPct: '0',    zuccheri: { fruttosio: 4.1, saccarosio: 2.9 }, altriSolidiPct: '0.6', minPct: '40', maxPct: '80' },
  { id: 'mora',                nome: 'Mora',                            nomeEN: 'Blackberry',                 groupName: 'fruttaVerdura',  acquaPct: '88.0', grassiPct: '0.5',  slngPct: '0',    zuccheri: { fruttosio: 3.5, saccarosio: 0.7 }, altriSolidiPct: '2.5' },
  // ALCOLICI
  { id: 'rum',                 nome: 'Rum',                             nomeEN: 'Rum',                        groupName: 'alcolici',       acquaPct: '60.0', grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '0',   minPct: '0', maxPct: '5' },
  { id: 'whisky',              nome: 'Whisky',                          nomeEN: 'Whisky',                     groupName: 'alcolici',       acquaPct: '60.0', grassiPct: '0',    slngPct: '0',    zuccheri: {},                                   altriSolidiPct: '0',   minPct: '0', maxPct: '5' },
  { id: 'liquore-limone',      nome: 'Limoncello',                      nomeEN: 'Limoncello',                 groupName: 'alcolici',       acquaPct: '50.0', grassiPct: '0',    slngPct: '0',    zuccheri: { saccarosio: 30.0 },                 altriSolidiPct: '0',   minPct: '0', maxPct: '5' },
  // ALIMENTARI TRITATI
  { id: 'biscotto-tritato',    nome: 'Biscotto tritato',                nomeEN: 'Crushed biscuit',            groupName: 'alimentiTritati', acquaPct: '4.0', grassiPct: '18.0', slngPct: '0',    zuccheri: { saccarosio: 35.0 },                 altriSolidiPct: '35.0', minPct: '0', maxPct: '15' },
  { id: 'granella-nocciola',   nome: 'Granella di nocciola',            nomeEN: 'Hazelnut pieces',            groupName: 'alimentiTritati', acquaPct: '3.0', grassiPct: '60.0', slngPct: '0.5',  zuccheri: {},                                   altriSolidiPct: '28.0', minPct: '0', maxPct: '15' },
  { id: 'granella-pistacchio', nome: 'Granella di pistacchio',          nomeEN: 'Pistachio pieces',           groupName: 'alimentiTritati', acquaPct: '3.0', grassiPct: '52.0', slngPct: '3.0',  zuccheri: {},                                   altriSolidiPct: '35.0', minPct: '0', maxPct: '15' },
] as const

const SYSTEM_RECIPES = [
  {
    id: 'default-fiordilatte',
    nome: 'Fiordilatte',
    profile: 'gelato',
    overrunPct: '35',
    thumbnail: '/recipes/fiordilatte.png',
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
    nome: 'Pistacchio',
    profile: 'gelato',
    overrunPct: '35',
    thumbnail: '/recipes/pistacchio.png',
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
    nome: 'Lampone',
    profile: 'sorbetto',
    overrunPct: '35',
    thumbnail: '/recipes/lampone.png',
    lines: [
      { ingredientId: 'carrube',    weightG: 3   },
      { ingredientId: 'saccarosio', weightG: 113 },
      { ingredientId: 'destrosio',  weightG: 84  },
      { ingredientId: 'acqua',      weightG: 259 },
      { ingredientId: 'inulina',    weightG: 12  },
      { ingredientId: 'lampone',    weightG: 498 },
      { ingredientId: 'limone',     weightG: 27  },
    ],
  },
  {
    id: 'default-crema',
    nome: 'Crema',
    profile: 'gelato',
    overrunPct: '35',
    thumbnail: '/recipes/crema.png',
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
    nome: 'Granita di Fragola',
    profile: 'granita',
    overrunPct: '0',
    thumbnail: '/recipes/granita-fragola.png',
    lines: [
      { ingredientId: 'acqua',      weightG: 350 },
      { ingredientId: 'saccarosio', weightG: 200 },
      { ingredientId: 'fragola',    weightG: 450 },
    ],
  },
]

export async function seedDatabase(): Promise<void> {
  console.log('Seeding database...')

  const existingIngredients = await db.select().from(systemIngredientsTable).limit(1)
  if (existingIngredients.length > 0) {
    console.log('Database already seeded, skipping ingredient seed.')
  } else {
    console.log(`Seeding ${SYSTEM_INGREDIENTS.length} system ingredients...`)
    for (const ing of SYSTEM_INGREDIENTS) {
      await db.insert(systemIngredientsTable).values({
        id: ing.id,
        nome: ing.nome,
        nomeEN: ing.nomeEN,
        groupName: ing.groupName,
        acquaPct: ing.acquaPct,
        grassiPct: ing.grassiPct,
        slngPct: ing.slngPct,
        altriSolidiPct: ing.altriSolidiPct,
        zuccheri: ing.zuccheri,
        minPct: 'minPct' in ing ? String((ing as { minPct?: string }).minPct ?? '') : undefined,
        maxPct: 'maxPct' in ing ? String((ing as { maxPct?: string }).maxPct ?? '') : undefined,
      }).onConflictDoNothing()
    }
    console.log('System ingredients seeded.')
  }

  const existingRecipes = await db.select().from(systemRecipesTable).limit(1)
  if (existingRecipes.length > 0) {
    console.log('System recipes already seeded, skipping.')
  } else {
    console.log(`Seeding ${SYSTEM_RECIPES.length} system recipes...`)
    for (const recipe of SYSTEM_RECIPES) {
      await db.insert(systemRecipesTable).values({
        id: recipe.id,
        nome: recipe.nome,
        profile: recipe.profile,
        overrunPct: recipe.overrunPct,
        thumbnail: recipe.thumbnail,
        lines: recipe.lines,
      }).onConflictDoNothing()
    }
    console.log('System recipes seeded.')
  }

  const existingAdmin = await db.select().from(usersTable).limit(1)
  if (existingAdmin.length === 0) {
    console.log(`Creating admin account: ${ADMIN_EMAIL}`)
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
    await db.insert(usersTable).values({
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
    }).onConflictDoNothing()
    console.log('Admin account created.')
    console.log(`  Email:    ${ADMIN_EMAIL}`)
    console.log(`  Password: ${ADMIN_PASSWORD}`)
    console.log('  → Please change the password after first login!')
  } else {
    console.log('Admin account already exists.')
  }

  console.log('Seeding complete.')
}
