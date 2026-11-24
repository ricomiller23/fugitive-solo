import React, { useState } from "react";
import { motion } from "framer-motion";
import { HideoutSlot, ManhuntState } from "../engine/types.ts";

export interface ManhuntModalProps {
  manhunt: ManhuntState;
  highway: HideoutSlot[];
  humanRole: "fugitive" | "marshal";
  marshalHand: number[];
  guessedNumbers: Set<number>;
  onMakeGuess?: (num: number) => void;
  onInitiateManhunt?: (trigger: boolean) => void;
  onClose?: () => void;
}

export const ManhuntModal: React.FC<ManhuntModalProps> = ({
  manhunt,
  highway,
  humanRole,
  marshalHand,
  guessedNumbers,
  onMakeGuess,
  onInitiateManhunt,
  onClose,
}) => {
  const [selectedNum, setSelectedNum] = useState<number | null>(null);

  const unrevealedSlots = highway.filter((s) => s.slotIndex > 0 && s.card !== 42 && !s.isRevealed);
  const revealedSlots = highway.filter((s) => s.slotIndex > 0 && s.isRevealed);

  // If manhunt is not active yet (Marshal deciding whether to trigger)
  if (!manhunt.active && humanRole === "marshal" && onInitiateManhunt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg bg-[#141A29] border-2 border-[#D7263D] rounded-2xl p-6 shadow-2xl text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500 mx-auto flex items-center justify-center text-3xl mb-3 animate-pulse">
            🚨
          </div>
          <h2
            className="text-3xl font-black text-[#D7263D] uppercase tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            FUGITIVE AT THE STATE LINE!
          </h2>
          <p className="text-sm text-sandstone/80 my-3 leading-relaxed">
            The Fugitive has reached Card 42! But their highest found hideout was{" "}
            <strong className="text-amber-400 font-mono">
              #{manhunt.highestRevealedAtTrigger}
            </strong>{" "}
            (29 or lower). You have one final chance to catch them with an all-out{" "}
            <strong className="text-red-400">MANHUNT</strong>!
          </p>
          <p className="text-xs text-sandstone/60 mb-5">
            Rules: Guess unrevealed hideouts in order from lowest to highest. One wrong guess and
            the Fugitive escapes!
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onInitiateManhunt(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sandstone text-xs font-bold border border-slate-600 cursor-pointer"
            >
              Concede Escape
            </button>
            <button
              onClick={() => onInitiateManhunt(true)}
              className="px-6 py-2 rounded-lg bg-[#D7263D] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider border border-red-300 shadow-xl cursor-pointer animate-pulse"
            >
              SOUND SIRENS & START MANHUNT!
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-[#141A29] border-2 border-[#D7263D] rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-red-900/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-spin">🚨</span>
            <div>
              <h2
                className="text-2xl font-black text-[#D7263D] uppercase tracking-wider leading-none"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                ACTIVE MANHUNT IN PROGRESS
              </h2>
              <span className="text-xs text-sandstone/70">
                {unrevealedSlots.length} hideout{unrevealedSlots.length !== 1 ? "s" : ""} left to reveal
              </span>
            </div>
          </div>
        </div>

        {/* Progress meter */}
        <div className="my-3 p-3 rounded-xl bg-black/50 border border-red-900/40">
          <div className="flex items-center justify-between text-xs text-sandstone/80 mb-1">
            <span>Dragnet Progress</span>
            <span>
              {revealedSlots.length} / {highway.length - 1} found
            </span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
              style={{
                width: `${(revealedSlots.length / Math.max(1, highway.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* If human is Marshal: selection keypad */}
        {humanRole === "marshal" && onMakeGuess && (
          <div className="flex-1 overflow-y-auto p-2 bg-black/40 rounded-xl border border-sandstone/10">
            <p className="text-xs text-amber-300 font-bold mb-2">
              Select your next manhunt target (Lowest unrevealed hideout):
            </p>

            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
              {Array.from({ length: 41 }, (_, i) => i + 1).map((num) => {
                const isRevealed = revealedSlots.some((s) => s.card === num);
                const isInHand = marshalHand.includes(num);
                const isMiss = guessedNumbers.has(num) && !isRevealed;
                const isSelected = selectedNum === num;

                let btnClass = "bg-slate-800 text-sandstone hover:bg-slate-700 border-slate-600";
                let disabled = false;

                if (isRevealed) {
                  btnClass = "bg-emerald-950 text-emerald-300 border-emerald-600/40 line-through opacity-60";
                  disabled = true;
                } else if (isInHand) {
                  btnClass = "bg-sky-950 text-sky-400 border-sky-800/40 line-through opacity-50";
                  disabled = true;
                } else if (isMiss) {
                  btnClass = "bg-red-950 text-red-400 border-red-900/40 line-through opacity-50";
                  disabled = true;
                } else if (isSelected) {
                  btnClass = "bg-[#D7263D] text-white border-red-300 ring-2 ring-red-400 font-black shadow-lg";
                }

                return (
                  <button
                    key={num}
                    disabled={disabled}
                    onClick={() => setSelectedNum(num)}
                    className={`h-10 rounded border font-mono font-bold text-xs flex items-center justify-center cursor-pointer transition-all ${btnClass}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* If human is Fugitive: watching AI Marshal */}
        {humanRole === "fugitive" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin mb-3" />
            <p className="text-base font-bold text-sandstone mb-1">
              Marshal is scouring the highway...
            </p>
            <p className="text-xs text-sandstone/60">
              One false move by the Marshal and your escape across the state line is sealed!
            </p>
          </div>
        )}

        {/* Footer */}
        {humanRole === "marshal" && onMakeGuess && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-red-900/50">
            <span className="text-xs text-sandstone/70">
              Target:{" "}
              {selectedNum ? (
                <strong className="text-amber-400 font-mono text-sm">#{selectedNum}</strong>
              ) : (
                <span className="italic">None selected</span>
              )}
            </span>

            <button
              disabled={selectedNum === null}
              onClick={() => {
                if (selectedNum !== null) {
                  onMakeGuess(selectedNum);
                  setSelectedNum(null);
                }
              }}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider border cursor-pointer ${
                selectedNum !== null
                  ? "bg-[#D7263D] hover:bg-red-700 text-white border-red-300 shadow-lg animate-pulse"
                  : "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
              }`}
            >
              Strike Target!
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
