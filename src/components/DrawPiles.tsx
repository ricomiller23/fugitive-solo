import React from "react";
import { DeckComposition, DeckName } from "../engine/types.ts";

export interface DrawPilesProps {
  decks: DeckComposition;
  canDraw: boolean;
  drawCountRemaining: number;
  onDraw: (deck: DeckName) => void;
}

export const DrawPiles: React.FC<DrawPilesProps> = ({
  decks,
  canDraw,
  drawCountRemaining,
  onDraw,
}) => {
  const deckDefs: { name: DeckName; label: string; range: string; color: string; border: string }[] = [
    {
      name: "A",
      label: "Lowlands",
      range: "4 - 14",
      color: "from-amber-900/60 to-amber-950/90",
      border: "border-amber-700/50",
    },
    {
      name: "B",
      label: "Badlands",
      range: "15 - 28",
      color: "from-orange-950/70 to-red-950/90",
      border: "border-orange-700/50",
    },
    {
      name: "C",
      label: "High Sierra",
      range: "29 - 41",
      color: "from-indigo-950/70 to-slate-950/90",
      border: "border-indigo-700/50",
    },
  ];

  return (
    <div className="flex flex-col items-center bg-[#101626]/80 p-3 rounded-xl border border-amber-900/30 shadow-lg">
      <div className="flex items-center justify-between w-full mb-2 px-1 text-xs text-sandstone/80">
        <span className="font-bold uppercase tracking-wider text-[#E8743B]">DRAW PILES</span>
        {canDraw && drawCountRemaining > 0 && (
          <span className="text-[11px] font-bold text-amber-300 animate-pulse bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/50">
            Draw {drawCountRemaining} card{drawCountRemaining > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        {deckDefs.map((d) => {
          const count = decks[d.name].length;
          const isClickable = canDraw && count > 0;

          return (
            <button
              key={d.name}
              disabled={!isClickable}
              onClick={() => onDraw(d.name)}
              className={`relative flex flex-col items-center justify-between p-2 rounded-lg border bg-gradient-to-b ${
                d.color
              } ${d.border} transition-all ${
                isClickable
                  ? "hover:scale-105 hover:border-amber-400 hover:shadow-lg cursor-pointer ring-1 ring-amber-500/30"
                  : "opacity-60 cursor-default"
              }`}
            >
              {/* Stack effect */}
              {count > 1 && (
                <div className="absolute -top-1 -right-1 w-full h-full rounded-lg border border-white/10 pointer-events-none -z-10 bg-black/40" />
              )}

              <div className="text-center">
                <span className="font-black text-lg text-sandstone" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  DECK {d.name}
                </span>
                <p className="text-[9px] text-sandstone/60 -mt-1 font-sans">{d.label}</p>
                <p className="text-[9px] text-amber-400 font-mono">{d.range}</p>
              </div>

              <div className="mt-2 text-center">
                <span className="text-sm font-mono font-bold text-sandstone bg-black/50 px-2 py-0.5 rounded">
                  {count} left
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
