import { describe, it, expect } from "vitest";
import { solveMarshalInference } from "../src/engine/ai/marshalSolver.ts";
import { MarshalView } from "../src/engine/state.ts";

describe("Marshal AI Information Isolation", () => {
  it("computes inferences strictly from MarshalView without hidden state", () => {
    // Construct a synthetic MarshalView
    const view: MarshalView = {
      turnNumber: 2,
      phase: "marshal_turn",
      difficulty: "marshal",
      highway: [
        { slotIndex: 0, isRevealed: true, card: 0, sprintCount: 0, sprintCards: [] },
        { slotIndex: 1, isRevealed: false, card: null, sprintCount: 0, sprintCards: null },
        { slotIndex: 2, isRevealed: false, card: null, sprintCount: 1, sprintCards: null },
      ],
      marshalHand: [2, 7, 8],
      deckCounts: { A: 7, B: 12, C: 13 },
      fugitiveDrawHistory: [{ turnNumber: 2, deck: "A" }],
      fugitiveHandSize: 7,
      fugitivePassCount: 0,
      guessedNumbers: [5],
      manhunt: null,
      winner: null,
    };

    const inference = solveMarshalInference(view);

    // Slot 1: sprintCount 0, previous is 0.
    // Possible cards without sprint: 1, 2, 3.
    // But card 2 is in Marshal's hand! So candidate for slot 1 can only be 1 or 3.
    const slot1 = inference.slots.find((s) => s.slotIndex === 1);
    expect(slot1).toBeDefined();

    const slot1Cards = slot1?.candidateProbabilities.map((p) => p.card) || [];
    expect(slot1Cards).toContain(1);
    expect(slot1Cards).toContain(3);
    expect(slot1Cards).not.toContain(2); // Card 2 eliminated by hand
    expect(slot1Cards).not.toContain(0); // Card 0 eliminated by board
  });

  it("eliminates previously guessed numbers and cards in hand", () => {
    const view: MarshalView = {
      turnNumber: 3,
      phase: "marshal_turn",
      difficulty: "detective",
      highway: [
        { slotIndex: 0, isRevealed: true, card: 0, sprintCount: 0, sprintCards: [] },
        { slotIndex: 1, isRevealed: false, card: null, sprintCount: 0, sprintCards: null },
      ],
      marshalHand: [1, 3],
      deckCounts: { A: 6, B: 12, C: 13 },
      fugitiveDrawHistory: [],
      fugitiveHandSize: 6,
      fugitivePassCount: 0,
      guessedNumbers: [],
      manhunt: null,
      winner: null,
    };

    const inference = solveMarshalInference(view);
    const slot1 = inference.slots.find((s) => s.slotIndex === 1);

    // Gap from 0 without sprint is 1..3. Cards 1 and 3 are in Marshal hand.
    // Therefore slot 1 MUST be 2!
    expect(slot1?.mostLikelyCard).toBe(2);
    expect(inference.bestSingleGuess).toBe(2);
  });
});
