import React, { useState } from "react";
import { motion } from "framer-motion";
import { HideoutSlot } from "../engine/types.ts";

export interface GuessModalProps {
  highway: HideoutSlot[];
  marshalHand: number[];
  guessedNumbers: Set<number>;
  selectedGuesses: number[];
  onToggleGuess: (num: number) => void;
  onClearGuesses: () => void;
  onConfirmGuess: () => void;
  onClose: () => void;
}

export const GuessModal: React.FC<GuessModalProps> = ({
  highway,
  marshalHand,
  guessedNumbers,
  selectedGuesses,
  onToggleGuess,
  onClearGuesses,
  onConfirmGuess,
  onClose,
}) => {
  const [guessMode, setGuessMode] = useState<"single" | "multi">("single");

  // Track state of each card 1..41
  const revealedCards = new Set<number>();
  highway.forEach((s) => {
    if (s.isRevealed && s.card > 0) revealedCards.add(s.card);
  });

  const inHandCards = new Set<number>(marshalHand);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#141A29] border border-amber-800/50 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
          <div>
            <h2
              className="text-2xl font-black text-sandstone uppercase tracking-wider"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              INVESTIGATE HIDEOUT LOCATIONS
            </h2>
            <p className="text-xs text-sandstone/70">
              Select hideout numbers to raid. Sprints provide clues to distance.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close" className="text-sandstone/60 hover:text-sandstone text-xl font-bold px-2 py-1 rounded bg-black/40 hover:bg-black/60 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-3 my-3">
          <button
            onClick={() => {
              setGuessMode("single");
              if (selectedGuesses.length > 1) onClearGuesses();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer border ${
              guessMode === "single"
                ? "bg-[#E8743B] text-black border-amber-300 shadow"
                : "bg-slate-800/80 text-sandstone/80 border-slate-700 hover:bg-slate-700"
            }`}
          >
            Single Guess
          </button>

          <button
            onClick={() => setGuessMode("multi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer border ${
              guessMode === "multi"
                ? "bg-[#D7263D] text-white border-red-400 shadow"
                : "bg-slate-800/80 text-sandstone/80 border-slate-700 hover:bg-slate-700"
            }`}
          >
            Multi-Guess (High Risk)
          </button>

          <div className="text-[11px] text-sandstone/60 ml-auto">
            {guessMode === "multi" ? (
              <span className="text-amber-400 font-bold">
                ⚠️ All guesses must be correct, or none are revealed!
              </span>
            ) : (
              <span>Raid a single hideout location</span>
            )}
          </div>
        </div>

        {/* 1..41 Number Grid */}
        <div className="flex-1 overflow-y-auto p-2 rounded-xl bg-black/40 border border-sandstone/10 scrollbar-thin scrollbar-thumb-amber-700/50">
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
            {Array.from({ length: 41 }, (_, i) => i + 1).map((num) => {
              const isRevealed = revealedCards.has(num);
              const isInHand = inHandCards.has(num);
              const isMiss = guessedNumbers.has(num) && !isRevealed;
              const isSelected = selectedGuesses.includes(num);

              let statusClasses = "bg-slate-800/90 text-sandstone hover:bg-slate-700 border-slate-600";
              let disabled = false;

              if (isRevealed) {
                statusClasses = "bg-emerald-950/80 text-emerald-300 border-emerald-600/50 line-through opacity-70";
                disabled = true;
              } else if (isInHand) {
                statusClasses = "bg-sky-950/60 text-sky-400 border-sky-800/40 line-through opacity-50";
                disabled = true;
              } else if (isMiss) {
                statusClasses = "bg-red-950/40 text-red-400 border-red-900/40 line-through opacity-50";
                disabled = true;
              } else if (isSelected) {
                statusClasses =
                  guessMode === "single"
                    ? "bg-[#E8743B] text-black border-amber-300 ring-2 ring-amber-400 font-black shadow-lg"
                    : "bg-[#D7263D] text-white border-red-300 ring-2 ring-red-400 font-black shadow-lg";
              }

              const handleNumberClick = () => {
                if (disabled) return;
                if (guessMode === "single") {
                  if (isSelected) {
                    onClearGuesses();
                  } else {
                    onClearGuesses();
                    onToggleGuess(num);
                  }
                } else {
                  onToggleGuess(num);
                }
              };

              return (
                <button
                  key={num}
                  disabled={disabled}
                  onClick={handleNumberClick}
                  className={`h-11 rounded-lg border font-mono font-bold text-sm flex flex-col items-center justify-center transition-all cursor-pointer ${statusClasses}`}
                  title={
                    isRevealed
                      ? `Hideout ${num}: Already Found`
                      : isInHand
                      ? `Card ${num}: In your hand (cannot be on road)`
                      : isMiss
                      ? `Card ${num}: Previous miss`
                      : `Investigate Hideout ${num}`
                  }
                >
                  <span>{num}</span>
                  {isInHand && <span className="text-[8px] font-sans -mt-1 text-sky-400">HAND</span>}
                  {isRevealed && <span className="text-[8px] font-sans -mt-1 text-emerald-400">FOUND</span>}
                  {isMiss && <span className="text-[8px] font-sans -mt-1 text-red-400">MISS</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-amber-900/40">
          <div className="text-xs text-sandstone/80">
            Selected:{" "}
            {selectedGuesses.length === 0 ? (
              <span className="italic text-sandstone/50">None</span>
            ) : (
              <strong className="text-amber-400 font-mono">
                {selectedGuesses.join(", ")}
              </strong>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sandstone text-xs font-bold border border-slate-600 cursor-pointer"
            >
              Cancel
            </button>

            <button
              disabled={selectedGuesses.length === 0}
              onClick={onConfirmGuess}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                selectedGuesses.length > 0
                  ? "bg-[#E8743B] hover:bg-[#E8743B]/90 text-black border-amber-300 shadow-lg"
                  : "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
              }`}
            >
              Confirm Raid ({selectedGuesses.length})
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
