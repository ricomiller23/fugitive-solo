import {
  AIDifficulty,
  DeckComposition,
  DeckName,
  GamePhase,
  HideoutSlot,
  ManhuntState,
  PlayerRole,
  TurnLogEntry,
} from "./types.ts";

export interface DrawHistoryEntry {
  turnNumber: number;
  player: PlayerRole;
  deck: DeckName;
}

export interface GameState {
  seed: number;
  turnNumber: number;
  phase: GamePhase;
  playerRole: PlayerRole; // which role the human is playing
  difficulty: AIDifficulty;

  // Deck states (face-down draw piles)
  decks: DeckComposition;

  // Hands
  fugitiveHand: number[];
  marshalHand: number[];

  // Center row (highway)
  highway: HideoutSlot[];

  // Turn tracking
  fugitiveDrawCountThisTurn: number;
  marshalDrawsRemaining: number;
  fugitivePassCount: number;
  drawHistory: DrawHistoryEntry[];
  guessedNumbers: Set<number>; // all numbers ever guessed by Marshal

  // Manhunt
  manhunt: ManhuntState | null;

  // Logs & Game End
  history: TurnLogEntry[];
  winner: PlayerRole | null;
  winReason: string | null;
}

// ==================== INFORMATION-HIDING PROJECTIONS ====================

export interface PublicHideoutSlot {
  slotIndex: number;
  isRevealed: boolean;
  card: number | null; // null if unrevealed
  sprintCount: number; // count of sprint cards is visible
  sprintCards: number[] | null; // null unless revealed
}

export interface MarshalView {
  turnNumber: number;
  phase: GamePhase;
  difficulty: AIDifficulty;

  // Highway with hidden cards redacted
  highway: PublicHideoutSlot[];

  // Marshal private hand (eliminated cards)
  marshalHand: number[];

  // Deck counts only (no hidden deck contents!)
  deckCounts: Record<DeckName, number>;

  // Fugitive draw history (which deck was drawn from)
  fugitiveDrawHistory: { turnNumber: number; deck: DeckName }[];

  // Fugitive hand size
  fugitiveHandSize: number;

  // Number of times Fugitive passed
  fugitivePassCount: number;

  // All previously guessed numbers
  guessedNumbers: number[];

  // Manhunt info
  manhunt: ManhuntState | null;

  winner: PlayerRole | null;
}

export interface FugitiveView {
  turnNumber: number;
  phase: GamePhase;
  difficulty: AIDifficulty;

  // Fugitive can peek at all highway cards & sprints
  highway: HideoutSlot[];

  // Fugitive hand
  fugitiveHand: number[];

  // Marshal hand size
  marshalHandSize: number;

  // Deck counts
  deckCounts: Record<DeckName, number>;

  // Guessed numbers
  guessedNumbers: number[];

  // Manhunt
  manhunt: ManhuntState | null;

  winner: PlayerRole | null;
}

export function projectToMarshalView(state: GameState): MarshalView {
  const publicHighway: PublicHideoutSlot[] = state.highway.map((h) => ({
    slotIndex: h.slotIndex,
    isRevealed: h.isRevealed,
    card: h.isRevealed ? h.card : null,
    sprintCount: h.sprintCards.length,
    sprintCards: h.sprintRevealed ? [...h.sprintCards] : null,
  }));

  return {
    turnNumber: state.turnNumber,
    phase: state.phase,
    difficulty: state.difficulty,
    highway: publicHighway,
    marshalHand: [...state.marshalHand].sort((a, b) => a - b),
    deckCounts: {
      A: state.decks.A.length,
      B: state.decks.B.length,
      C: state.decks.C.length,
    },
    fugitiveDrawHistory: state.drawHistory
      .filter((d) => d.player === "fugitive")
      .map((d) => ({ turnNumber: d.turnNumber, deck: d.deck })),
    fugitiveHandSize: state.fugitiveHand.length,
    fugitivePassCount: state.fugitivePassCount,
    guessedNumbers: Array.from(state.guessedNumbers).sort((a, b) => a - b),
    manhunt: state.manhunt ? { ...state.manhunt } : null,
    winner: state.winner,
  };
}

export function projectToFugitiveView(state: GameState): FugitiveView {
  return {
    turnNumber: state.turnNumber,
    phase: state.phase,
    difficulty: state.difficulty,
    highway: state.highway.map((h) => ({
      slotIndex: h.slotIndex,
      card: h.card,
      isRevealed: h.isRevealed,
      sprintCards: [...h.sprintCards],
      sprintRevealed: h.sprintRevealed,
    })),
    fugitiveHand: [...state.fugitiveHand].sort((a, b) => a - b),
    marshalHandSize: state.marshalHand.length,
    deckCounts: {
      A: state.decks.A.length,
      B: state.decks.B.length,
      C: state.decks.C.length,
    },
    guessedNumbers: Array.from(state.guessedNumbers).sort((a, b) => a - b),
    manhunt: state.manhunt ? { ...state.manhunt } : null,
    winner: state.winner,
  };
}
