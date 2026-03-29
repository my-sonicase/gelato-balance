/**
 * Seed script: creates admin account + seeds system ingredients and recipes.
 * Ingredients are kept in sync with DEFAULT_INGREDIENTS on the frontend.
 */
import { db, usersTable, systemIngredientsTable, systemRecipesTable } from '@workspace/db'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@gelato.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'

const SYSTEM_INGREDIENTS = [
  // LATTICINI & UOVA
  { id: 'latte-intero',          nome: 'Latte intero',                     nomeEN: 'Whole milk',                   groupName: 'latticiniUova', acquaPct: '87.2', grassiPct: '3.5',  slngPct: '8.7',  zuccheri: { lattosio: 4.8 },                             altriSolidiPct: '0.6' },
  { id: 'latte-parz-scremato',   nome: 'Latte parz. scremato',             nomeEN: 'Semi-skimmed milk',            groupName: 'latticiniUova', acquaPct: '89.0', grassiPct: '1.6',  slngPct: '8.9',  zuccheri: { lattosio: 4.8 },                             altriSolidiPct: '0.5' },
  { id: 'latte-scremato',        nome: 'Latte scremato',                   nomeEN: 'Skimmed milk',                 groupName: 'latticiniUova', acquaPct: '90.5', grassiPct: '0.1',  slngPct: '9.0',  zuccheri: { lattosio: 4.9 },                             altriSolidiPct: '0.5' },
  { id: 'panna-35',              nome: 'Panna 35%',                        nomeEN: 'Cream 35%',                    groupName: 'latticiniUova', acquaPct: '59.5', grassiPct: '35.0', slngPct: '5.0',  zuccheri: { lattosio: 2.9 },                             altriSolidiPct: '0.6' },
  { id: 'panna-38',              nome: 'Panna 38%',                        nomeEN: 'Cream 38%',                    groupName: 'latticiniUova', acquaPct: '57.0', grassiPct: '38.0', slngPct: '5.0',  zuccheri: { lattosio: 2.7 },                             altriSolidiPct: '0.3' },
  { id: 'burro',                 nome: 'Burro',                            nomeEN: 'Butter',                       groupName: 'latticiniUova', acquaPct: '15.8', grassiPct: '82.0', slngPct: '1.2',  zuccheri: {},                                            altriSolidiPct: '1.0' },
  { id: 'lps',                   nome: 'Latte in polvere scremato (LPS)', nomeEN: 'Skim milk powder (SMP)',        groupName: 'latticiniUova', acquaPct: '3.5',  grassiPct: '0.8',  slngPct: '95.0', zuccheri: { lattosio: 50.5 },                            altriSolidiPct: '0.7' },
  { id: 'lpi',                   nome: 'Latte in polvere intero (LPI)',   nomeEN: 'Whole milk powder (WMP)',       groupName: 'latticiniUova', acquaPct: '3.0',  grassiPct: '26.0', slngPct: '70.0', zuccheri: { lattosio: 36.5 },                            altriSolidiPct: '1.0' },
  { id: 'tuorlo',                nome: "Tuorlo d'uovo fresco",             nomeEN: 'Fresh egg yolk',               groupName: 'latticiniUova', acquaPct: '51.0', grassiPct: '31.0', slngPct: '0.0',  zuccheri: {},                                            altriSolidiPct: '18.0' },
  { id: 'albume',                nome: "Albume d'uovo fresco",             nomeEN: 'Fresh egg white',              groupName: 'latticiniUova', acquaPct: '88.0', grassiPct: '0.0',  slngPct: '0.0',  zuccheri: {},                                            altriSolidiPct: '12.0' },
  { id: 'ricotta',               nome: 'Ricotta intera',                   nomeEN: 'Whole ricotta',                groupName: 'latticiniUova', acquaPct: '71.0', grassiPct: '12.0', slngPct: '8.0',  zuccheri: { lattosio: 3.0 },                             altriSolidiPct: '6.0' },
  { id: 'mascarpone',            nome: 'Mascarpone',                       nomeEN: 'Mascarpone',                   groupName: 'latticiniUova', acquaPct: '44.0', grassiPct: '44.0', slngPct: '5.5',  zuccheri: { lattosio: 2.5 },                             altriSolidiPct: '4.0' },
  { id: 'yogurt',                nome: 'Yogurt intero',                    nomeEN: 'Whole yogurt',                 groupName: 'latticiniUova', acquaPct: '85.0', grassiPct: '3.5',  slngPct: '7.5',  zuccheri: { lattosio: 4.0 },                             altriSolidiPct: '0.0' },
  { id: 'formaggio-fresco',      nome: 'Formaggio fresco spalmabile',      nomeEN: 'Cream cheese',                 groupName: 'latticiniUova', acquaPct: '54.0', grassiPct: '34.0', slngPct: '6.5',  zuccheri: { lattosio: 2.7 },                             altriSolidiPct: '2.8' },
  { id: 'latte-condensato',      nome: 'Latte condensato zuccherato',      nomeEN: 'Sweetened condensed milk',     groupName: 'latticiniUova', acquaPct: '26.0', grassiPct: '8.5',  slngPct: '17.0', zuccheri: { saccarosio: 44.0 },                          altriSolidiPct: '4.5' },
  { id: 'panna-polvere',         nome: 'Panna in polvere',                 nomeEN: 'Cream powder',                 groupName: 'latticiniUova', acquaPct: '3.0',  grassiPct: '42.0', slngPct: '46.0', zuccheri: { lattosio: 25.0 },                            altriSolidiPct: '9.0' },

  // ZUCCHERI
  { id: 'saccarosio',            nome: 'Saccarosio',                       nomeEN: 'Sucrose',                      groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { saccarosio: 100 },           altriSolidiPct: '0', minPct: '8',  maxPct: '15' },
  { id: 'destrosio',             nome: 'Destrosio (Glucosio)',             nomeEN: 'Dextrose (Glucose)',            groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { destrosio: 100 },            altriSolidiPct: '0' },
  { id: 'fruttosio',             nome: 'Fruttosio',                        nomeEN: 'Fructose',                     groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { fruttosio: 100 },            altriSolidiPct: '0' },
  { id: 'zucchero-invertito',    nome: 'Zucchero Invertito',               nomeEN: 'Invert sugar',                 groupName: 'zuccheri', acquaPct: '23',  grassiPct: '0', slngPct: '0', zuccheri: { invertito: 75 },             altriSolidiPct: '2' },
  { id: 'miele',                 nome: 'Miele',                            nomeEN: 'Honey',                        groupName: 'zuccheri', acquaPct: '17',  grassiPct: '0', slngPct: '0', zuccheri: { miele: 80 },                 altriSolidiPct: '3' },
  { id: 'trealosio',             nome: 'Trealosio',                        nomeEN: 'Trehalose',                    groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { trealosio: 100 },            altriSolidiPct: '0' },
  { id: 'isofruttosio',          nome: 'Isofruttosio',                     nomeEN: 'Isofructose',                  groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { isofruttosio: 100 },         altriSolidiPct: '0' },
  { id: 'maltitolo',             nome: 'Maltitolo',                        nomeEN: 'Maltitol',                     groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { maltitolo: 100 },            altriSolidiPct: '0' },
  { id: 'sorbitolo',             nome: 'Sorbitolo',                        nomeEN: 'Sorbitol',                     groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { sorbitolo: 100 },            altriSolidiPct: '0' },
  { id: 'mannitolo',             nome: 'Mannitolo',                        nomeEN: 'Mannitol',                     groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { mannitolo: 100 },            altriSolidiPct: '0' },
  { id: 'xilitolo',              nome: 'Xilitolo',                         nomeEN: 'Xylitol',                      groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { xilitolo: 100 },             altriSolidiPct: '0' },
  { id: 'eritritolo',            nome: 'Eritritolo',                       nomeEN: 'Erythritol',                   groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { eritritolo: 100 },           altriSolidiPct: '0' },
  { id: 'tagatosio',             nome: 'Tagatosio',                        nomeEN: 'Tagatose',                     groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { tagatosio: 100 },            altriSolidiPct: '0' },
  { id: 'stevia',                nome: 'Stevia (estratto)',                 nomeEN: 'Stevia (extract)',              groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { stevia: 100 },               altriSolidiPct: '0' },
  { id: 'glicrizina',            nome: 'Glicrizina',                       nomeEN: 'Glycyrrhizin',                 groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { glicrizina: 100 },           altriSolidiPct: '0' },
  { id: 'glucosio-at-21de',      nome: 'Glucosio Atomizzato 21 DE',        nomeEN: 'Atomized glucose 21 DE',       groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { glucosioAt21DE: 100 },       altriSolidiPct: '0' },
  { id: 'glucosio-at-39de',      nome: 'Glucosio Atomizzato 39 DE',        nomeEN: 'Atomized glucose 39 DE',       groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { glucosioAt39DE: 100 },       altriSolidiPct: '0' },
  { id: 'glucosio-at-42de',      nome: 'Glucosio Atomizzato 42 DE',        nomeEN: 'Atomized glucose 42 DE',       groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { glucosioAt42DE: 100 },       altriSolidiPct: '0' },
  { id: 'glucosio-at-52de',      nome: 'Glucosio Atomizzato 52 DE',        nomeEN: 'Atomized glucose 52 DE',       groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { glucosioAt52DE: 100 },       altriSolidiPct: '0' },
  { id: 'maltodestrina-5de',     nome: 'Maltodestrina 5 DE',               nomeEN: 'Maltodextrin 5 DE',            groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { maltodestrina5DE: 100 },     altriSolidiPct: '0' },
  { id: 'maltodestrina-18de',    nome: 'Maltodestrina 18 DE',              nomeEN: 'Maltodextrin 18 DE',           groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { maltodestrina18DE: 100 },    altriSolidiPct: '0' },
  { id: 'maltodestrina-20de',    nome: 'Maltodestrina 20 DE',              nomeEN: 'Maltodextrin 20 DE',           groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { maltodestrina20DE: 100 },    altriSolidiPct: '0' },
  { id: 'lattosio-pure',         nome: 'Lattosio',                         nomeEN: 'Lactose',                      groupName: 'zuccheri', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: { lattosio: 100 },             altriSolidiPct: '0' },

  // NEUTRI & BASI
  { id: 'acqua',                 nome: 'Acqua',                            nomeEN: 'Water',                        groupName: 'neutriBasi', acquaPct: '100', grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '0' },
  { id: 'sale',                  nome: 'Sale marino',                      nomeEN: 'Sea salt',                     groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '0' },
  { id: 'neutro-gelato',         nome: 'Neutro per gelato',                nomeEN: 'Gelato stabilizer',            groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '100', minPct: '0.2', maxPct: '0.5' },
  { id: 'neutro-sorbetto',       nome: 'Neutro per sorbetto',              nomeEN: 'Sorbet stabilizer',            groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '100', minPct: '0.2', maxPct: '0.5' },
  { id: 'neutro-vegan',          nome: 'Neutro per gelato vegan',          nomeEN: 'Vegan gelato stabilizer',      groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '100', minPct: '0.2', maxPct: '0.5' },
  { id: 'carrube',               nome: 'Farina di semi di carrube',        nomeEN: 'Locust bean gum',              groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '100', minPct: '0.1', maxPct: '0.3' },
  { id: 'guar',                  nome: 'Guar',                             nomeEN: 'Guar gum',                     groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '100', minPct: '0.05', maxPct: '0.2' },
  { id: 'inulina',               nome: 'Inulina',                          nomeEN: 'Inulin',                       groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '100', minPct: '0.5', maxPct: '3.0' },
  { id: 'carragenina',           nome: 'Carragenina',                      nomeEN: 'Carrageenan',                  groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '100', minPct: '0.02', maxPct: '0.1' },
  { id: 'agar-agar',             nome: 'Agar agar',                        nomeEN: 'Agar agar',                    groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '100', minPct: '0.05', maxPct: '0.3' },
  { id: 'pectina',               nome: 'Pectina',                          nomeEN: 'Pectin',                       groupName: 'neutriBasi', acquaPct: '0',   grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '100', minPct: '0.1',  maxPct: '0.5' },

  // INGREDIENTI PRINCIPALI
  { id: 'cioccolato-fondente-70', nome: 'Cioccolato fondente 70%',        nomeEN: 'Dark chocolate 70%',           groupName: 'ingredientiPrincipali', acquaPct: '1.0',  grassiPct: '42.0', slngPct: '0.0', zuccheri: { saccarosio: 28.0 }, altriSolidiPct: '28.0' },
  { id: 'cioccolato-fondente-56', nome: 'Cioccolato fondente 56%',        nomeEN: 'Dark chocolate 56%',           groupName: 'ingredientiPrincipali', acquaPct: '1.0',  grassiPct: '33.0', slngPct: '0.0', zuccheri: { saccarosio: 40.0 }, altriSolidiPct: '25.0' },
  { id: 'cioccolato-latte',      nome: 'Cioccolato al latte',              nomeEN: 'Milk chocolate',               groupName: 'ingredientiPrincipali', acquaPct: '1.5',  grassiPct: '31.0', slngPct: '6.5', zuccheri: { saccarosio: 45.0 }, altriSolidiPct: '16.0' },
  { id: 'cacao-polvere',         nome: 'Cacao in polvere 22-24%',          nomeEN: 'Cocoa powder 22-24%',          groupName: 'ingredientiPrincipali', acquaPct: '3.0',  grassiPct: '22.0', slngPct: '0.0', zuccheri: {},                   altriSolidiPct: '74.0', minPct: '4',  maxPct: '12' },
  { id: 'pasta-pistacchio',      nome: 'Pasta di pistacchio',              nomeEN: 'Pistachio paste',              groupName: 'ingredientiPrincipali', acquaPct: '4.0',  grassiPct: '49.0', slngPct: '0.0', zuccheri: { saccarosio: 6.0 },  altriSolidiPct: '41.0', minPct: '5',  maxPct: '15' },
  { id: 'pasta-nocciola',        nome: 'Pasta di nocciola',                nomeEN: 'Hazelnut paste',               groupName: 'ingredientiPrincipali', acquaPct: '2.0',  grassiPct: '62.0', slngPct: '0.0', zuccheri: { saccarosio: 4.0 },  altriSolidiPct: '31.0', minPct: '5',  maxPct: '15' },
  { id: 'pasta-mandorla',        nome: 'Pasta di mandorla',                nomeEN: 'Almond paste',                 groupName: 'ingredientiPrincipali', acquaPct: '4.0',  grassiPct: '52.0', slngPct: '0.0', zuccheri: { saccarosio: 5.0 },  altriSolidiPct: '38.0', minPct: '5',  maxPct: '15' },
  { id: 'pasta-caffe',           nome: 'Pasta di caffè',                   nomeEN: 'Coffee paste',                 groupName: 'ingredientiPrincipali', acquaPct: '3.0',  grassiPct: '15.0', slngPct: '0.0', zuccheri: {},                   altriSolidiPct: '82.0' },
  { id: 'vaniglia',              nome: 'Estratto di vaniglia',             nomeEN: 'Vanilla extract',              groupName: 'ingredientiPrincipali', acquaPct: '50.0', grassiPct: '0.0',  slngPct: '0.0', zuccheri: {},                   altriSolidiPct: '50.0' },
  { id: 'torrone',               nome: 'Torrone granulato',                nomeEN: 'Nougat crumbles',              groupName: 'ingredientiPrincipali', acquaPct: '3.0',  grassiPct: '20.0', slngPct: '3.0', zuccheri: { saccarosio: 45.0 }, altriSolidiPct: '29.0' },
  { id: 'lemon-curd',            nome: 'Lemon curd',                       nomeEN: 'Lemon curd',                   groupName: 'ingredientiPrincipali', acquaPct: '28.0', grassiPct: '10.0', slngPct: '2.0', zuccheri: { saccarosio: 50.0 }, altriSolidiPct: '10.0' },
  { id: 'crema-marroni',         nome: 'Crema di marroni',                 nomeEN: 'Chestnut cream',               groupName: 'ingredientiPrincipali', acquaPct: '20.0', grassiPct: '2.0',  slngPct: '0.0', zuccheri: { saccarosio: 52.0 }, altriSolidiPct: '26.0' },

  // FRUTTA & VERDURA
  { id: 'fragola',               nome: 'Fragola fresca/purea',             nomeEN: 'Strawberry purée',             groupName: 'fruttaVerdura', acquaPct: '90.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 3.5, saccarosio: 2.0 }, altriSolidiPct: '4.5', minPct: '40', maxPct: '80' },
  { id: 'limone',                nome: 'Limone succo',                     nomeEN: 'Lemon juice',                  groupName: 'fruttaVerdura', acquaPct: '91.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 1.0, saccarosio: 0.5 }, altriSolidiPct: '7.5' },
  { id: 'mango',                 nome: 'Mango purea',                      nomeEN: 'Mango purée',                  groupName: 'fruttaVerdura', acquaPct: '83.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 6.0, saccarosio: 6.5 }, altriSolidiPct: '4.5', minPct: '40', maxPct: '80' },
  { id: 'lampone',               nome: 'Lampone purea',                    nomeEN: 'Raspberry purée',              groupName: 'fruttaVerdura', acquaPct: '87.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 4.5, saccarosio: 2.0 }, altriSolidiPct: '6.5', minPct: '40', maxPct: '80' },
  { id: 'passion',               nome: 'Frutto della passione purea',      nomeEN: 'Passion fruit purée',          groupName: 'fruttaVerdura', acquaPct: '85.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 6.0, saccarosio: 3.5 }, altriSolidiPct: '5.5', minPct: '30', maxPct: '70' },
  { id: 'banana',                nome: 'Banana',                           nomeEN: 'Banana',                       groupName: 'fruttaVerdura', acquaPct: '75.0', grassiPct: '0.3', slngPct: '0.0', zuccheri: { fruttosio: 4.9, saccarosio: 6.5 }, altriSolidiPct: '13.3', minPct: '30', maxPct: '70' },
  { id: 'pera',                  nome: 'Pera purea',                       nomeEN: 'Pear purée',                   groupName: 'fruttaVerdura', acquaPct: '84.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 6.0, saccarosio: 1.0 }, altriSolidiPct: '9.0', minPct: '40', maxPct: '80' },
  { id: 'pesca',                 nome: 'Pesca purea',                      nomeEN: 'Peach purée',                  groupName: 'fruttaVerdura', acquaPct: '86.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 2.0, saccarosio: 4.8 }, altriSolidiPct: '7.2', minPct: '40', maxPct: '80' },
  { id: 'arancia',               nome: 'Arancia succo',                    nomeEN: 'Orange juice',                 groupName: 'fruttaVerdura', acquaPct: '88.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 2.5, saccarosio: 4.2 }, altriSolidiPct: '5.3' },
  { id: 'ananas',                nome: 'Ananas purea',                     nomeEN: 'Pineapple purée',              groupName: 'fruttaVerdura', acquaPct: '86.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 2.5, saccarosio: 4.0 }, altriSolidiPct: '7.5' },
  { id: 'cocco',                 nome: 'Cocco purea',                      nomeEN: 'Coconut purée',                groupName: 'fruttaVerdura', acquaPct: '58.0', grassiPct: '22.0', slngPct: '0.0', zuccheri: { saccarosio: 4.5 }, altriSolidiPct: '15.5', minPct: '20', maxPct: '60' },
  { id: 'fico',                  nome: 'Fico purea',                       nomeEN: 'Fig purée',                    groupName: 'fruttaVerdura', acquaPct: '79.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 10.0, saccarosio: 2.0 }, altriSolidiPct: '9.0' },
  { id: 'melone',                nome: 'Melone purea',                     nomeEN: 'Melon purée',                  groupName: 'fruttaVerdura', acquaPct: '90.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 3.0, saccarosio: 3.5 }, altriSolidiPct: '3.5' },
  { id: 'albicocca',             nome: 'Albicocca purea',                  nomeEN: 'Apricot purée',                groupName: 'fruttaVerdura', acquaPct: '86.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 2.4, saccarosio: 4.0 }, altriSolidiPct: '7.6', minPct: '40', maxPct: '80' },
  { id: 'mora',                  nome: 'Mora purea',                       nomeEN: 'Blackberry purée',             groupName: 'fruttaVerdura', acquaPct: '88.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 3.5, saccarosio: 0.5 }, altriSolidiPct: '8.0', minPct: '40', maxPct: '80' },
  { id: 'ribes-nero',            nome: 'Ribes nero purea',                 nomeEN: 'Blackcurrant purée',           groupName: 'fruttaVerdura', acquaPct: '80.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 4.0, saccarosio: 3.0 }, altriSolidiPct: '13.0', minPct: '40', maxPct: '80' },
  { id: 'mirtillo',              nome: 'Mirtillo purea',                   nomeEN: 'Blueberry purée',              groupName: 'fruttaVerdura', acquaPct: '86.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 4.3, saccarosio: 2.7 }, altriSolidiPct: '7.0', minPct: '40', maxPct: '80' },
  { id: 'kiwi',                  nome: 'Kiwi purea',                       nomeEN: 'Kiwi purée',                   groupName: 'fruttaVerdura', acquaPct: '84.0', grassiPct: '0.5', slngPct: '0.0', zuccheri: { fruttosio: 4.5, saccarosio: 4.0 }, altriSolidiPct: '7.0' },
  { id: 'melograno',             nome: 'Melograno succo',                  nomeEN: 'Pomegranate juice',            groupName: 'fruttaVerdura', acquaPct: '85.0', grassiPct: '0.0', slngPct: '0.0', zuccheri: { fruttosio: 4.7, saccarosio: 5.0 }, altriSolidiPct: '5.3' },

  // ALCOLICI
  { id: 'vodka',                 nome: 'Vodka 40%',                        nomeEN: 'Vodka 40%',                    groupName: 'alcolici', acquaPct: '60', grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '0', minPct: '0', maxPct: '5' },
  { id: 'rum',                   nome: 'Rum 40%',                          nomeEN: 'Rum 40%',                      groupName: 'alcolici', acquaPct: '60', grassiPct: '0', slngPct: '0', zuccheri: {}, altriSolidiPct: '0', minPct: '0', maxPct: '5' },
  { id: 'limoncello',            nome: 'Limoncello',                       nomeEN: 'Limoncello',                   groupName: 'alcolici', acquaPct: '55', grassiPct: '0', slngPct: '0', zuccheri: { saccarosio: 30 }, altriSolidiPct: '0', minPct: '0', maxPct: '5' },

  // ALIMENTI TRITATI
  { id: 'nocciole-tritate',      nome: 'Nocciole tritate',                 nomeEN: 'Chopped hazelnuts',            groupName: 'alimentiTritati', acquaPct: '5',  grassiPct: '62', slngPct: '0', zuccheri: { saccarosio: 4 },  altriSolidiPct: '29', minPct: '0', maxPct: '15' },
  { id: 'gocce-cioccolato',      nome: 'Gocce di cioccolato',              nomeEN: 'Chocolate chips',              groupName: 'alimentiTritati', acquaPct: '1',  grassiPct: '33', slngPct: '0', zuccheri: { saccarosio: 40 }, altriSolidiPct: '25', minPct: '0', maxPct: '15' },
  { id: 'biscotto-tritato',      nome: 'Biscotto tritato',                 nomeEN: 'Crushed biscuit',              groupName: 'alimentiTritati', acquaPct: '3',  grassiPct: '20', slngPct: '2', zuccheri: { saccarosio: 25 }, altriSolidiPct: '50', minPct: '0', maxPct: '15' },
  { id: 'pistacchi-tritati',     nome: 'Pistacchi tritati',                nomeEN: 'Chopped pistachios',           groupName: 'alimentiTritati', acquaPct: '4',  grassiPct: '45', slngPct: '0', zuccheri: { saccarosio: 8 },  altriSolidiPct: '43', minPct: '0', maxPct: '15' },
]

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
