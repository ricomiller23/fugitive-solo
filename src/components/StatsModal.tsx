import React from "react";
import { motion } from "framer-motion";
import { GameStats } from "../store/gameStore.ts";

export interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round(((stats.fugitiveWins + stats.marshalWins) / stats.gamesPlayed) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-[#141A29] border border-amber-800/60 rounded-2xl p-5 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
          <h2
            className="text-2xl font-black text-sandstone uppercase tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            CAREER SERVICE RECORD
          </h2>
          <button
            onClick={onClose}
            aria-label="Close" className="text-sandstone/60 hover:text-sandstone text-xl font-bold px-2 py-1 rounded bg-black/40 hover:bg-black/60 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-black/40 border border-sandstone/10">
              <span className="text-2xl font-mono font-black text-[#E8743B]">
                {stats.gamesPlayed}
              </span>
              <p className="text-[10px] uppercase font-bold text-sandstone/60 mt-1">
                Games Played
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-sandstone/10">
              <span className="text-2xl font-mono font-black text-amber-400">
                {stats.currentStreak}
              </span>
              <p className="text-[10px] uppercase font-bold text-sandstone/60 mt-1">
                Current Streak
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-sandstone/10 space-y-2 text-xs">
            <div className="flex items-center justify-between text-sandstone/90">
              <span>Fugitive Escapes:</span>
              <strong className="text-emerald-400 font-mono">{stats.fugitiveWins}</strong>
            </div>
            <div className="flex items-center justify-between text-sandstone/90">
              <span>Marshal Apprehensions:</span>
              <strong className="text-sky-400 font-mono">{stats.marshalWins}</strong>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-amber-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sandstone text-xs font-bold border border-slate-600 cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
