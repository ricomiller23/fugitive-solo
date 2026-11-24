import React from "react";
import { motion } from "framer-motion";
import { AIDifficulty } from "../engine/types.ts";

export interface SettingsModalProps {
  difficulty: AIDifficulty;
  hintsEnabled: boolean;
  soundEnabled: boolean;
  peekEnabled: boolean;
  animationSpeed: "normal" | "fast";
  onSetDifficulty: (diff: AIDifficulty) => void;
  onToggleHints: () => void;
  onToggleSound: () => void;
  onTogglePeek: () => void;
  onSetAnimationSpeed: (speed: "normal" | "fast") => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  difficulty,
  hintsEnabled,
  soundEnabled,
  peekEnabled,
  animationSpeed,
  onSetDifficulty,
  onToggleHints,
  onToggleSound,
  onTogglePeek,
  onSetAnimationSpeed,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#141A29] border border-amber-800/60 rounded-2xl p-5 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
          <h2
            className="text-2xl font-black text-sandstone uppercase tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            GAME OPTIONS & SETTINGS
          </h2>
          <button
            onClick={onClose}
            aria-label="Close" className="text-sandstone/60 hover:text-sandstone text-xl font-bold px-2 py-1 rounded bg-black/40 hover:bg-black/60 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="py-4 space-y-4 text-xs">
          {/* AI Difficulty */}
          <div>
            <label className="block text-sandstone/80 font-bold uppercase tracking-wider mb-1.5">
              AI Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "rookie", label: "Rookie", sub: "Easy (Default)" },
                  { id: "detective", label: "Detective", sub: "Medium" },
                  { id: "marshal", label: "U.S. Marshal", sub: "Hard" },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSetDifficulty(d.id)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    difficulty === d.id
                      ? "bg-[#E8743B] text-black border-amber-300 font-bold shadow"
                      : "bg-slate-800/80 text-sandstone/80 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  <div className="font-bold">{d.label}</div>
                  <div className="text-[10px] opacity-80">{d.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-sandstone/10">
            <div>
              <span className="font-bold text-sandstone">Audio & Sound FX</span>
              <p className="text-[10px] text-sandstone/60">Tactile card sounds and manhunt sirens</p>
            </div>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1 rounded text-xs font-bold border cursor-pointer ${
                soundEnabled
                  ? "bg-emerald-600 text-white border-emerald-400"
                  : "bg-slate-800 text-sandstone/50 border-slate-700"
              }`}
            >
              {soundEnabled ? "ON" : "MUTED"}
            </button>
          </div>

          {/* Hints Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-sandstone/10">
            <div>
              <span className="font-bold text-sandstone">Hints & Legal Glows</span>
              <p className="text-[10px] text-sandstone/60">Highlights legal jump candidate cards in hand</p>
            </div>
            <button
              onClick={onToggleHints}
              className={`px-3 py-1 rounded text-xs font-bold border cursor-pointer ${
                hintsEnabled
                  ? "bg-emerald-600 text-white border-emerald-400"
                  : "bg-slate-800 text-sandstone/50 border-slate-700"
              }`}
            >
              {hintsEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {/* Animation Speed */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-sandstone/10">
            <div>
              <span className="font-bold text-sandstone">AI Pace</span>
              <p className="text-[10px] text-sandstone/60">Adjust AI decision and transition timing</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSetAnimationSpeed("normal")}
                className={`px-2.5 py-1 rounded text-xs font-bold border cursor-pointer ${
                  animationSpeed === "normal"
                    ? "bg-[#E8743B] text-black border-amber-300 font-bold"
                    : "bg-slate-800 text-sandstone/70 border-slate-700"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => onSetAnimationSpeed("fast")}
                className={`px-2.5 py-1 rounded text-xs font-bold border cursor-pointer ${
                  animationSpeed === "fast"
                    ? "bg-[#E8743B] text-black border-amber-300 font-bold"
                    : "bg-slate-800 text-sandstone/70 border-slate-700"
                }`}
              >
                Fast
              </button>
            </div>
          </div>

          {/* Peek Mode (Debug/Learning) */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-sandstone/10">
            <div>
              <span className="font-bold text-sandstone">Peeking Mode (Study)</span>
              <p className="text-[10px] text-sandstone/60">Semi-transparent peek at hidden hideouts</p>
            </div>
            <button
              onClick={onTogglePeek}
              className={`px-3 py-1 rounded text-xs font-bold border cursor-pointer ${
                peekEnabled
                  ? "bg-amber-600 text-black border-amber-400 font-bold"
                  : "bg-slate-800 text-sandstone/50 border-slate-700"
              }`}
            >
              {peekEnabled ? "ACTIVE" : "OFF"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sandstone text-xs font-bold border border-slate-600 cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
