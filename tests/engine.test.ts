import { describe, it, expect } from "vitest";
import { SPRINT_VALUES, getSprintValue, getTotalSprint } from "../src/engine/sprint.ts";
import { createInitialGameState, applyAction, canPlaceHideout } from "../src/engine/rules.ts";
import { GameAction } from "../src/engine/types.ts";

describe("Sprint Math and Config", () => {
  it("evaluates sprint values according to standard distribution", () => {
    expect(getSprintValue(1)).toBe(1);
    expect(getSprintValue(2)).toBe(2);
    expect(getSprintValue(3)).toBe(1);
    expect(getSprintValue(4)).toBe(2);
    expect(getSprintValue(41)).toBe(1);
    expect(getSprintValue(42)).toBe(0);
    expect(getSprintValue(0)).toBe(0);
  });

  it("calculates total sprint correctly", () => {
    expect(getTotalSprint([1, 2, 3])).toBe(4);
    expect(getTotalSprint([2, 4])).toBe(4);
    expect(getTotalSprint([])).toBe(0);
  });
});

describe("Initial Setup", () => {
  it("initializes decks, hands, and highway with exact required counts", () => {
    const state = createInitialGameState(12345, "fugitive", "rookie");

    // Decks: A (4..14) has 11 cards minus 3 drawn = 8
    // B (15..28) has 14 cards minus 2 drawn = 12
    // C (29..41) has 13 cards = 13
    expect(state.decks.A.length).toBe(8);
    expect(state.decks.B.length).toBe(12);
    expect(state.decks.C.length).toBe(13);

    // Fugitive hand has 9 cards: 1, 2, 3, 42 plus 3 from A and 2 from B
    expect(state.fugitiveHand.length).toBe(9);
    expect(state.fugitiveHand).toContain(1);
    expect(state.fugitiveHand).toContain(2);
    expect(state.fugitiveHand).toContain(3);
    expect(state.fugitiveHand).toContain(42);

    // Marshal hand starts empty
    expect(state.marshalHand.length).toBe(0);

    // Highway has starting card 0 face up
    expect(state.highway.length).toBe(1);
    expect(state.highway[0].card).toBe(0);
    expect(state.highway[0].isRevealed).toBe(true);

    // Turn 1 setup
    expect(state.turnNumber).toBe(1);
    expect(state.phase).toBe("fugitive_turn");
  });
});

describe("Placement and Sprint Rules", () => {
  it("validates legal hideout jumps", () => {
    // Jump from 0 to 3 without sprint (gap 3 <= 3)
    expect(canPlaceHideout(0, 3, []).valid).toBe(true);
    // Jump from 0 to 4 without sprint fails (gap 4 > 3)
    expect(canPlaceHideout(0, 4, []).valid).toBe(false);
    // Jump from 0 to 4 with sprint card 1 (+1) is legal (gap 4 <= 3+1)
    expect(canPlaceHideout(0, 4, [1]).valid).toBe(true);
    // Jump from 0 to 6 with card 2 (+2) is legal (gap 6 <= 3+2)
    expect(canPlaceHideout(0, 5, [2]).valid).toBe(true);
    expect(canPlaceHideout(0, 6, [1, 2]).valid).toBe(true);
    // Cannot jump backwards or equal
    expect(canPlaceHideout(5, 4, []).valid).toBe(false);
    expect(canPlaceHideout(5, 5, []).valid).toBe(false);
  });

  it("handles turn 1 initial placement of 2 hideouts", () => {
    let state = createInitialGameState(100, "fugitive", "rookie");

    const action: GameAction = {
      type: "FUGITIVE_INITIAL_PLACE",
      hideouts: [
        { card: 2, sprintCards: [] },
        { card: 4, sprintCards: [] },
      ],
    };

    // If card 4 is not in hand, this should throw
    if (!state.fugitiveHand.includes(4)) {
      // Find cards in hand that can be placed
      const validFirst = state.fugitiveHand.filter((c) => c <= 3 && c > 0)[0];
      const validSecond = state.fugitiveHand.filter((c) => c > validFirst && c <= validFirst + 3)[0];
      if (validSecond) {
        state = applyAction(state, {
          type: "FUGITIVE_INITIAL_PLACE",
          hideouts: [
            { card: validFirst, sprintCards: [] },
            { card: validSecond, sprintCards: [] },
          ],
        });
        expect(state.highway.length).toBe(3);
        expect(state.phase).toBe("marshal_turn");
        expect(state.marshalDrawsRemaining).toBe(2);
      }
    }
  });
});

describe("Marshal Guessing Logic", () => {
  it("reveals hideout on single correct guess", () => {
    let state = createInitialGameState(200, "fugitive", "rookie");

    // Setup turn 1 placement
    state = applyAction(state, {
      type: "FUGITIVE_INITIAL_PLACE",
      hideouts: [{ card: 2, sprintCards: [] }],
    });

    // Marshal draws 2 cards on turn 1
    state = applyAction(state, { type: "DRAW_CARD", player: "marshal", deck: "A" });
    state = applyAction(state, { type: "DRAW_CARD", player: "marshal", deck: "A" });

    expect(state.marshalDrawsRemaining).toBe(0);

    // Marshal guesses 2
    state = applyAction(state, { type: "MARSHAL_GUESS_SINGLE", guess: 2 });
    const slot = state.highway.find((h) => h.card === 2);
    expect(slot).toBeDefined();
    expect(slot?.isRevealed).toBe(true);
  });

  it("reveals nothing on multi-guess when one number is wrong", () => {
    let state = createInitialGameState(300, "fugitive", "rookie");

    // Place 2 hideouts: card 1 and card 3
    state = applyAction(state, {
      type: "FUGITIVE_INITIAL_PLACE",
      hideouts: [
        { card: 1, sprintCards: [] },
        { card: 3, sprintCards: [] },
      ],
    });

    // Marshal draws
    state = applyAction(state, { type: "DRAW_CARD", player: "marshal", deck: "A" });
    state = applyAction(state, { type: "DRAW_CARD", player: "marshal", deck: "A" });

    // Multi-guess: 1 is correct, but 5 is wrong
    state = applyAction(state, { type: "MARSHAL_GUESS_MULTI", guesses: [1, 5] });

    // Neither slot should be revealed
    const slot1 = state.highway.find((h) => h.card === 1);
    expect(slot1?.isRevealed).toBe(false);
  });
});

describe("Manhunt Rule Trigger", () => {
  it("triggers manhunt when 42 is placed and highest revealed is 29 or lower", () => {
    let state = createInitialGameState(400, "fugitive", "rookie");

    // Manually force highway to have hideout 25 revealed and 42 placed
    state.highway = [
      { slotIndex: 0, card: 0, isRevealed: true, sprintCards: [], sprintRevealed: false },
      { slotIndex: 1, card: 25, isRevealed: true, sprintCards: [], sprintRevealed: false },
      { slotIndex: 2, card: 38, isRevealed: false, sprintCards: [], sprintRevealed: false },
    ];
    state.fugitiveHand = [42, 1, 2];
    state.phase = "fugitive_turn";
    state.fugitiveDrawCountThisTurn = 2; // already drew

    // Fugitive places 42 with sprint [1, 2] -> sprint value 3. 38 + 3 + 3 = 44 >= 42
    state = applyAction(state, {
      type: "FUGITIVE_PLACE",
      hideout: 42,
      sprintCards: [1, 2],
    });

    // Highest revealed is 25 <= 29, so phase should become manhunt pending Marshal trigger
    expect(state.phase).toBe("manhunt");
    expect(state.manhunt).toBeDefined();
    expect(state.manhunt?.active).toBe(false);

    // Marshal triggers the manhunt
    state = applyAction(state, { type: "TRIGGER_MANHUNT", trigger: true });
    expect(state.manhunt?.active).toBe(true);
  });

  it("fugitive wins immediately when 42 is placed and highest revealed is 30 or higher", () => {
    let state = createInitialGameState(500, "fugitive", "rookie");

    state.highway = [
      { slotIndex: 0, card: 0, isRevealed: true, sprintCards: [], sprintRevealed: false },
      { slotIndex: 1, card: 30, isRevealed: true, sprintCards: [], sprintRevealed: false },
      { slotIndex: 2, card: 39, isRevealed: false, sprintCards: [], sprintRevealed: false },
    ];
    state.fugitiveHand = [42];
    state.phase = "fugitive_turn";
    state.fugitiveDrawCountThisTurn = 2;

    state = applyAction(state, {
      type: "FUGITIVE_PLACE",
      hideout: 42,
      sprintCards: [],
    });

    // Highest revealed is 30 > 29, so Fugitive escapes immediately!
    expect(state.phase).toBe("game_over");
    expect(state.winner).toBe("fugitive");
  });
});
