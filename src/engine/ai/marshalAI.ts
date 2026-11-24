import { AIDifficulty, DeckName, GameAction } from "../types.ts";
import { MarshalView } from "../state.ts";
import { solveMarshalInference } from "./marshalSolver.ts";

/**
 * Choose which deck the Marshal should draw from based on current game state and difficulty.
 */
export function chooseMarshalDrawDeck(view: MarshalView, difficulty: AIDifficulty): DeckName {
  const availableDecks: DeckName[] = [];
  if (view.deckCounts.A > 0) availableDecks.push("A");
  if (view.deckCounts.B > 0) availableDecks.push("B");
  if (view.deckCounts.C > 0) availableDecks.push("C");

  if (availableDecks.length === 0) {
    return "A";
  }

  // Find the highest revealed card so far
  let highestRevealed = 0;
  for (const slot of view.highway) {
    if (slot.isRevealed && slot.card !== null && slot.card > highestRevealed) {
      highestRevealed = slot.card;
    }
  }

  // Estimate the fugitive frontier based on number of unrevealed slots
  const unrevealedSlots = view.highway.filter((s) => !s.isRevealed).length;
  const estimatedFrontier = highestRevealed + unrevealedSlots * 3;

  if (difficulty === "rookie") {
    // Rookie picks based on highest revealed card simply
    if (highestRevealed <= 10 && view.deckCounts.A > 0) return "A";
    if (highestRevealed <= 24 && view.deckCounts.B > 0) return "B";
    if (view.deckCounts.C > 0) return "C";
    return availableDecks[0];
  }

  // Detective and Marshal look at estimated frontier
  if (estimatedFrontier < 14 && view.deckCounts.A > 0) {
    return "A";
  } else if (estimatedFrontier < 28 && view.deckCounts.B > 0) {
    return "B";
  } else if (view.deckCounts.C > 0) {
    return "C";
  }

  return availableDecks[0];
}

/**
 * Marshal AI decision maker for guessing and manhunt.
 * Strictly uses MarshalView - no hidden data access.
 */
export function chooseMarshalAction(view: MarshalView): GameAction {
  const difficulty = view.difficulty;
  const inference = solveMarshalInference(view);

  // If in Manhunt, pick a manhunt guess
  if (view.phase === "manhunt" && view.manhunt) {
    const guess = chooseManhuntGuess(view, inference);
    return { type: "MANHUNT_GUESS", guess };
  }

  if (difficulty === "rookie") {
    return chooseRookieGuess(view, inference);
  } else if (difficulty === "detective") {
    return chooseDetectiveGuess(view, inference);
  } else {
    return chooseMarshalExpertGuess(view, inference);
  }
}

function chooseRookieGuess(
  view: MarshalView,
  inference: ReturnType<typeof solveMarshalInference>
): GameAction {
  // Rookie always guesses a single number.
  // Prefer the first unrevealed slot.
  const firstUnrevealed = inference.slots.find((s) => {
    const slotState = view.highway.find((h) => h.slotIndex === s.slotIndex);
    return slotState && !slotState.isRevealed;
  });

  if (!firstUnrevealed || firstUnrevealed.candidateProbabilities.length === 0) {
    for (let c = 1; c <= 41; c++) {
      if (!view.guessedNumbers.includes(c) && !view.marshalHand.includes(c)) {
        return { type: "MARSHAL_GUESS_SINGLE", guess: c };
      }
    }
    return { type: "MARSHAL_GUESS_SINGLE", guess: 1 };
  }

  const candidates = firstUnrevealed.candidateProbabilities;
  const picked = candidates[0].card;
  return { type: "MARSHAL_GUESS_SINGLE", guess: picked };
}

function chooseDetectiveGuess(
  view: MarshalView,
  inference: ReturnType<typeof solveMarshalInference>
): GameAction {
  if (inference.bestSingleGuess !== null) {
    return { type: "MARSHAL_GUESS_SINGLE", guess: inference.bestSingleGuess };
  }
  return chooseRookieGuess(view, inference);
}

function chooseMarshalExpertGuess(
  view: MarshalView,
  inference: ReturnType<typeof solveMarshalInference>
): GameAction {
  if (inference.bestMultiGuess && inference.bestMultiGuess.length >= 2 && inference.confidence > 0.65) {
    return { type: "MARSHAL_GUESS_MULTI", guesses: inference.bestMultiGuess };
  }

  if (inference.bestSingleGuess !== null) {
    return { type: "MARSHAL_GUESS_SINGLE", guess: inference.bestSingleGuess };
  }

  return chooseRookieGuess(view, inference);
}

function chooseManhuntGuess(
  view: MarshalView,
  inference: ReturnType<typeof solveMarshalInference>
): number {
  const unrevealedSlot = view.highway.find((h) => !h.isRevealed);
  if (unrevealedSlot) {
    const slotAnalysis = inference.slots.find((s) => s.slotIndex === unrevealedSlot.slotIndex);
    if (slotAnalysis && slotAnalysis.candidateProbabilities.length > 0) {
      return slotAnalysis.candidateProbabilities[0].card;
    }
  }

  if (inference.bestSingleGuess !== null) {
    return inference.bestSingleGuess;
  }

  for (let c = 1; c <= 42; c++) {
    if (!view.guessedNumbers.includes(c) && !view.marshalHand.includes(c)) {
      return c;
    }
  }
  return 42;
}
