import React, { useState } from "react";
import { motion } from "framer-motion";
import { GameState } from "../engine/state.ts";

export interface CaseFileProps {
  state: GameState;
  onClose: () => void;
}

export const CaseFile: React.FC<CaseFileProps> = ({ state, onClose }) => {
  const [tab, setTab] = useState<"grid" | "log">("grid");

  const revealedCards = new Set<number>();
  state.highway.forEach((s) => {
    if (s.isRevealed && s.card > 0) revealedCards.add(s.card);
  });
  const inMarshalHand = new Set<number>(state.marshalHand);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-[#141A29] border border-amber-800/60 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h2
                className="text-2xl font-black text-sandstone uppercase tracking-wider"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                U.S. MARSHAL CASE DOSSIER
              </h2>
              <p className="text-xs text-sandstone/70">
                Track evidence, eliminated cards, and highway activity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close" className="text-sandstone/60 hover:text-sandstone text-xl font-bold px-2 py-1 rounded bg-black/40 hover:bg-black/60 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-3">
          <button
            onClick={() => setTab("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer border ${
              tab === "grid"
                ? "bg-[#E8743B] text-black border-amber-300 shadow"
                : "bg-slate-800/80 text-sandstone/80 border-slate-700 hover:bg-slate-700"
            }`}
          >
            Evidence Grid (1–41)
          </button>

          <button
            onClick={() => setTab("log")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer border ${
              tab === "log"
                ? "bg-[#E8743B] text-black border-amber-300 shadow"
                : "bg-slate-800/80 text-sandstone/80 border-slate-700 hover:bg-slate-700"
            }`}
          >
            Activity Log ({state.history.length})
          </button>
        </div>

        {/* Body */}
        {tab === "grid" ? (
          <div className="flex-1 overflow-y-auto p-3 bg-black/40 rounded-xl border border-sandstone/10 scrollbar-thin scrollbar-thumb-amber-700/50">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] text-sandstone/70 border-b border-sandstone/10 pb-2">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-600 inline-block" />
                Found Hideout
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-sky-950 border border-sky-800 inline-block" />
                In Marshal Hand
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-950 border border-red-900 inline-block" />
                Raid Miss
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-800 border border-slate-600 inline-block" />
                Possible Hideout
              </span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
              {Array.from({ length: 41 }, (_, i) => i + 1).map((num) => {
                const isRevealed = revealedCards.has(num);
                const isInHand = inMarshalHand.has(num);
                const isMiss = state.guessedNumbers.has(num) && !isRevealed;

                let cardClass = "bg-slate-800/90 text-sandstone border-slate-600";
                let badge = "";

                if (isRevealed) {
                  cardClass = "bg-emerald-950 text-emerald-300 border-emerald-600";
                  badge = "FOUND";
                } else if (isInHand) {
                  cardClass = "bg-sky-950 text-sky-400 border-sky-800 line-through opacity-70";
                  badge = "HAND";
                } else if (isMiss) {
                  cardClass = "bg-red-950 text-red-400 border-red-900 line-through opacity-60";
                  badge = "MISS";
                }

                return (
                  <div
                    key={num}
                    className={`h-12 rounded border flex flex-col items-center justify-center font-mono font-bold text-xs ${cardClass}`}
                  >
                    <span>{num}</span>
                    {badge && <span className="text-[8px] font-sans -mt-0.5">{badge}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 bg-black/40 rounded-xl border border-sandstone/10 scrollbar-thin scrollbar-thumb-amber-700/50 space-y-2">
            {state.history.length === 0 ? (
              <p className="text-xs text-sandstone/50 italic text-center py-6">
                No activity recorded yet.
              </p>
            ) : (
              state.history.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-xs flex items-start justify-between ${
                    entry.isHit
                      ? "bg-emerald-950/40 border-emerald-700/50 text-emerald-200"
                      : entry.isHit === false
                      ? "bg-red-950/40 border-red-900/40 text-red-300"
                      : "bg-slate-900/60 border-slate-800 text-sandstone/90"
                  }`}
                >
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400 mr-2">
                      T{entry.turnNumber} {entry.player}:
                    </span>
                    <span>{entry.description}</span>
                  </div>
                  <span className="text-[10px] text-sandstone/40 ml-2 font-mono flex-shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 mt-3 border-t border-amber-900/40">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sandstone text-xs font-bold border border-slate-600 cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
};
