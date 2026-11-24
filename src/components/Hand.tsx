import React from "react";
import { Card } from "./Card.tsx";
import { canPlaceHideout } from "../engine/rules.ts";
import { getTotalSprint } from "../engine/sprint.ts";

export interface HandProps {
  hand: number[];
  humanRole: "fugitive" | "marshal";
  lastHighwayCard: number;
  pendingHideout: number | null;
  pendingSprintCards: number[];
  hintsEnabled: boolean;
  canPlaceOrPass: boolean;
  onSelectPendingHideout: (card: number) => void;
  onTogglePendingSprint: (card: number) => void;
  onClearPending: () => void;
  onCommitPlacement: () => void;
  onCommitPass: () => void;
  onOpenGuessModal?: () => void;
}

export const Hand: React.FC<HandProps> = ({
  hand,
  humanRole,
  lastHighwayCard,
  pendingHideout,
  pendingSprintCards,
  hintsEnabled,
  canPlaceOrPass,
  onSelectPendingHideout,
  onTogglePendingSprint,
  onClearPending,
  onCommitPlacement,
  onCommitPass,
  onOpenGuessModal,
}) => {
  // Placement validity calculation
  const placementCheck =
    pendingHideout !== null
      ? canPlaceHideout(lastHighwayCard, pendingHideout, pendingSprintCards)
      : null;

  const totalSprintProvided = getTotalSprint(pendingSprintCards);

  return (
    <div className="w-full bg-[#0D111A]/95 border-t border-amber-900/40 p-3 shadow-2xl relative backdrop-blur-md">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sandstone uppercase tracking-wider">
            {humanRole === "fugitive" ? "YOUR ESCAPE HAND" : "MARSHAL EVIDENCE DOSSIER"}
          </span>
          <span className="text-[11px] bg-black/50 px-2 py-0.5 rounded text-sandstone/70 font-mono">
            {hand.length} card{hand.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Action Controls for Fugitive */}
        {humanRole === "fugitive" && canPlaceOrPass && (
          <div className="flex items-center gap-2">
            {pendingHideout !== null && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-sandstone/90">
                  Jump <strong className="text-amber-400 font-mono">{lastHighwayCard}</strong> ➔{" "}
                  <strong className="text-[#E8743B] font-mono">{pendingHideout}</strong>
                  {pendingSprintCards.length > 0 && (
                    <span className="ml-1 text-amber-300 font-mono">
                      (+{totalSprintProvided} sprint)
                    </span>
                  )}
                </span>

                <button
                  onClick={onClearPending}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sandstone text-[11px] font-bold border border-slate-600 cursor-pointer"
                >
                  Clear
                </button>

                <button
                  disabled={!placementCheck?.valid}
                  onClick={onCommitPlacement}
                  className={`px-3 py-1 rounded font-bold text-xs uppercase tracking-wider border cursor-pointer ${
                    placementCheck?.valid
                      ? "bg-[#E8743B] hover:bg-[#E8743B]/90 text-black border-amber-300 shadow-md shadow-[#E8743B]/40 animate-pulse"
                      : "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                  }`}
                >
                  Place Hideout
                </button>
              </div>
            )}

            {pendingHideout === null && (
              <button
                onClick={onCommitPass}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sandstone text-xs font-bold border border-slate-600 cursor-pointer"
                title="Pass turn without placing a hideout (to build up your hand)"
              >
                Pass Turn
              </button>
            )}
          </div>
        )}

        {/* Action Controls for Marshal */}
        {humanRole === "marshal" && onOpenGuessModal && (
          <button
            onClick={onOpenGuessModal}
            className="px-3 py-1.5 rounded bg-[#D7263D] hover:bg-[#D7263D]/90 text-white font-bold text-xs uppercase tracking-wider border border-red-400 shadow-lg cursor-pointer"
          >
            🔍 Guess Hideouts
          </button>
        )}
      </div>

      {/* Cards in Hand */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-amber-700/50 scrollbar-track-black/40">
        {hand.length === 0 ? (
          <div className="py-6 w-full text-center text-sandstone/50 text-xs italic">
            Hand is empty
          </div>
        ) : (
          hand.map((cardNum) => {
            const isSelected = pendingHideout === cardNum;
            const isSprintSelected = pendingSprintCards.includes(cardNum);
            const isLegal =
              hintsEnabled &&
              humanRole === "fugitive" &&
              pendingHideout === null &&
              cardNum > lastHighwayCard;

            const handleCardClick = () => {
              if (humanRole !== "fugitive" || !canPlaceOrPass) return;

              if (pendingHideout === null) {
                // Select as hideout
                onSelectPendingHideout(cardNum);
              } else if (pendingHideout === cardNum) {
                // Deselect hideout
                onSelectPendingHideout(cardNum);
              } else {
                // Toggle as sprint card
                onTogglePendingSprint(cardNum);
              }
            };

            return (
              <div key={cardNum} className="flex-shrink-0">
                <Card
                  cardNumber={cardNum}
                  isRevealed={true}
                  isSelected={isSelected}
                  isSprintSelected={isSprintSelected}
                  isLegalCandidate={isLegal}
                  size="md"
                  onClick={canPlaceOrPass && humanRole === "fugitive" ? handleCardClick : undefined}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
