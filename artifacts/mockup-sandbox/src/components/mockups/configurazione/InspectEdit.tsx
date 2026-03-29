import { useState } from "react";
import { X, RotateCcw } from "lucide-react";

type ProfileKey = "gelato" | "sorbetto" | "granita" | "vegan" | "gastronomico" | "custom1" | "custom2";
type ParamKey = "zuccheri" | "grassi" | "slng" | "altriSolidi" | "solidiTotali" | "pod" | "pac" | "frutta" | "alcolici" | "overrun" | "alimentiTritati";

interface Range { min: number; max: number }
type ProfileRanges = Record<ParamKey, Range>;

const PROFILES: ProfileKey[] = ["gelato","sorbetto","granita","vegan","gastronomico","custom1","custom2"];
const PARAMS: ParamKey[] = ["zuccheri","grassi","slng","altriSolidi","solidiTotali","pod","pac","frutta","alcolici","overrun","alimentiTritati"];
const PROFILE_LABELS: Record<ProfileKey, string> = {
  gelato:"Gelato",sorbetto:"Sorbetto",granita:"Granita",vegan:"Vegan",gastronomico:"Gastronom.",custom1:"Custom 1",custom2:"Custom 2",
};
const PARAM_META: Record<ParamKey, { label: string; desc: string; unit: string; scaleMax: number; hint: string }> = {
  zuccheri:      { label:"Zuccheri",     desc:"Totale zuccheri nella miscela",              unit:"%",  scaleMax:50,  hint:"Target tipico gelato 16–22%: bilancia dolcezza e struttura." },
  grassi:        { label:"Grassi",       desc:"Contenuto in grassi totali",                 unit:"%",  scaleMax:50,  hint:"I grassi aumentano morbidezza e cremosità, ma abbassano la temperatura di servizio." },
  slng:          { label:"SLNG",         desc:"Solidi del latte non grassi",                unit:"%",  scaleMax:20,  hint:"Proteine + lattosio. Valori alti irrigidiscono la struttura." },
  altriSolidi:   { label:"Altri Solidi", desc:"Solidi non classificati altrove",            unit:"%",  scaleMax:30,  hint:"Cacao secco, fibre, amidi, neutri. Completano la struttura." },
  solidiTotali:  { label:"Sol. Totali",  desc:"Somma di tutti i solidi nella miscela",      unit:"%",  scaleMax:60,  hint:"Range 35–40% per gelato classico. Sotto 35%: gelato acquoso." },
  pod:           { label:"POD",          desc:"Potere dolcificante (saccarosio = 100)",     unit:"",   scaleMax:40,  hint:"Controlla la dolcezza percepita senza variare i solidi totali." },
  pac:           { label:"PAC",          desc:"Potere anticongelante (saccarosio = 100)",   unit:"",   scaleMax:50,  hint:"Determina la temperatura di servizio: T = −3.7 × PAC/100 °C." },
  frutta:        { label:"Frutta",       desc:"Percentuale frutta o purea di frutta",       unit:"%",  scaleMax:80,  hint:"La frutta porta acqua e zuccheri propri: sempre bilanciarli." },
  alcolici:      { label:"Alcolici",     desc:"Ingredienti alcolici nella miscela",         unit:"%",  scaleMax:10,  hint:"L'alcool abbassa il PAC e il punto di congelamento." },
  overrun:       { label:"Overrun",      desc:"Incremento di volume durante mantecazione",  unit:"%",  scaleMax:50,  hint:"35% = 100g miscela → 135g gelato. Granita: overrun = 0." },
  alimentiTritati:{ label:"Alim. Trit.", desc:"Inclusioni tritate nella miscela",           unit:"%",  scaleMax:20,  hint:"Gocce di cioccolato, frutta secca tritata, biscotto, ecc." },
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

function rangeWidth(r: Range) { return r.max - r.min; }
function rangeColor(r: Range, def: Range): string {
  const changed = Math.abs(r.min - def.min) > 0.1 || Math.abs(r.max - def.max) > 0.1;
  const width = rangeWidth(r);
  if (changed) return "#FEF5E4";
  if (width <= 5) return "#EEF7EF";
  if (width <= 15) return "#F5F0E8";
  return "#F5F0E8";
}

export function InspectEdit() {
  const [ranges, setRanges] = useState<Record<ProfileKey, ProfileRanges>>(JSON.parse(JSON.stringify(DEFAULTS)));
  const [selected, setSelected] = useState<{ profile: ProfileKey; param: ParamKey } | null>({ profile: "gelato", param: "zuccheri" });

  function updateRange(profile: ProfileKey, param: ParamKey, range: Range) {
    setRanges(prev => ({ ...prev, [profile]: { ...prev[profile], [param]: range } }));
    setSelected({ profile, param });
  }

  const sel = selected ? { range: ranges[selected.profile][selected.param], def: DEFAULTS[selected.profile][selected.param], meta: PARAM_META[selected.param] } : null;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col font-['Inter',sans-serif]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Configurazione Range Target</h1>
        <p className="text-xs text-[#6B6560] mt-0.5">Clicca su una cella per ispezionarla e modificarla nel pannello a destra.</p>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-0 flex-1" style={{ minHeight: 0 }}>
        {/* Left: Matrix overview */}
        <div className="flex-1 overflow-auto px-5 pb-5">
          <div className="rounded-xl border border-[#E4DDD1] bg-white shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-[#F5F0E8]">
                  <th className="text-left px-2 py-2.5 font-bold text-[#6B6560] border-b border-r border-[#E4DDD1] uppercase tracking-wider" style={{ fontSize: 9, width: 72 }}>Param.</th>
                  {PROFILES.map(p => (
                    <th key={p} className="px-1 py-2.5 text-center border-b border-r border-[#E4DDD1] last:border-r-0 font-semibold text-[#1A1A1A]" style={{ fontSize: 9 }}>
                      {PROFILE_LABELS[p].substring(0,6)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PARAMS.map(param => (
                  <tr key={param}>
                    <td className="px-2 py-1.5 font-semibold text-[#6B6560] border-r border-b border-[#E4DDD1] uppercase" style={{ fontSize: 9, letterSpacing: '0.04em' }}>
                      {PARAM_META[param].label}
                    </td>
                    {PROFILES.map(profile => {
                      const range = ranges[profile][param];
                      const def = DEFAULTS[profile][param];
                      const isSelected = selected?.profile === profile && selected?.param === param;
                      const changed = Math.abs(range.min - def.min) > 0.1 || Math.abs(range.max - def.max) > 0.1;
                      return (
                        <td
                          key={profile}
                          onClick={() => setSelected({ profile, param })}
                          className="border-r border-b border-[#E4DDD1] last:border-r-0 cursor-pointer transition-all"
                          style={{
                            background: isSelected ? '#FDE8DC' : changed ? '#FEF5E4' : 'white',
                            outline: isSelected ? '2px solid #C4622D' : 'none',
                            outlineOffset: '-2px',
                          }}
                        >
                          <div className="text-center py-1.5 px-1">
                            <div className="font-mono font-semibold" style={{ fontSize: 9, color: isSelected ? '#C4622D' : '#1A1A1A' }}>
                              {range.min}–{range.max}
                            </div>
                            {changed && <div style={{ fontSize: 7, color: '#A87820', fontWeight: 600 }}>MOD</div>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-[#9B9590] mt-2">Celle evidenziate in arancio = valori modificati dal default</p>
        </div>

        {/* Right: Edit panel */}
        {selected && sel ? (
          <div className="w-72 shrink-0 border-l border-[#E4DDD1] bg-white flex flex-col">
            {/* Panel header */}
            <div className="flex items-start justify-between px-4 py-3 border-b border-[#F0EDE8] bg-[#FDFCFA]">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#C4622D]">{sel.meta.label}</div>
                <div className="text-xs text-[#6B6560] mt-0.5">{PROFILE_LABELS[selected.profile]}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#9B9590] hover:text-[#1A1A1A] mt-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
              {/* Description */}
              <p className="text-xs text-[#6B6560] leading-relaxed">{sel.meta.hint}</p>

              {/* Range editor */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560] mb-2">Range target</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-[10px] text-[#9B9590] mb-1 text-center">Min</div>
                    <input
                      type="number"
                      value={sel.range.min}
                      step={0.5}
                      onChange={e => updateRange(selected.profile, selected.param, { ...sel.range, min: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono text-lg font-semibold px-2 py-2 rounded-lg border border-[#D9D3C8] bg-[#F5F0E8] text-[#1A1A1A] focus:outline-none focus:border-[#C4622D] transition-colors"
                    />
                  </div>
                  <div className="text-[#D9D3C8] font-semibold text-lg">–</div>
                  <div className="flex-1">
                    <div className="text-[10px] text-[#9B9590] mb-1 text-center">Max</div>
                    <input
                      type="number"
                      value={sel.range.max}
                      step={0.5}
                      onChange={e => updateRange(selected.profile, selected.param, { ...sel.range, max: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono text-lg font-semibold px-2 py-2 rounded-lg border border-[#D9D3C8] bg-[#F5F0E8] text-[#1A1A1A] focus:outline-none focus:border-[#C4622D] transition-colors"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-[#9B9590] text-right mt-1">{sel.meta.unit || 'valore relativo'}</div>
              </div>

              {/* Visual bar */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560] mb-2">Visualizzazione</div>
                <div className="relative h-3 bg-[#E4DDD1] rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-[#C4622D] opacity-50 rounded-full transition-all"
                    style={{
                      left: `${Math.min(100, (sel.range.min / sel.meta.scaleMax) * 100)}%`,
                      width: `${Math.min(100, ((sel.range.max - sel.range.min) / sel.meta.scaleMax) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#C4B8A8] mt-0.5">
                  <span>0</span><span>{sel.meta.scaleMax}{sel.meta.unit}</span>
                </div>
              </div>

              {/* Default comparison */}
              <div className="rounded-lg bg-[#F5F0E8] p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9B9590] mb-1">Valore predefinito</div>
                <div className="font-mono text-sm font-semibold text-[#6B6560]">
                  {sel.def.min} – {sel.def.max}
                  {(Math.abs(sel.range.min - sel.def.min) > 0.1 || Math.abs(sel.range.max - sel.def.max) > 0.1) && (
                    <span className="ml-2 text-[10px] text-[#A87820] font-medium">modificato</span>
                  )}
                </div>
              </div>

              {/* Reset button */}
              <button
                onClick={() => updateRange(selected.profile, selected.param, DEFAULTS[selected.profile][selected.param])}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#E4DDD1] text-xs font-medium text-[#6B6560] hover:bg-[#F5F0E8] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Ripristina default
              </button>

              {/* Other profiles for same param */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560] mb-2">
                  {sel.meta.label} negli altri profili
                </div>
                <div className="space-y-1.5">
                  {PROFILES.filter(p => p !== selected.profile).map(p => {
                    const r = ranges[p][selected.param];
                    return (
                      <button
                        key={p}
                        onClick={() => setSelected({ ...selected, profile: p })}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#F5F0E8] transition-colors"
                      >
                        <span className="text-xs text-[#6B6560] font-medium">{PROFILE_LABELS[p]}</span>
                        <span className="text-xs font-mono text-[#1A1A1A]">{r.min}–{r.max}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-72 shrink-0 border-l border-[#E4DDD1] bg-white flex items-center justify-center">
            <div className="text-center text-[#9B9590] px-6">
              <div className="text-3xl mb-2">↖</div>
              <div className="text-xs">Clicca una cella per ispezionarla</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
