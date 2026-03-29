import { useState } from "react";

type ProfileKey = "gelato" | "sorbetto" | "granita" | "vegan" | "gastronomico" | "custom1" | "custom2";
type ParamKey = "zuccheri" | "grassi" | "slng" | "altriSolidi" | "solidiTotali" | "pod" | "pac" | "frutta" | "alcolici" | "overrun" | "alimentiTritati";

interface Range { min: number; max: number }
type ProfileRanges = Record<ParamKey, Range>;

const PROFILES: ProfileKey[] = ["gelato", "sorbetto", "granita", "vegan", "gastronomico", "custom1", "custom2"];
const PARAMS: ParamKey[] = ["zuccheri","grassi","slng","altriSolidi","solidiTotali","pod","pac","frutta","alcolici","overrun","alimentiTritati"];

const PROFILE_LABELS: Record<ProfileKey, string> = {
  gelato: "Gelato", sorbetto: "Sorbetto", granita: "Granita",
  vegan: "Vegan", gastronomico: "Gastron.", custom1: "Custom 1", custom2: "Custom 2",
};
const PARAM_LABELS: Record<ParamKey, string> = {
  zuccheri: "Zuccheri", grassi: "Grassi", slng: "SLNG", altriSolidi: "Altri Sol.",
  solidiTotali: "Sol. Tot.", pod: "POD", pac: "PAC", frutta: "Frutta",
  alcolici: "Alcolici", overrun: "Overrun", alimentiTritati: "Alim. Trit.",
};
const PARAM_SCALE: Record<ParamKey, number> = {
  zuccheri:50, grassi:50, slng:20, altriSolidi:30, solidiTotali:60, pod:40, pac:50, frutta:80, alcolici:10, overrun:50, alimentiTritati:20,
};

const DEFAULTS: Record<ProfileKey, ProfileRanges> = {
  gelato:    { zuccheri:{min:16,max:22}, grassi:{min:5,max:12}, slng:{min:7.5,max:11.5}, altriSolidi:{min:0,max:5}, solidiTotali:{min:35,max:40}, pod:{min:16,max:20}, pac:{min:26,max:31}, frutta:{min:20,max:40}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  sorbetto:  { zuccheri:{min:20,max:32}, grassi:{min:0,max:4}, slng:{min:0,max:2}, altriSolidi:{min:0,max:5}, solidiTotali:{min:25,max:35}, pod:{min:17,max:25}, pac:{min:28,max:35}, frutta:{min:30,max:60}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  granita:   { zuccheri:{min:15,max:20}, grassi:{min:0,max:4}, slng:{min:0,max:2}, altriSolidi:{min:0,max:5}, solidiTotali:{min:15,max:25}, pod:{min:15,max:20}, pac:{min:12,max:17}, frutta:{min:30,max:60}, alcolici:{min:1,max:2}, overrun:{min:0,max:15}, alimentiTritati:{min:0,max:0} },
  vegan:     { zuccheri:{min:16,max:22}, grassi:{min:4,max:12}, slng:{min:0,max:0.5}, altriSolidi:{min:6,max:16}, solidiTotali:{min:35,max:40}, pod:{min:16,max:20}, pac:{min:26,max:31}, frutta:{min:30,max:60}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  gastronomico: { zuccheri:{min:14,max:22}, grassi:{min:4,max:15}, slng:{min:4,max:10}, altriSolidi:{min:0,max:15}, solidiTotali:{min:25,max:50}, pod:{min:5,max:12}, pac:{min:25,max:31}, frutta:{min:20,max:40}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  custom1:   { zuccheri:{min:0,max:100}, grassi:{min:0,max:100}, slng:{min:0,max:100}, altriSolidi:{min:0,max:100}, solidiTotali:{min:0,max:100}, pod:{min:0,max:100}, pac:{min:0,max:100}, frutta:{min:0,max:100}, alcolici:{min:0,max:100}, overrun:{min:0,max:100}, alimentiTritati:{min:0,max:100} },
  custom2:   { zuccheri:{min:0,max:100}, grassi:{min:0,max:100}, slng:{min:0,max:100}, altriSolidi:{min:0,max:100}, solidiTotali:{min:0,max:100}, pod:{min:0,max:100}, pac:{min:0,max:100}, frutta:{min:0,max:100}, alcolici:{min:0,max:100}, overrun:{min:0,max:100}, alimentiTritati:{min:0,max:100} },
};

function RangeBar({ range, scale, editing, onEdit, onUpdate }: {
  range: Range; scale: number; editing: boolean;
  onEdit: () => void; onUpdate: (r: Range) => void;
}) {
  const leftPct = Math.min(100, (range.min / scale) * 100);
  const widthPct = Math.min(100 - leftPct, ((range.max - range.min) / scale) * 100);

  if (editing) {
    return (
      <div className="flex items-center gap-1 px-1 py-0.5" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          type="number" value={range.min} step={0.5}
          onChange={e => onUpdate({ ...range, min: parseFloat(e.target.value) || 0 })}
          className="w-12 text-center text-xs font-mono px-1 py-0.5 rounded border border-[#C4622D] bg-white text-[#1A1A1A] focus:outline-none"
        />
        <span className="text-[10px] text-[#9B9590]">–</span>
        <input
          type="number" value={range.max} step={0.5}
          onChange={e => onUpdate({ ...range, max: parseFloat(e.target.value) || 0 })}
          className="w-12 text-center text-xs font-mono px-1 py-0.5 rounded border border-[#C4622D] bg-white text-[#1A1A1A] focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer px-1.5 py-2"
      onClick={onEdit}
      title={`${range.min} – ${range.max}`}
    >
      <div className="relative h-2 bg-[#E4DDD1] rounded-full overflow-hidden group-hover:bg-[#D9D3C8] transition-colors">
        <div
          className="absolute h-full bg-[#C4622D] opacity-50 group-hover:opacity-70 transition-opacity rounded-full"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
      </div>
      <div className="text-center text-[10px] text-[#9B9590] mt-0.5 group-hover:text-[#C4622D] transition-colors font-mono">
        {range.min}–{range.max}
      </div>
    </div>
  );
}

export function BarMatrix() {
  const [ranges, setRanges] = useState<Record<ProfileKey, ProfileRanges>>(
    JSON.parse(JSON.stringify(DEFAULTS))
  );
  const [editing, setEditing] = useState<{ param: ParamKey; profile: ProfileKey } | null>(null);

  function updateRange(profile: ProfileKey, param: ParamKey, range: Range) {
    setRanges(prev => ({ ...prev, [profile]: { ...prev[profile], [param]: range } }));
  }

  return (
    <div
      className="min-h-screen bg-[#F5F0E8] p-4 font-['Inter',sans-serif]"
      onClick={() => setEditing(null)}
    >
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Configurazione Range Target</h1>
        <p className="text-xs text-[#6B6560] mt-0.5">Clicca su una barra per modificare i valori. Il range è visualizzato in scala.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E4DDD1] bg-white shadow-sm">
        <table className="w-full border-collapse text-sm" style={{ minWidth: 720 }}>
          <thead>
            <tr className="bg-[#F5F0E8]">
              <th className="text-left px-3 py-3 text-xs font-bold uppercase tracking-widest text-[#6B6560] border-b border-r border-[#E4DDD1] sticky left-0 bg-[#F5F0E8]" style={{ width: 100 }}>
                Parametro
              </th>
              {PROFILES.map(p => (
                <th key={p} className="px-2 py-3 text-center border-b border-r border-[#E4DDD1] last:border-r-0">
                  <div className="text-xs font-semibold text-[#1A1A1A]">{PROFILE_LABELS[p]}</div>
                  <button
                    onClick={() => setRanges(prev => ({ ...prev, [p]: JSON.parse(JSON.stringify(DEFAULTS[p])) }))}
                    className="text-[10px] text-[#C4622D] mt-0.5 hover:underline"
                  >reset</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PARAMS.map((param, idx) => (
              <tr key={param} className={idx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"}>
                <td className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#6B6560] border-r border-[#E4DDD1] sticky left-0" style={{ background: idx % 2 === 0 ? 'white' : '#FDFCFA', letterSpacing: '0.05em' }}>
                  {PARAM_LABELS[param]}
                </td>
                {PROFILES.map(profile => (
                  <td key={profile} className={`border-r border-[#E4DDD1] last:border-r-0 ${editing?.param === param && editing?.profile === profile ? 'bg-[#FEF5E4]' : ''}`}>
                    <RangeBar
                      range={ranges[profile][param]}
                      scale={PARAM_SCALE[param]}
                      editing={editing?.param === param && editing?.profile === profile}
                      onEdit={() => setEditing({ param, profile })}
                      onUpdate={(r) => updateRange(profile, param, r)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#9B9590] mt-3 text-center">Clicca su una barra per modificare · Le barre mostrano il range relativo alla scala massima del parametro</p>
    </div>
  );
}
