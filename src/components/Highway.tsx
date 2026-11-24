import React, { useRef } from "react";
import { motion } from "framer-motion";
import { HideoutSlot } from "../engine/types.ts";
import { Card } from "./Card.tsx";
import { getTotalSprint } from "../engine/sprint.ts";

export interface HighwayProps {
  slots: HideoutSlot[];
  peekEnabled: boolean;
  humanRole: "fugitive" | "marshal";
  onSlotClick?: (slotIndex: number) => void;
}

export const Highway: React.FC<HighwayProps> = ({
  slots,
  peekEnabled,
  humanRole,
  onSlotClick,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const highestRevealed = slots.reduce(
    (max, s) => (s.isRevealed && s.card > max ? s.card : max),
    0
  );

  return (
    <div className="w-full bg-[#0E131F]/90 border-y border-amber-900/30 py-3 px-4 shadow-xl relative backdrop-blur-sm">
      {/* Route Header Info */}
      <div className="flex items-center justify-between mb-2 px-1 text-xs text-sandstone/80">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#E8743B] uppercase tracking-wider flex items-center gap-1">
            <span>🏜️</span> HIGHWAY ESCAPE ROUTE
          </span>
          <span className="text-sandstone/40">|</span>
          <span>{slots.length} Hideouts on Highway</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] bg-black/40 px-2 py-0.5 rounded border border-sandstone/20">
            Highest Found: <strong className="text-amber-400 font-mono">{highestRevealed}</strong>
          </span>
          <span className="text-[11px] text-sandstone/60">
            Goal: <strong className="text-[#FFD166] font-mono">42 (State Line)</strong>
          </span>
        </div>
      </div>

      {/* Horizontal Highway Scroll Track */}
      <div
        ref={scrollRef}
        className="flex items-start gap-4 overflow-x-auto pb-3 pt-1 px-2 scrollbar-thin scrollbar-thumb-amber-700/50 scrollbar-track-black/40"
      >
        {slots.map((slot, index) => {
          const isStart = slot.slotIndex === 0;
          const isFinish = slot.card === 42;
          const sprintTotal = getTotalSprint(slot.sprintCards);

          return (
            <motion.div
              key={slot.slotIndex}
              initial={{ opacity: 0, scale: 0.85, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center flex-shrink-0 relative group"
            >
              {/* Slot Index Marker */}
              <div className="mb-1 text-[10px] font-mono font-bold tracking-tight text-sandstone/60 flex items-center gap-1">
                {isStart ? (
                  <span className="text-sky-400 font-bold">START (0)</span>
                ) : isFinish ? (
                  <span className="text-[#FFD166] font-bold">STATE LINE (42)</span>
                ) : (
                  <span>HIDEOUT #{slot.slotIndex}</span>
                )}
              </div>

              {/* Main Hideout Card */}
              <div className="relative">
                <Card
                  cardNumber={slot.card}
                  isRevealed={slot.isRevealed}
                  isPeeking={peekEnabled && !slot.isRevealed}
                  isStamped={slot.isRevealed && !isStart}
                  size="md"
                  onClick={
                    humanRole === "marshal" && !slot.isRevealed && onSlotClick
                      ? () => onSlotClick(slot.slotIndex)
                      : undefined
                  }
                  className={
                    humanRole === "marshal" && !slot.isRevealed
                      ? "hover:ring-2 hover:ring-[#D7263D] cursor-pointer"
                      : ""
                  }
                />

                {/* Road Marker Connector between cards */}
                {index < slots.length - 1 && (
                  <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-amber-500/30" />
                )}
              </div>

              {/* Sprint Cards Tucked Underneath */}
              {slot.sprintCards.length > 0 && (
                <div className="mt-1 flex flex-col items-center">
                  <div
                    className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/40 text-amber-300 font-mono shadow"
                    title={`Sprint Cards: ${slot.sprintCards.length} played (+${sprintTotal} extra distance)`}
                  >
                    <span>👟</span>
                    <span>
                      {slot.sprintRevealed || (peekEnabled && !slot.isRevealed)
                        ? `+${sprintTotal} (${slot.sprintCards.length})`
                        : `${slot.sprintCards.length} Sprint`}
                    </span>
                  </div>

                  {/* If revealed or peeking, preview the actual sprint cards */}
                  {(slot.sprintRevealed || (peekEnabled && !slot.isRevealed)) && (
                    <div className="flex -space-x-3 mt-1">
                      {slot.sprintCards.map((sprintNum, sIdx) => (
                        <div
                          key={sIdx}
                          className="w-7 h-10 bg-[#162032] border border-amber-600/40 rounded flex flex-col items-center justify-center text-[9px] font-bold text-amber-200 shadow"
                        >
                          <span>{sprintNum}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
