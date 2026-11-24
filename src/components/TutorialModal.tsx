import React, { useState } from "react";
import { motion } from "framer-motion";

export interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "1. THE CONFLICT",
      badge: "DESERT NOIR SHOWDOWN",
      content: (
        <div className="space-y-3 text-xs text-sandstone/90 leading-relaxed">
          <p>
            You broke out of County Jail at <strong className="text-sky-400">Card 0</strong> in the dead
            of night. Your objective: reach <strong className="text-[#FFD166]">Card 42 (State Line)</strong>{" "}
            across the desolate highway before the law catches up.
          </p>
          <div className="p-3 rounded-lg bg-black/40 border border-amber-900/40">
            <h4 className="font-bold text-amber-400 uppercase text-[11px] mb-1">Roles & Winning:</h4>
            <ul className="list-disc list-inside space-y-1 text-sandstone/80">
              <li>
                <strong>Fugitive:</strong> Escape by successfully placing Card 42 and surviving any
                potential Manhunt.
              </li>
              <li>
                <strong>Marshal:</strong> Uncover every placed hideout on the highway before the Fugitive
                escapes.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "2. HIDEOUT JUMPS",
      badge: "BASE MOVEMENT",
      content: (
        <div className="space-y-3 text-xs text-sandstone/90 leading-relaxed">
          <p>
            Every new hideout you establish must have a strictly higher number than the previous one.
          </p>
          <p>
            Your base travel distance is up to <strong className="text-amber-400">+3</strong> without
            needing any extra sprint cards:
          </p>
          <div className="p-3 rounded-lg bg-black/40 border border-sandstone/10 font-mono text-[11px] space-y-1">
            <div className="text-emerald-400">✓ Jump from 0 to 1, 2, or 3 (Legal, 0 sprint needed)</div>
            <div className="text-emerald-400">✓ Jump from 12 to 13, 14, or 15 (Legal, 0 sprint needed)</div>
            <div className="text-red-400">✗ Jump from 12 to 16 without sprint (Illegal: gap is 4)</div>
          </div>
        </div>
      ),
    },
    {
      title: "3. SPRINTING FOR DISTANCE",
      badge: "FOOTPRINTS ON THE HIGHWAY",
      content: (
        <div className="space-y-3 text-xs text-sandstone/90 leading-relaxed">
          <p>
            Need to make a bigger leap across the desert? You can tuck extra cards from your hand
            underneath your hideout as <strong className="text-[#E8743B]">Sprint Cards</strong>!
          </p>
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="p-2 rounded bg-amber-950/60 border border-amber-800 text-center">
              <span className="font-bold text-amber-300 text-sm">ODD CARDS</span>
              <p className="text-[10px] text-sandstone/80 mt-0.5">Provide <strong>+1 Sprint</strong> 👟</p>
            </div>
            <div className="p-2 rounded bg-amber-950/60 border border-amber-800 text-center">
              <span className="font-bold text-amber-300 text-sm">EVEN CARDS</span>
              <p className="text-[10px] text-sandstone/80 mt-0.5">Provide <strong>+2 Sprint</strong> 👟👟</p>
            </div>
          </div>
          <p className="text-[11px] text-amber-200/80">
            ⚠️ The Marshal can see <em>how many</em> sprint cards are tucked under each hideout, giving
            clues to how far you jumped! Card 42 cannot be played as a sprint card.
          </p>
        </div>
      ),
    },
    {
      title: "4. MARSHAL INVESTIGATIONS",
      badge: "SINGLE VS MULTI-GUESS",
      content: (
        <div className="space-y-3 text-xs text-sandstone/90 leading-relaxed">
          <p>
            Each turn, the Marshal draws cards to build evidence and then raids hideouts:
          </p>
          <div className="space-y-2">
            <div className="p-2 rounded bg-slate-900 border border-slate-700">
              <strong className="text-amber-400">Single Guess:</strong>
              <p className="text-[11px] text-sandstone/70 mt-0.5">
                Target one number. If it is on the highway, it flips face-up and any sprint cards under
                it are revealed!
              </p>
            </div>
            <div className="p-2 rounded bg-red-950/50 border border-red-800">
              <strong className="text-red-400">Multi-Guess (High Stakes):</strong>
              <p className="text-[11px] text-sandstone/70 mt-0.5">
                Target multiple numbers in one turn. <strong>All</strong> guessed numbers must be on the
                board; if even one is incorrect, <strong>nothing is revealed</strong>!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "5. STATE LINE & MANHUNT",
      badge: "THE FINAL CLIMAX",
      content: (
        <div className="space-y-3 text-xs text-sandstone/90 leading-relaxed">
          <p>
            When the Fugitive establishes <strong className="text-[#FFD166]">Card 42</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sandstone/80 text-[11px]">
            <li>
              If the highest revealed hideout is <strong className="text-emerald-400">30 or higher</strong>,
              the Fugitive escapes immediately!
            </li>
            <li>
              If the highest revealed hideout is <strong className="text-red-400">29 or lower</strong>,
              the Marshal triggers a high-speed <strong className="text-red-400 font-bold">MANHUNT</strong>!
            </li>
          </ul>
          <div className="p-2.5 rounded bg-black/50 border border-red-900/60 text-[11px] text-sandstone/80">
            <strong>Manhunt Rules:</strong> The Marshal must guess all unrevealed hideouts in order from
            lowest to highest. One wrong guess = Fugitive escapes! Uncover them all = Marshal arrest!
          </div>
        </div>
      ),
    },
    {
      title: "6. AI OPPONENT ROSTER",
      badge: "BALANCED DIFFICULTIES",
      content: (
        <div className="space-y-2.5 text-xs text-sandstone/90 leading-relaxed">
          <div className="p-2 rounded bg-slate-900 border border-slate-700">
            <span className="font-bold text-emerald-400">Rookie Deputy (Default):</span>
            <p className="text-[11px] text-sandstone/70">
              Guesses front-line hideouts with basic card logic. Never multi-guesses. Recommended for your first games.
            </p>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-700">
            <span className="font-bold text-amber-400">Detective:</span>
            <p className="text-[11px] text-sandstone/70">
              Solves candidate probability distributions based on sprint footprints, deck counts, and eliminated cards.
            </p>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-700">
            <span className="font-bold text-red-400">U.S. Marshal:</span>
            <p className="text-[11px] text-sandstone/70">
              Expert information solver. Calculates probability sequences and executes calculated multi-guesses when candidate bounds collapse.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#141A29] border border-amber-800/60 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8743B]">
              {current.badge}
            </span>
            <h2
              className="text-2xl font-black text-sandstone uppercase tracking-wider"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {current.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close" className="text-sandstone/60 hover:text-sandstone text-xl font-bold px-2 py-1 rounded bg-black/40 hover:bg-black/60 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-1">{current.content}</div>

        {/* Stepper Dots & Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-900/40">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  step === i ? "bg-[#E8743B] w-6" : "bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sandstone text-xs font-bold border border-slate-600 cursor-pointer"
              >
                Prev
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 rounded-lg bg-[#E8743B] hover:bg-[#E8743B]/90 text-black text-xs font-bold uppercase tracking-wider border border-amber-300 cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider border border-emerald-400 cursor-pointer"
              >
                Hit The Road
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
