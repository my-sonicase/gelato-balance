import { useState } from "react";

type ProfileKey = "gelato" | "sorbetto" | "granita" | "vegan" | "gastronomico" | "custom1" | "custom2";
type ParamKey = "zuccheri" | "grassi" | "slng" | "altriSolidi" | "solidiTotali" | "pod" | "pac" | "frutta" | "alcolici" | "overrun" | "alimentiTritati";

interface Range { min: number; max: number }
type ProfileRanges = Record<ParamKey, Range>;

const PROFILE_LABELS: Record<ProfileKey, string> = {
  gelato: "Gelato", sorbetto: "Sorbetto", granita: "Granita",
  vegan: "Vegan", gastronomico: "Gastron.", custom1: "Custom 1", custom2: "Custom 2",
};

const PARAM_META: Record<ParamKey, { label: string; desc: string; unit: string; scaleMax: number }> = {
  zuccheri:      { label: "Zuccheri",        desc: "Totale zuccheri nella miscela",            unit: "%", scaleMax: 50  },
  grassi:        { label: "Grassi",           desc: "Contenuto in grassi",                      unit: "%", scaleMax: 50  },
  slng:          { label: "SLNG",             desc: "Solidi del latte non grassi",              unit: "%", scaleMax: 20  },
  altriSolidi:   { label: "Altri Solidi",     desc: "Solidi diversi da grassi, SLNG, zuccheri", unit: "%", scaleMax: 30  },
  solidiTotali:  { label: "Solidi Totali",    desc: "Grassi + SLNG + Zuccheri + Altri Solidi", unit: "%", scaleMax: 60  },
  pod:           { label: "POD",              desc: "Potere dolcificante (saccarosio = 100)",   unit: "",  scaleMax: 40  },
  pac:           { label: "PAC",              desc: "Potere anticongelante (saccarosio = 100)", unit: "",  scaleMax: 50  },
  frutta:        { label: "Frutta",           desc: "Percentuale frutta o purea di frutta",     unit: "%", scaleMax: 80  },
  alcolici:      { label: "Alcolici",         desc: "Percentuale ingredienti alcolici",         unit: "%", scaleMax: 10  },
  overrun:       { label: "Overrun",          desc: "Incremento volume durante mantecazione",   unit: "%", scaleMax: 50  },
  alimentiTritati: { label: "Alim. Tritati",  desc: "Alimenti tritati nella miscela",           unit: "%", scaleMax: 20  },
};

const PARAMS: ParamKey[] = ["zuccheri","grassi","slng","altriSolidi","solidiTotali","pod","pac","frutta","alcolici","overrun","alimentiTritati"];

const DEFAULTS: Record<ProfileKey, ProfileRanges> = {
  gelato:    { zuccheri:{min:16,max:22}, grassi:{min:5,max:12}, slng:{min:7.5,max:11.5}, altriSolidi:{min:0,max:5}, solidiTotali:{min:35,max:40}, pod:{min:16,max:20}, pac:{min:26,max:31}, frutta:{min:20,max:40}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  sorbetto:  { zuccheri:{min:20,max:32}, grassi:{min:0,max:4}, slng:{min:0,max:2}, altriSolidi:{min:0,max:5}, solidiTotali:{min:25,max:35}, pod:{min:17,max:25}, pac:{min:28,max:35}, frutta:{min:30,max:60}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  granita:   { zuccheri:{min:15,max:20}, grassi:{min:0,max:4}, slng:{min:0,max:2}, altriSolidi:{min:0,max:5}, solidiTotali:{min:15,max:25}, pod:{min:15,max:20}, pac:{min:12,max:17}, frutta:{min:30,max:60}, alcolici:{min:1,max:2}, overrun:{min:0,max:15}, alimentiTritati:{min:0,max:0} },
  vegan:     { zuccheri:{min:16,max:22}, grassi:{min:4,max:12}, slng:{min:0,max:0.5}, altriSolidi:{min:6,max:16}, solidiTotali:{min:35,max:40}, pod:{min:16,max:20}, pac:{min:26,max:31}, frutta:{min:30,max:60}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  gastronomico: { zuccheri:{min:14,max:22}, grassi:{min:4,max:15}, slng:{min:4,max:10}, altriSolidi:{min:0,max:15}, solidiTotali:{min:25,max:50}, pod:{min:5,max:12}, pac:{min:25,max:31}, frutta:{min:20,max:40}, alcolici:{min:1,max:2}, overrun:{min:33,max:35}, alimentiTritati:{min:5,max:10} },
  custom1:   { zuccheri:{min:0,max:100}, grassi:{min:0,max:100}, slng:{min:0,max:100}, altriSolidi:{min:0,max:100}, solidiTotali:{min:0,max:100}, pod:{min:0,max:100}, pac:{min:0,max:100}, frutta:{min:0,max:100}, alcolici:{min:0,max:100}, overrun:{min:0,max:100}, alimentiTritati:{min:0,max:100} },
  custom2:   { zuccheri:{min:0,max:100}, grassi:{min:0,max:100}, slng:{min:0,max:100}, altriSolidi:{min:0,max:100}, solidiTotali:{min:0,max:100}, pod:{min:0,max:100}, pac:{min:0,max:100}, frutta:{min:0,max:100}, alcolici:{min:0,max:100}, overrun:{min:0,max:100}, alimentiTritati:{min:0,max:100} },
};

function RangeRow({ param, range, onUpdate }: { param: ParamKey; range: Range; onUpdate: (r: Range) => void }) {
  const meta = PARAM_META[param];
  const scale = meta.scaleMax;
  const leftPct = (range.min / scale) * 100;
  const widthPct = Math.max(0, ((range.max - range.min) / scale) * 100);

  return (
    <div className="py-3 border-b border-[#E4DDD1] last:border-none">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-sm font-semibold text-[#1A1A1A]">{meta.label}</span>
          <span className="ml-2 text-xs text-[#9B9590]">{meta.desc}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <input
            type="number" value={range.min} step={0.5}
            onChange={e => onUpdate({ ...range, min: parseFloat(e.target.value) || 0 })}
            className="w-16 text-center text-xs font-mono px-1.5 py-1 rounded border border-[#D9D3C8] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#C4622D]"
          />
          <span className="text-xs text-[#9B9590]">–</span>
          <input
            type="number" value={range.max} step={0.5}
            onChange={e => onUpdate({ ...range, max: parseFloat(e.target.value) || 0 })}
            className="w-16 text-center text-xs font-mono px-1.5 py-1 rounded border border-[#D9D3C8] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#C4622D]"
          />
          <span className="text-xs text-[#9B9590] w-4">{meta.unit}</span>
        </div>
      </div>
      {/* Visual range bar */}
      <div className="relative h-2 bg-[#E4DDD1] rounded-full overflow-hidden">
        <div
          className="absolute h-full rounded-full bg-[#C4622D] opacity-30"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-[#C4622D] opacity-60 rounded"
          style={{ left: `${leftPct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-[#C4622D] opacity-60 rounded"
          style={{ left: `${Math.min(100, leftPct + widthPct)}%` }}
        />
      </div>
      <div className="flex justify-between mt-0.5 text-[10px] text-[#C4B8A8]">
        <span>0</span>
        <span>{scale}</span>
      </div>
    </div>
  );
}

export function ProfileCard() {
  const [activeProfile, setActiveProfile] = useState<ProfileKey>("gelato");
  const [ranges, setRanges] = useState<Record<ProfileKey, ProfileRanges>>(
    JSON.parse(JSON.stringify(DEFAULTS))
  );

  const PROFILES: ProfileKey[] = ["gelato", "sorbetto", "granita", "vegan", "gastronomico", "custom1", "custom2"];

  function updateRange(param: ParamKey, range: Range) {
    setRanges(prev => ({ ...prev, [activeProfile]: { ...prev[activeProfile], [param]: range } }));
  }
  function reset() {
    setRanges(prev => ({ ...prev, [activeProfile]: JSON.parse(JSON.stringify(DEFAULTS[activeProfile])) }));
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Configurazione Range Target</h1>
        <p className="text-sm text-[#6B6560] mt-0.5">Modifica un profilo alla volta con visualizzazione visiva dei range.</p>
      </div>

      {/* Profile tabs */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {PROFILES.map(p => (
          <button
            key={p}
            onClick={() => setActiveProfile(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeProfile === p
                ? "bg-[#C4622D] text-white shadow-sm"
                : "bg-[#EDE8DF] text-[#6B6560] hover:bg-[#E4DDD1]"
            }`}
          >
            {PROFILE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Parameter list card */}
      <div className="bg-white rounded-2xl border border-[#E4DDD1] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E4DDD1] bg-[#FDFCFA]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C4622D]" />
            <span className="font-semibold text-sm text-[#1A1A1A]">{PROFILE_LABELS[activeProfile]}</span>
            <span className="text-xs text-[#9B9590]">— 11 parametri</span>
          </div>
          <button
            onClick={reset}
            className="text-xs text-[#C4622D] font-medium px-3 py-1.5 rounded-lg border border-[#E4DDD1] hover:bg-[#F5F0E8] transition-colors"
          >
            Ripristina predefiniti
          </button>
        </div>

        {/* Parameter rows */}
        <div className="px-5 divide-y divide-[#F0EDE8]">
          {PARAMS.map(param => (
            <RangeRow
              key={param}
              param={param}
              range={ranges[activeProfile][param]}
              onUpdate={(r) => updateRange(param, r)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
