import { create } from "zustand";
import {
  createInitialGameState,
  applyAction,
  canPlaceHideout,
} from "../engine/rules.ts";
import {
  GameState,
  projectToFugitiveView,
  projectToMarshalView,
} from "../engine/state.ts";
import {
  AIDifficulty,
  DeckName,
  GameAction,
  PlayerRole,
} from "../engine/types.ts";
import {
  chooseFugitiveInitialPlacement,
  chooseFugitiveDrawDeck,
  chooseFugitiveTurnAction,
} from "../engine/ai/fugitiveAI.ts";
import {
  chooseMarshalDrawDeck,
  chooseMarshalAction,
} from "../engine/ai/marshalAI.ts";
import { soundManager } from "../audio/soundManager.ts";

export interface GameStats {
  gamesPlayed: number;
  fugitiveWins: number;
  marshalWins: number;
  currentStreak: number;
}

const STATS_KEY = "fugitive_solo_stats_v1";

function loadSavedStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { gamesPlayed: 0, fugitiveWins: 0, marshalWins: 0, currentStreak: 0 };
}

function saveStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export interface GameStoreState {
  gameState: GameState;
  screen: "title" | "game" | "game_over";
  humanRole: PlayerRole;
  difficulty: AIDifficulty;
  hintsEnabled: boolean;
  soundEnabled: boolean;
  peekEnabled: boolean;
  animationSpeed: "normal" | "fast";

  // Pending Human Move (Staging area before committing)
  pendingHideout: number | null;
  pendingSprintCards: number[];
  pendingGuesses: number[];

  // Turn orchestration
  isAITurn: boolean;
  aiThinkingMessage: string | null;

  // Stats
  stats: GameStats;

  // Modals
  activeModal: "none" | "guess" | "manhunt" | "casefile" | "tutorial" | "settings" | "stats";

  // Actions
  startNewGame: (role?: PlayerRole, difficulty?: AIDifficulty) => void;
  setScreen: (screen: "title" | "game" | "game_over") => void;
  openModal: (modal: "guess" | "manhunt" | "casefile" | "tutorial" | "settings" | "stats") => void;
  closeModal: () => void;
  toggleHints: () => void;
  toggleSound: () => void;
  togglePeek: () => void;
  setAnimationSpeed: (speed: "normal" | "fast") => void;
  setDifficulty: (diff: AIDifficulty) => void;

  // Human Fugitive Actions
  selectPendingHideout: (card: number) => void;
  togglePendingSprint: (card: number) => void;
  clearPendingPlacement: () => void;
  commitFugitivePlacement: () => void;
  commitFugitivePass: () => void;
  commitFugitiveDraw: (deck: DeckName) => void;

  // Human Marshal Actions
  commitMarshalDraw: (deck: DeckName) => void;
  togglePendingGuess: (card: number) => void;
  clearPendingGuesses: () => void;
  commitMarshalGuess: () => void;
  commitManhuntDecision: (trigger: boolean) => void;
  commitManhuntGuess: (card: number) => void;

  // Turn advancement
  processAITurnIfNeeded: () => void;
  updateStatsAtGameEnd: (winner: PlayerRole) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: createInitialGameState(Date.now(), "fugitive", "rookie"),
  screen: "title",
  humanRole: "fugitive",
  difficulty: "rookie",
  hintsEnabled: true,
  soundEnabled: true,
  peekEnabled: false,
  animationSpeed: "normal",

  pendingHideout: null,
  pendingSprintCards: [],
  pendingGuesses: [],

  isAITurn: false,
  aiThinkingMessage: null,

  stats: loadSavedStats(),
  activeModal: "none",

  startNewGame: (role = get().humanRole, diff = get().difficulty) => {
    const seed = Date.now();
    const initialState = createInitialGameState(seed, role, diff);
    soundManager.playCardSlide();

    set({
      gameState: initialState,
      humanRole: role,
      difficulty: diff,
      screen: "game",
      pendingHideout: null,
      pendingSprintCards: [],
      pendingGuesses: [],
      isAITurn: false,
      aiThinkingMessage: null,
      activeModal: "none",
    });

    // If human is Marshal, AI Fugitive plays initial hideout on turn 1
    if (role === "marshal") {
      setTimeout(() => {
        get().processAITurnIfNeeded();
      }, 500);
    }
  },

  setScreen: (screen) => set({ screen }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: "none" }),

  toggleHints: () => set((s) => ({ hintsEnabled: !s.hintsEnabled })),
  toggleSound: () => {
    const nextMuted = soundManager.toggleMute();
    set({ soundEnabled: !nextMuted });
  },
  togglePeek: () => set((s) => ({ peekEnabled: !s.peekEnabled })),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  setDifficulty: (difficulty) => set({ difficulty }),

  selectPendingHideout: (card: number) => {
    const { pendingHideout } = get();
    soundManager.playCardSlide();
    if (pendingHideout === card) {
      set({ pendingHideout: null, pendingSprintCards: [] });
    } else {
      set({ pendingHideout: card, pendingSprintCards: [] });
    }
  },

  togglePendingSprint: (card: number) => {
    const { pendingSprintCards, pendingHideout } = get();
    if (!pendingHideout || card === pendingHideout || card === 42) return;

    soundManager.playCardSlide();
    if (pendingSprintCards.includes(card)) {
      set({ pendingSprintCards: pendingSprintCards.filter((c) => c !== card) });
    } else {
      set({ pendingSprintCards: [...pendingSprintCards, card] });
    }
  },

  clearPendingPlacement: () => {
    set({ pendingHideout: null, pendingSprintCards: [] });
  },

  commitFugitivePlacement: () => {
    const { gameState, pendingHideout, pendingSprintCards, humanRole } = get();
    if (humanRole !== "fugitive" || pendingHideout === null) return;

    // Check Turn 1 placement
    if (gameState.turnNumber === 1 && gameState.highway.length === 1) {
      // Placing initial hideout(s)
      const action: GameAction = {
        type: "FUGITIVE_INITIAL_PLACE",
        hideouts: [{ card: pendingHideout, sprintCards: pendingSprintCards }],
      };
      try {
        const next = applyAction(gameState, action);
        soundManager.playHideoutPlaced();
        set({
          gameState: next,
          pendingHideout: null,
          pendingSprintCards: [],
        });
        get().processAITurnIfNeeded();
      } catch (err) {
        console.error("Illegal initial placement:", err);
      }
      return;
    }

    // Normal turn placement
    const action: GameAction = {
      type: "FUGITIVE_PLACE",
      hideout: pendingHideout,
      sprintCards: pendingSprintCards,
    };

    try {
      const next = applyAction(gameState, action);
      soundManager.playHideoutPlaced();

      if (next.phase === "game_over") {
        if (next.winner === "fugitive") soundManager.playVictory();
        else soundManager.playDefeat();
        get().updateStatsAtGameEnd(next.winner!);
      }

      set({
        gameState: next,
        pendingHideout: null,
        pendingSprintCards: [],
      });

      get().processAITurnIfNeeded();
    } catch (err) {
      console.error("Illegal placement:", err);
    }
  },

  commitFugitivePass: () => {
    const { gameState, humanRole } = get();
    if (humanRole !== "fugitive") return;

    try {
      const next = applyAction(gameState, { type: "FUGITIVE_PASS" });
      soundManager.playCardSlide();
      set({
        gameState: next,
        pendingHideout: null,
        pendingSprintCards: [],
      });
      get().processAITurnIfNeeded();
    } catch (err) {
      console.error("Illegal pass:", err);
    }
  },

  commitFugitiveDraw: (deck: DeckName) => {
    const { gameState, humanRole } = get();
    if (humanRole !== "fugitive") return;

    try {
      const next = applyAction(gameState, {
        type: "DRAW_CARD",
        player: "fugitive",
        deck,
      });
      soundManager.playCardSlide();
      set({ gameState: next });
    } catch (err) {
      console.error("Failed fugitive draw:", err);
    }
  },

  commitMarshalDraw: (deck: DeckName) => {
    const { gameState, humanRole } = get();
    if (humanRole !== "marshal") return;

    try {
      const next = applyAction(gameState, {
        type: "DRAW_CARD",
        player: "marshal",
        deck,
      });
      soundManager.playCardSlide();
      set({ gameState: next });
    } catch (err) {
      console.error("Failed marshal draw:", err);
    }
  },

  togglePendingGuess: (card: number) => {
    const { pendingGuesses } = get();
    soundManager.playCardSlide();
    if (pendingGuesses.includes(card)) {
      set({ pendingGuesses: pendingGuesses.filter((c) => c !== card) });
    } else {
      set({ pendingGuesses: [...pendingGuesses, card].sort((a, b) => a - b) });
    }
  },

  clearPendingGuesses: () => {
    set({ pendingGuesses: [] });
  },

  commitMarshalGuess: () => {
    const { gameState, pendingGuesses, humanRole } = get();
    if (humanRole !== "marshal" || pendingGuesses.length === 0) return;

    let action: GameAction;
    if (pendingGuesses.length === 1) {
      action = { type: "MARSHAL_GUESS_SINGLE", guess: pendingGuesses[0] };
    } else {
      action = { type: "MARSHAL_GUESS_MULTI", guesses: pendingGuesses };
    }

    try {
      const next = applyAction(gameState, action);
      const isHit = next.history[0]?.isHit;
      if (isHit) {
        soundManager.playFoundStamp();
      } else {
        soundManager.playMiss();
      }

      if (next.phase === "game_over") {
        if (next.winner === "marshal") soundManager.playVictory();
        else soundManager.playDefeat();
        get().updateStatsAtGameEnd(next.winner!);
      }

      set({
        gameState: next,
        pendingGuesses: [],
        activeModal: "none",
      });

      get().processAITurnIfNeeded();
    } catch (err) {
      console.error("Illegal guess action:", err);
    }
  },

  commitManhuntDecision: (trigger: boolean) => {
    const { gameState } = get();
    try {
      const next = applyAction(gameState, { type: "TRIGGER_MANHUNT", trigger });
      if (trigger) {
        soundManager.playSiren();
      } else {
        soundManager.playDefeat();
        get().updateStatsAtGameEnd(next.winner!);
      }
      set({ gameState: next });
    } catch (err) {
      console.error("Manhunt trigger failed:", err);
    }
  },

  commitManhuntGuess: (card: number) => {
    const { gameState, humanRole } = get();
    if (humanRole !== "marshal") return;

    try {
      const next = applyAction(gameState, { type: "MANHUNT_GUESS", guess: card });
      const isHit = next.history[0]?.isHit;
      if (isHit) {
        soundManager.playFoundStamp();
      } else {
        soundManager.playMiss();
      }

      if (next.phase === "game_over") {
        if (next.winner === "marshal") soundManager.playVictory();
        else soundManager.playDefeat();
        get().updateStatsAtGameEnd(next.winner!);
      }

      set({ gameState: next });
      get().processAITurnIfNeeded();
    } catch (err) {
      console.error("Illegal manhunt guess:", err);
    }
  },

  processAITurnIfNeeded: () => {
    const { gameState, humanRole, difficulty, animationSpeed } = get();
    if (gameState.phase === "game_over") return;

    const delay = animationSpeed === "fast" ? 300 : 700;

    // Is it AI Marshal's turn?
    if (humanRole === "fugitive" && gameState.phase === "marshal_turn") {
      set({ isAITurn: true, aiThinkingMessage: "Marshal analyzing footprints..." });

      setTimeout(() => {
        const current = get().gameState;
        if (current.phase !== "marshal_turn") {
          set({ isAITurn: false, aiThinkingMessage: null });
          return;
        }

        // 1. Marshal draw if required
        if (current.marshalDrawsRemaining > 0) {
          const mView = projectToMarshalView(current);
          const deck = chooseMarshalDrawDeck(mView, difficulty);
          const next = applyAction(current, {
            type: "DRAW_CARD",
            player: "marshal",
            deck,
          });
          soundManager.playCardSlide();
          set({ gameState: next, aiThinkingMessage: `Marshal drew from Deck ${deck}` });

          setTimeout(() => {
            get().processAITurnIfNeeded();
          }, delay);
          return;
        }

        // 2. Marshal guess
        const mView = projectToMarshalView(current);
        const action = chooseMarshalAction(mView);
        const next = applyAction(current, action);
        const isHit = next.history[0]?.isHit;
        if (isHit) soundManager.playFoundStamp();
        else soundManager.playMiss();

        if (next.phase === "game_over") {
          if (next.winner === "fugitive") soundManager.playVictory();
          else soundManager.playDefeat();
          get().updateStatsAtGameEnd(next.winner!);
        }

        set({
          gameState: next,
          isAITurn: false,
          aiThinkingMessage: null,
        });
      }, delay);
      return;
    }

    // Is it AI Fugitive's turn?
    if (humanRole === "marshal" && gameState.phase === "fugitive_turn") {
      set({ isAITurn: true, aiThinkingMessage: "Fugitive planning next hideout..." });

      setTimeout(() => {
        const current = get().gameState;
        if (current.phase !== "fugitive_turn") {
          set({ isAITurn: false, aiThinkingMessage: null });
          return;
        }

        if (current.turnNumber === 1 && current.highway.length === 1) {
          // Turn 1 initial placement
          const initial = chooseFugitiveInitialPlacement(current.fugitiveHand, difficulty);
          const next = applyAction(current, {
            type: "FUGITIVE_INITIAL_PLACE",
            hideouts: initial.hideouts,
          });
          soundManager.playHideoutPlaced();
          set({
            gameState: next,
            isAITurn: false,
            aiThinkingMessage: null,
          });
          return;
        }

        // Subsequent turns: Fugitive draws 1 card
        if (current.fugitiveDrawCountThisTurn < 1) {
          const fView = projectToFugitiveView(current);
          const deck = chooseFugitiveDrawDeck(fView);
          const next = applyAction(current, {
            type: "DRAW_CARD",
            player: "fugitive",
            deck,
          });
          soundManager.playCardSlide();
          set({ gameState: next, aiThinkingMessage: `Fugitive drew from Deck ${deck}` });

          setTimeout(() => {
            get().processAITurnIfNeeded();
          }, delay);
          return;
        }

        // Fugitive places or passes
        const fView = projectToFugitiveView(current);
        const action = chooseFugitiveTurnAction(fView);
        const next = applyAction(current, action);
        soundManager.playHideoutPlaced();

        if (next.phase === "game_over") {
          if (next.winner === "marshal") soundManager.playVictory();
          else soundManager.playDefeat();
          get().updateStatsAtGameEnd(next.winner!);
        }

        set({
          gameState: next,
          isAITurn: false,
          aiThinkingMessage: null,
        });
      }, delay);
      return;
    }

    // AI Manhunt Handling
    if (gameState.phase === "manhunt") {
      if (humanRole === "fugitive") {
        // AI Marshal initiates manhunt
        if (!gameState.manhunt?.active) {
          soundManager.playSiren();
          const next = applyAction(gameState, { type: "TRIGGER_MANHUNT", trigger: true });
          set({ gameState: next });
          setTimeout(() => {
            get().processAITurnIfNeeded();
          }, delay);
          return;
        }

        // AI Marshal guesses during manhunt
        set({ isAITurn: true, aiThinkingMessage: "Marshal closing the dragnet..." });
        setTimeout(() => {
          const current = get().gameState;
          if (current.phase !== "manhunt") {
            set({ isAITurn: false, aiThinkingMessage: null });
            return;
          }
          const mView = projectToMarshalView(current);
          const action = chooseMarshalAction(mView);
          const next = applyAction(current, action);
          const isHit = next.history[0]?.isHit;
          if (isHit) soundManager.playFoundStamp();
          else soundManager.playMiss();

          if (next.phase === "game_over") {
            if (next.winner === "fugitive") soundManager.playVictory();
            else soundManager.playDefeat();
            get().updateStatsAtGameEnd(next.winner!);
          }

          set({
            gameState: next,
            isAITurn: false,
            aiThinkingMessage: null,
          });

          if (next.phase === "manhunt") {
            setTimeout(() => {
              get().processAITurnIfNeeded();
            }, delay);
          }
        }, delay + 400);
      }
    }
  },

  updateStatsAtGameEnd: (winner: PlayerRole) => {
    const { stats, humanRole } = get();
    const isHumanWin = winner === humanRole;
    const nextStats: GameStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      fugitiveWins: winner === "fugitive" ? stats.fugitiveWins + 1 : stats.fugitiveWins,
      marshalWins: winner === "marshal" ? stats.marshalWins + 1 : stats.marshalWins,
      currentStreak: isHumanWin ? stats.currentStreak + 1 : 0,
    };
    saveStats(nextStats);
    set({ stats: nextStats });
  },
}));

if (typeof window !== "undefined") {
  (window as any).__gameStore = useGameStore;
}
