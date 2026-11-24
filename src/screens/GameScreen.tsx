import React, { useEffect } from "react";
import { useGameStore } from "../store/gameStore.ts";
import { Highway } from "../components/Highway.tsx";
import { Hand } from "../components/Hand.tsx";
import { DrawPiles } from "../components/DrawPiles.tsx";
import { GuessModal } from "../components/GuessModal.tsx";
import { ManhuntModal } from "../components/ManhuntModal.tsx";
import { CaseFile } from "../components/CaseFile.tsx";
import { TutorialModal } from "../components/TutorialModal.tsx";
import { SettingsModal } from "../components/SettingsModal.tsx";
import { StatsModal } from "../components/StatsModal.tsx";
import { EndScreen } from "./EndScreen.tsx";

export const GameScreen: React.FC = () => {
  const {
    gameState,
    humanRole,
    difficulty,
    hintsEnabled,
    soundEnabled,
    peekEnabled,
    animationSpeed,
    pendingHideout,
    pendingSprintCards,
    pendingGuesses,
    isAITurn,
    aiThinkingMessage,
    stats,
    activeModal,
    setScreen,
    openModal,
    closeModal,
    toggleHints,
    toggleSound,
    togglePeek,
    setAnimationSpeed,
    setDifficulty,
    selectPendingHideout,
    togglePendingSprint,
    clearPendingPlacement,
    commitFugitivePlacement,
    commitFugitivePass,
    commitFugitiveDraw,
    commitMarshalDraw,
    togglePendingGuess,
    clearPendingGuesses,
    commitMarshalGuess,
    commitManhuntDecision,
    commitManhuntGuess,
    processAITurnIfNeeded,
  } = useGameStore();

  // If game is over, render the EndScreen
  if (gameState.phase === "game_over") {
    return <EndScreen />;
  }

  const lastHighwaySlot = gameState.highway[gameState.highway.length - 1];
  const lastHighwayCard = lastHighwaySlot ? lastHighwaySlot.card : 0;

  // Determine if human Fugitive needs to draw
  const isHumanFugitiveTurn =
    humanRole === "fugitive" && gameState.phase === "fugitive_turn";
  const needsFugitiveDraw =
    isHumanFugitiveTurn &&
    gameState.turnNumber > 1 &&
    gameState.fugitiveDrawCountThisTurn < 1;
  const canFugitivePlaceOrPass =
    isHumanFugitiveTurn && (!needsFugitiveDraw || gameState.turnNumber === 1);

  // Determine if human Marshal needs to draw
  const isHumanMarshalTurn =
    humanRole === "marshal" && gameState.phase === "marshal_turn";
  const needsMarshalDraw =
    isHumanMarshalTurn && gameState.marshalDrawsRemaining > 0;

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-sandstone flex flex-col justify-between overflow-x-hidden">
      {/* Top Header */}
      <header className="bg-[#101626] border-b border-amber-900/40 px-4 py-2.5 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen("title")}
            className="text-xs font-bold text-sandstone/60 hover:text-sandstone transition-colors cursor-pointer"
          >
            ← Exit
          </button>
          <div className="h-4 w-px bg-sandstone/20" />
          <h1
            className="text-xl font-black text-sandstone tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            FUGITIVE
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-amber-400 border border-amber-500/30">
            {humanRole === "fugitive" ? "Role: Fugitive" : "Role: Marshal"}
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono text-sandstone/60">
            AI: {difficulty}
          </span>
        </div>

        {/* Turn Phase Indicator */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-bold text-amber-300">
              TURN {gameState.turnNumber}
            </div>
            <div className="text-[10px] text-sandstone/70 uppercase">
              {gameState.phase === "fugitive_turn"
                ? "Fugitive Turn"
                : gameState.phase === "marshal_turn"
                ? "Marshal Turn"
                : gameState.phase === "manhunt"
                ? "Manhunt Active"
                : "Game Over"}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => openModal("casefile")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold cursor-pointer"
            title="Open Case Dossier"
          >
            📋 Dossier
          </button>
          <button
            onClick={() => openModal("tutorial")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold cursor-pointer"
            title="Rules & Guide"
          >
            📖 Rules
          </button>
          <button
            onClick={() => openModal("settings")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold cursor-pointer"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* AI Thinking / Status Banner */}
      {isAITurn && (
        <div className="bg-amber-950/70 border-b border-amber-800/60 py-1 px-4 text-center text-xs font-mono text-amber-300 flex items-center justify-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{aiThinkingMessage || "AI calculating tactical move..."}</span>
        </div>
      )}

      {/* Center Arena */}
      <main className="flex-1 flex flex-col justify-around py-2 max-w-7xl w-full mx-auto">
        {/* Highway Ribbon */}
        <section className="w-full my-auto">
          <Highway
            slots={gameState.highway}
            peekEnabled={peekEnabled}
            humanRole={humanRole}
            onSlotClick={() => {
              if (humanRole === "marshal" && isHumanMarshalTurn) {
                openModal("guess");
              }
            }}
          />
        </section>

        {/* Draw Phase Prompts */}
        {(needsFugitiveDraw || needsMarshalDraw) && (
          <section className="max-w-md mx-auto w-full px-4 my-2">
            <DrawPiles
              decks={gameState.decks}
              canDraw={true}
              drawCountRemaining={
                needsFugitiveDraw ? 1 : gameState.marshalDrawsRemaining
              }
              onDraw={(deck) => {
                if (humanRole === "fugitive") {
                  commitFugitiveDraw(deck);
                } else {
                  commitMarshalDraw(deck);
                }
              }}
            />
          </section>
        )}
      </main>

      {/* Bottom Tray: Player Hand */}
      <footer className="w-full z-10">
        <Hand
          hand={humanRole === "fugitive" ? gameState.fugitiveHand : gameState.marshalHand}
          humanRole={humanRole}
          lastHighwayCard={lastHighwayCard}
          pendingHideout={pendingHideout}
          pendingSprintCards={pendingSprintCards}
          hintsEnabled={hintsEnabled}
          canPlaceOrPass={canFugitivePlaceOrPass}
          onSelectPendingHideout={selectPendingHideout}
          onTogglePendingSprint={togglePendingSprint}
          onClearPending={clearPendingPlacement}
          onCommitPlacement={commitFugitivePlacement}
          onCommitPass={commitFugitivePass}
          onOpenGuessModal={() => openModal("guess")}
        />
      </footer>

      {/* Overlays / Modals */}
      {activeModal === "guess" && (
        <GuessModal
          highway={gameState.highway}
          marshalHand={gameState.marshalHand}
          guessedNumbers={gameState.guessedNumbers}
          selectedGuesses={pendingGuesses}
          onToggleGuess={togglePendingGuess}
          onClearGuesses={clearPendingGuesses}
          onConfirmGuess={commitMarshalGuess}
          onClose={closeModal}
        />
      )}

      {gameState.phase === "manhunt" && gameState.manhunt && (
        <ManhuntModal
          manhunt={gameState.manhunt}
          highway={gameState.highway}
          humanRole={humanRole}
          marshalHand={gameState.marshalHand}
          guessedNumbers={gameState.guessedNumbers}
          onMakeGuess={commitManhuntGuess}
          onInitiateManhunt={commitManhuntDecision}
          onClose={closeModal}
        />
      )}


    </div>
  );
};
