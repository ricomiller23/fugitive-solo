export type PlayerRole = "fugitive" | "marshal";
export type AIDifficulty = "rookie" | "detective" | "marshal";
export type DeckName = "A" | "B" | "C";

export interface HideoutSlot {
  slotIndex: number; // 0 is starting point (card 0)
  card: number;
  isRevealed: boolean;
  sprintCards: number[];
  sprintRevealed: boolean;
}

export type GamePhase =
  | "setup"
  | "fugitive_turn"
  | "marshal_turn"
  | "manhunt"
  | "game_over";

export type FugitiveTurnStep = "draw" | "place" | "done";
export type MarshalTurnStep = "draw" | "guess" | "done";

export interface TurnLogEntry {
  turnNumber: number;
  player: PlayerRole;
  description: string;
  timestamp: number;
  isHit?: boolean;
}

export interface GuessResult {
  guesses: number[];
  revealedSlots: number[];
  success: boolean; // all correct for multi-guess, or single correct
}

export interface ManhuntState {
  active: boolean;
  triggerCard: number; // 42
  highestRevealedAtTrigger: number;
  currentGuessIndex: number;
  guesses: number[];
  revealedCount: number;
}

export interface DeckComposition {
  A: number[];
  B: number[];
  C: number[];
}

export type GameAction =
  | { type: "FUGITIVE_INITIAL_PLACE"; hideouts: { card: number; sprintCards: number[] }[] }
  | { type: "DRAW_CARD"; player: PlayerRole; deck: DeckName }
  | { type: "FUGITIVE_PLACE"; hideout: number; sprintCards: number[] }
  | { type: "FUGITIVE_PASS" }
  | { type: "MARSHAL_GUESS_SINGLE"; guess: number }
  | { type: "MARSHAL_GUESS_MULTI"; guesses: number[] }
  | { type: "TRIGGER_MANHUNT"; trigger: boolean }
  | { type: "MANHUNT_GUESS"; guess: number };
