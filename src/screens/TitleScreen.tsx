import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore.ts";
import { AIDifficulty, PlayerRole } from "../engine/types.ts";

export const TitleScreen: React.FC = () => {
  const {
    startNewGame,
    difficulty,
    setDifficulty,
    openModal,
  } = useGameStore();

  const handleStart = (role: PlayerRole) => {
    startNewGame(role, difficulty);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0B0F19] text-sandstone flex flex-col items-center justify-between p-6 overflow-hidden">
      {/* Background Graphic Vignette */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E8743B]/20 via-[#1B2A41]/40 to-[#0B0F19]" />

      {/* Decorative Desert Skyline Silhouette */}
      <div className="absolute bottom-0 inset-x-0 h-48 pointer-events-none opacity-30">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full fill-black">
          <polygon points="0,200 0,140 180,90 320,130 500,70 680,120 820,80 1000,110 1000,200" />
        </svg>
      </div>

      {/* Top Bar with Secondary Actions */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8743B] animate-ping" />
          <span className="text-[11px] uppercase tracking-widest font-mono text-sandstone/70">
            DESERT NOIR • 1960s MANHUNT
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => openModal("tutorial")}
            className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 font-bold transition-all cursor-pointer"
          >
            📖 How To Play
          </button>
          <button
            onClick={() => openModal("stats")}
            className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 font-bold transition-all cursor-pointer"
          >
            🏆 Records
          </button>
          <button
            onClick={() => openModal("settings")}
            className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 font-bold transition-all cursor-pointer"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      {/* Main Hero & Title */}
      <main className="flex flex-col items-center text-center z-10 my-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#E8743B] font-bold">
            SOLO TACTICAL CARD GAME
          </span>
          <h1
            className="text-7xl md:text-9xl font-black text-sandstone tracking-wider leading-none mt-1 drop-shadow-2xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            FUGITIVE
          </h1>
          <p className="text-sm md:text-base text-sandstone/80 max-w-lg mx-auto mt-2 font-serif italic">
            Break jail at Card 0. Sprint through 42 secret hideouts. Cross the state line before the
            U.S. Marshal closes the dragnet.
          </p>
        </motion.div>

        {/* AI Opponent Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 w-full"
        >
          <label className="block text-xs uppercase tracking-widest font-bold text-sandstone/60 mb-2">
            SELECT AI OPPONENT
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { id: "rookie", name: "Rookie Deputy", desc: "Easy (Default)" },
                { id: "detective", name: "Detective", desc: "Probabilistic" },
                { id: "marshal", name: "U.S. Marshal", desc: "Expert Solver" },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id as AIDifficulty)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  difficulty === d.id
                    ? "bg-[#E8743B] text-black border-amber-300 font-black shadow-lg shadow-[#E8743B]/30 scale-102"
                    : "bg-slate-900/70 text-sandstone/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800"
                }`}
              >
                <div className="font-bold text-xs">{d.name}</div>
                <div className="text-[10px] opacity-75">{d.desc}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Play Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full"
        >
          <button
            onClick={() => handleStart("fugitive")}
            className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-[#E8743B] to-amber-600 hover:from-amber-500 hover:to-[#E8743B] text-black font-black text-lg uppercase tracking-wider shadow-xl shadow-[#E8743B]/25 border border-amber-300 transition-all hover:scale-102 cursor-pointer"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            🏃 PLAY AS FUGITIVE (ESCAPE)
          </button>

          <button
            onClick={() => handleStart("marshal")}
            className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-sandstone font-black text-lg uppercase tracking-wider shadow-lg border border-slate-700 transition-all hover:scale-102 cursor-pointer"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            ⭐ PLAY AS MARSHAL (HUNT)
          </button>
        </motion.div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-4xl text-center text-[11px] text-sandstone/40 z-10 pt-4 border-t border-sandstone/10">
        Based on the 2-player hidden movement card game by Tim Fowers • Solo Edition
      </footer>
    </div>
  );
};
