import { useState } from "react";
import { ChevronDown } from "lucide-react";

type ProfileKey = "gelato" | "sorbetto" | "granita" | "vegan" | "gastronomico" | "custom1" | "custom2";
type ParamKey = "zuccheri" | "grassi" | "slng" | "altriSolidi" | "solidiTotali" | "pod" | "pac" | "frutta" | "alcolici" | "overrun" | "alimentiTritati";

interface Range { min: number; max: number }
type ProfileRanges = Record<ParamKey, Range>;

const PROFILES: ProfileKey[] = ["gelato","sorbetto","granita","vegan","gastronomico","custom1","custom2"];
const PARAMS: ParamKey[] = ["zuccheri","grassi","slng","altriSolidi","solidiTotali","pod","pac","frutta","alcolici","overrun","alimentiTritati"];

const PROFILE_LABELS: Record<ProfileKey, string> = {
  gelato:"Gelato",sorbetto:"Sorbetto",granita:"Granita",vegan:"Vegan",gastronomico:"Gastron.",custom1:"Custom 1",custom2:"Custom 2",
};
const PARAM_META: Record<ParamKey, { label: string; desc: string; color: string; scaleMax: number }> = {
  zuccheri:      { label:"Zuccheri",     desc:"Totale zuccheri nella miscela",             color:"#C4622D", scaleMax:50  },
  grassi:        { label:"Grassi",       desc:"Contenuto in grassi",                        color:"#A87820", scaleMax:50  },
  slng:          { label:"SLNG",         desc:"Solidi del latte non grassi",               color:"#2D7A3A", scaleMax:20  },
  altriSolidi:   { label:"Altri Solidi", desc:"Solidi diversi da grassi/SLNG/zuccheri",    color:"#4A6D9B", scaleMax:30  },
  solidiTotali:  { label:"Sol. Totali",  desc:"Grassi + SLNG + Zuccheri + Altri Solidi",  color:"#7B4FBA", scaleMax:60  },
  pod:           { label:"POD",          desc:"Potere dolcificante",                        color:"#C4622D", scaleMax:40  },
  pac:           { label:"PAC",          desc:"Potere anticongelante",                      color:"#2D7A3A", scaleMax:50  },
  frutta:        { label:"Frutta",       desc:"Percentuale frutta o purea",                color:"#C4362D", scaleMax:80  },
  alcolici:      { label:"Alcolici",     desc:"Percentuale ingredienti alcolici",           color:"#9B6030", scaleMax:10  },
  overrun:       { label:"Overrun",      desc:"Incremento volume durante mantecazione",     color:"#4A6D9B", scaleMax:50  },
  alimentiTritati:{ label:"Alim. Tritati",desc:"Alimenti tritati nella miscela",            color:"#6B6560", scaleMax:20  },
};

const DEFAULTS: Record<ProfileKey, ProfileRanges> = {
  gelato:    { zuccheri:{min:16,max:22}, grassi:{min:5,max:12}, slng:{min:7.5,max:11.5}, altriSolidi:{min:0,max:5}, solidiTotali:{min:35,max:40}, pod:{min:16,max:20}, pac:{min:26,max:31}, frutta:{min:20,max:40}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  sorbetto:  { zuccheri:{min:20,max:32}, grassi:{min:0,max:4}, slng:{min:0,max:2}, altriSolidi:{min:0,max:5}, solidiTotali:{min:25,max:35}, pod:{min:17,max:25}, pac:{min:28,max:35}, frutta:{min:30,max:60}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  granita:   { zuccheri:{min:15,max:20}, grassi:{min:0,max:4}, slng:{min:0,max:2}, altriSolidi:{min:0,max:5}, solidiTotali:{min:15,max:25}, pod:{min:15,max:20}, pac:{min:12,max:17}, frutta:{min:30,max:60}, alcolici:{min:1,max:2}, overrun:{min:0,max:15}, alimentiTritati:{min:0,max:0} },
  vegan:     { zuccheri:{min:16,max:22}, grassi:{min:4,max:12}, slng:{min:0,max:0.5}, altriSolidi:{min:6,max:16}, solidiTotali:{min:35,max:40}, pod:{min:16,max:20}, pac:{min:26,max:31}, frutta:{min:30,max:60}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  gastronomico:{ zuccheri:{min:14,max:22}, grassi:{min:4,max:15}, slng:{min:4,max:10}, altriSolidi:{min:0,max:15}, solidiTotali:{min:25,max:50}, pod:{min:5,max:12}, pac:{min:25,max:31}, frutta:{min:20,max:40}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  custom1:   { zuccheri:{min:0,max:100}, grassi:{min:0,max:100}, slng:{min:0,max:100}, altriSolidi:{min:0,max:100}, solidiTotali:{min:0,max:100}, pod:{min:0,max:100}, pac:{min:0,max:100}, frutta:{min:0,max:100}, alcolici:{min:0,max:100}, overrun:{min:0,max:100}, alimentiTritati:{min:0,max:100} },
  custom2:   { zuccheri:{min:0,max:100}, grassi:{min:0,max:100}, slng:{min:0,max:100}, altriSolidi:{min:0,max:100}, solidiTotali:{min:0,max:100}, pod:{min:0,max:100}, pac:{min:0,max:100}, frutta:{min:0,max:100}, alcolici:{min:0,max:100}, overrun:{min:0,max:100}, alimentiTritati:{min:0,max:100} },
};

function MiniBar({ range, scale, color }: { range: Range; scale: number; color: string }) {
  const l = Math.min(100, (range.min / scale) * 100);
  const w = Math.min(100 - l, ((range.max - range.min) / scale) * 100);
  return (
    <div className="relative h-1.5 bg-[#E4DDD1] rounded-full overflow-hidden w-full">
      <div className="absolute h-full rounded-full opacity-60" style={{ left: `${l}%`, width: `${w}%`, background: color }} />
    </div>
  );
}

export function ParameterAccordion() {
  const [ranges, setRanges] = useState<Record<ProfileKey, ProfileRanges>>(JSON.parse(JSON.stringify(DEFAULTS)));
  const [expanded, setExpanded] = useState<Set<ParamKey>>(new Set(["zuccheri", "pac"]));

  function toggle(p: ParamKey) {
    setExpanded(prev => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; });
  }
  function updateRange(profile: ProfileKey, param: ParamKey, range: Range) {
    setRanges(prev => ({ ...prev, [profile]: { ...prev[profile], [param]: range } }));
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-4 font-['Inter',sans-serif]">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Configurazione Range Target</h1>
        <p className="text-xs text-[#6B6560] mt-0.5">Espandi un parametro per confrontare e modificare i range su tutti i profili.</p>
      </div>

      <div className="space-y-1.5">
        {PARAMS.map(param => {
          const meta = PARAM_META[param];
          const isOpen = expanded.has(param);
          return (
            <div key={param} className="bg-white rounded-xl border border-[#E4DDD1] overflow-hidden shadow-sm">
              {/* Accordion header */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FDFCFA] transition-colors"
                onClick={() => toggle(param)}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1A1A1A]">{meta.label}</span>
                    <span className="text-xs text-[#9B9590]">{meta.desc}</span>
                  </div>
                  {/* Mini comparison bars when collapsed */}
                  {!isOpen && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {PROFILES.slice(0, 5).map(p => (
                        <div key={p} className="flex-1">
                          <MiniBar range={ranges[p][param]} scale={meta.scaleMax} color={meta.color} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronDown
                  className="w-4 h-4 text-[#9B9590] shrink-0 transition-transform"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-[#F0EDE8] px-4 py-3 bg-[#FDFCFA]">
                  <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {PROFILES.map(profile => {
                      const range = ranges[profile][param];
                      return (
                        <div key={profile} className="text-center">
                          <div className="text-[10px] font-semibold text-[#6B6560] mb-1.5 uppercase tracking-wider">{PROFILE_LABELS[profile]}</div>
                          <MiniBar range={range} scale={meta.scaleMax} color={meta.color} />
                          <div className="flex gap-1 mt-2">
                            <input
                              type="number" value={range.min} step={0.5}
                              onChange={e => updateRange(profile, param, { ...range, min: parseFloat(e.target.value) || 0 })}
                              className="w-full text-center text-xs font-mono px-1 py-1 rounded border border-[#D9D3C8] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#C4622D]"
                            />
                            <input
                              type="number" value={range.max} step={0.5}
                              onChange={e => updateRange(profile, param, { ...range, max: parseFloat(e.target.value) || 0 })}
                              className="w-full text-center text-xs font-mono px-1 py-1 rounded border border-[#D9D3C8] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#C4622D]"
                            />
                          </div>
                          <button
                            onClick={() => updateRange(profile, param, DEFAULTS[profile][param])}
                            className="text-[10px] text-[#C4622D] mt-1 hover:underline"
                          >reset</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
