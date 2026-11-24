import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore.ts";
import { Highway } from "../components/Highway.tsx";

export const EndScreen: React.FC = () => {
  const { gameState, humanRole, startNewGame, setScreen } = useGameStore();

  const isHumanWin = gameState.winner === humanRole;
  const isFugitiveWin = gameState.winner === "fugitive";

  const totalHideouts = gameState.highway.length - 1;
  const totalSprints = gameState.highway.reduce((sum, h) => sum + h.sprintCards.length, 0);

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-sandstone flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto text-center pt-4 pb-2"
      >
        <span className="text-xs uppercase tracking-widest font-mono text-sandstone/60">
          CASE RESOLUTION
        </span>

        <h1
          className={`text-5xl sm:text-7xl font-black uppercase tracking-wider leading-none mt-1 ${
            isHumanWin ? "text-emerald-400 drop-shadow-lg" : "text-[#D7263D] drop-shadow-lg"
          }`}
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {isFugitiveWin ? "FREEDOM ACROSS THE BORDER" : "APPREHENDED BY THE LAW"}
        </h1>

        <p className="text-sm sm:text-base text-sandstone/80 mt-2 max-w-lg mx-auto">
          {gameState.winReason || (isFugitiveWin ? "Fugitive escaped!" : "Marshal apprehended Fugitive!")}
        </p>
      </motion.div>

      {/* Full Highway Reveal Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-5xl mx-auto my-4 rounded-2xl overflow-hidden border border-amber-900/40 shadow-2xl"
      >
        <div className="bg-[#121929] px-4 py-2 border-b border-amber-900/30 flex items-center justify-between text-xs text-sandstone/80">
          <span className="font-bold uppercase tracking-wider text-[#E8743B]">
            FULL ESCAPE ROUTE REVEAL
          </span>
          <span className="text-sandstone/60">
            {totalHideouts} hideouts • {totalSprints} sprint cards
          </span>
        </div>

        {/* Highway with all cards revealed */}
        <Highway
          slots={gameState.highway.map((h) => ({
            ...h,
            isRevealed: true,
            sprintRevealed: true,
          }))}
          peekEnabled={false}
          humanRole={humanRole}
        />
      </motion.div>

      {/* Match Metrics Grid */}
      <div className="w-full max-w-2xl mx-auto grid grid-cols-3 gap-3 text-center my-2">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-2xl font-mono font-bold text-amber-400">
            {gameState.turnNumber}
          </span>
          <p className="text-[10px] uppercase font-bold text-sandstone/60 mt-1">Turns Taken</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-2xl font-mono font-bold text-amber-400">
            {totalHideouts}
          </span>
          <p className="text-[10px] uppercase font-bold text-sandstone/60 mt-1">Hideouts Placed</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-2xl font-mono font-bold text-amber-400">
            {totalSprints}
          </span>
          <p className="text-[10px] uppercase font-bold text-sandstone/60 mt-1">Sprints Played</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md mx-auto flex items-center gap-4 py-4">
        <button
          onClick={() => startNewGame()}
          className="flex-1 py-3 px-4 rounded-xl bg-[#E8743B] hover:bg-amber-600 text-black font-black text-sm uppercase tracking-wider shadow-lg border border-amber-300 transition-all hover:scale-102 cursor-pointer"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          🔄 Play Rematch
        </button>

        <button
          onClick={() => setScreen("title")}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-sandstone font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all hover:scale-102 cursor-pointer"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};
