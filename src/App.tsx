import React from "react";
import { useGameStore } from "./store/gameStore.ts";
import { TitleScreen } from "./screens/TitleScreen.tsx";
import { GameScreen } from "./screens/GameScreen.tsx";
import { EndScreen } from "./screens/EndScreen.tsx";
import { TutorialModal } from "./components/TutorialModal.tsx";
import { SettingsModal } from "./components/SettingsModal.tsx";
import { StatsModal } from "./components/StatsModal.tsx";
import { CaseFile } from "./components/CaseFile.tsx";

export const App: React.FC = () => {
  const {
    screen,
    gameState,
    activeModal,
    closeModal,
    difficulty,
    hintsEnabled,
    soundEnabled,
    peekEnabled,
    animationSpeed,
    setDifficulty,
    toggleHints,
    toggleSound,
    togglePeek,
    setAnimationSpeed,
    stats,
  } = useGameStore();

  let mainContent: React.ReactNode;
  if (screen === "title") {
    mainContent = <TitleScreen />;
  } else if (gameState.phase === "game_over" || screen === "game_over") {
    mainContent = <EndScreen />;
  } else {
    mainContent = <GameScreen />;
  }

  return (
    <>
      {mainContent}

      {/* Global Modals accessible from any screen */}
      {activeModal === "tutorial" && <TutorialModal onClose={closeModal} />}

      {activeModal === "settings" && (
        <SettingsModal
          difficulty={difficulty}
          hintsEnabled={hintsEnabled}
          soundEnabled={soundEnabled}
          peekEnabled={peekEnabled}
          animationSpeed={animationSpeed}
          onSetDifficulty={setDifficulty}
          onToggleHints={toggleHints}
          onToggleSound={toggleSound}
          onTogglePeek={togglePeek}
          onSetAnimationSpeed={setAnimationSpeed}
          onClose={closeModal}
        />
      )}

      {activeModal === "stats" && (
        <StatsModal stats={stats} onClose={closeModal} />
      )}

      {activeModal === "casefile" && (
        <CaseFile state={gameState} onClose={closeModal} />
      )}
    </>
  );
};

export default App;
