import React from "react";
import { motion } from "framer-motion";
import { CardGraphic, getCardMetadata } from "../art/cardSvgScenes.tsx";

export interface CardProps {
  cardNumber: number;
  isRevealed?: boolean;
  isPeeking?: boolean;
  isSelected?: boolean;
  isSprintSelected?: boolean;
  isLegalCandidate?: boolean;
  isStamped?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  cardNumber,
  isRevealed = true,
  isPeeking = false,
  isSelected = false,
  isSprintSelected = false,
  isLegalCandidate = false,
  isStamped = false,
  onClick,
  size = "md",
  className = "",
}) => {
  const meta = getCardMetadata(cardNumber);

  const sizeClasses = {
    sm: "w-20 h-28 text-xs",
    md: "w-28 h-40 text-sm",
    lg: "w-36 h-52 text-base",
  };

  const showFace = isRevealed || isPeeking;

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`relative select-none rounded-lg cursor-pointer transition-shadow shadow-md overflow-hidden ${
        sizeClasses[size]
      } ${
        isSelected
          ? "ring-4 ring-[#E8743B] shadow-xl shadow-[#E8743B]/40"
          : isSprintSelected
          ? "ring-4 ring-[#C9A227] shadow-xl shadow-[#C9A227]/40"
          : isLegalCandidate
          ? "ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/20"
          : "hover:ring-1 hover:ring-sandstone/50"
      } ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* Front Face */}
      {showFace ? (
        <div
          className={`w-full h-full flex flex-col bg-[#141A29] border border-amber-900/40 rounded-lg p-1.5 relative ${
            isPeeking && !isRevealed ? "opacity-60 border-dashed border-amber-500" : ""
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between px-1 z-10">
            <span
              className={`font-black tracking-tight ${
                size === "sm" ? "text-base" : size === "md" ? "text-xl" : "text-2xl"
              } ${cardNumber === 42 ? "text-[#FFD166]" : "text-[#F2D3A0]"}`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {cardNumber}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-bold px-1 py-0.5 rounded bg-black/40 text-sandstone/80">
              {meta.deck === "START"
                ? "START"
                : meta.deck === "FINISH"
                ? "ESCAPE"
                : `DECK ${meta.deck}`}
            </span>
          </div>

          {/* SVG Illustration */}
          <div className="flex-1 my-1 rounded overflow-hidden relative shadow-inner bg-black/30">
            <CardGraphic cardNumber={cardNumber} className="w-full h-full object-cover" />
            {isPeeking && !isRevealed && (
              <div className="absolute inset-0 bg-indigo-950/40 flex items-center justify-center">
                <span className="text-[10px] font-bold text-amber-300 bg-black/70 px-1 rounded">
                  PEEK
                </span>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="flex items-end justify-between px-1 z-10">
            <div className="truncate mr-1">
              <p className="font-bold text-[#F2D3A0] text-[10px] truncate leading-tight">
                {meta.name}
              </p>
            </div>

            {/* Sprint footprint badge */}
            {meta.sprint > 0 && (
              <div
                className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-[#E8743B]/20 border border-[#E8743B]/40 text-[#E8743B] text-[10px] font-black"
                title={`Sprint Value: +${meta.sprint}`}
              >
                <span>+{meta.sprint}</span>
                <span className="text-[8px]">👟</span>
              </div>
            )}
          </div>

          {/* Red FOUND Rubber Stamp Overlay */}
          {isStamped && (
            <motion.div
              initial={{ scale: 2, opacity: 0, rotate: -25 }}
              animate={{ scale: 1, opacity: 0.92, rotate: -12 }}
              transition={{ type: "spring", damping: 14, stiffness: 220 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="border-4 border-[#D7263D] px-2 py-0.5 rounded text-[#D7263D] font-black uppercase tracking-widest text-base shadow-lg bg-black/40 backdrop-blur-[1px]">
                FOUND
              </div>
            </motion.div>
          )}

          {/* Staging Badge: SPRINT or HIDEOUT */}
          {isSelected && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-[#E8743B] text-black text-[9px] font-black px-1.5 py-0.2 rounded shadow uppercase tracking-wider z-20">
              HIDEOUT
            </div>
          )}
          {isSprintSelected && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-[#C9A227] text-black text-[9px] font-black px-1.5 py-0.2 rounded shadow uppercase tracking-wider z-20">
              SPRINT
            </div>
          )}
        </div>
      ) : (
        /* Back Face (Vintage Desert Noir Badge Motif) */
        <div className="w-full h-full bg-[#1B2A41] border-2 border-[#C9A227]/50 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          {/* Subtle geometric pattern background */}
          <div className="absolute inset-1 border border-sandstone/20 rounded flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border border-[#C9A227]/40 flex items-center justify-center rotate-45">
              <div className="w-8 h-8 border border-sandstone/30" />
            </div>
          </div>

          {/* Center Badge Icon */}
          <div className="z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#0E0E10] border border-[#C9A227] flex items-center justify-center text-[#C9A227] font-black text-xs shadow">
              ★
            </div>
            <span
              className="text-[#F2D3A0] font-black tracking-widest text-[11px] mt-1 uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              FUGITIVE
            </span>
          </div>

          {/* Corner Decors */}
          <span className="absolute top-1 left-1 text-[8px] text-[#C9A227]/60 font-mono">♠</span>
          <span className="absolute bottom-1 right-1 text-[8px] text-[#C9A227]/60 font-mono">♠</span>
        </div>
      )}
    </motion.div>
  );
};
