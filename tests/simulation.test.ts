import { describe, it, expect } from "vitest";
import { createInitialGameState, applyAction } from "../src/engine/rules.ts";
import { projectToFugitiveView, projectToMarshalView } from "../src/engine/state.ts";
import {
  chooseFugitiveInitialPlacement,
  chooseFugitiveDrawDeck,
  chooseFugitiveTurnAction,
} from "../src/engine/ai/fugitiveAI.ts";
import {
  chooseMarshalDrawDeck,
  chooseMarshalAction,
} from "../src/engine/ai/marshalAI.ts";
import { AIDifficulty, PlayerRole } from "../src/engine/types.ts";

function runSingleSimulation(seed: number, difficulty: AIDifficulty): { winner: PlayerRole; turns: number } {
  let state = createInitialGameState(seed, "fugitive", difficulty);
  let guard = 0;

  while (state.phase !== "game_over" && guard < 60) {
    guard++;

    if (state.phase === "fugitive_turn") {
      if (state.turnNumber === 1 && state.highway.length === 1) {
        // Turn 1 initial placement
        const initial = chooseFugitiveInitialPlacement(state.fugitiveHand, difficulty);
        state = applyAction(state, {
          type: "FUGITIVE_INITIAL_PLACE",
          hideouts: initial.hideouts,
        });
      } else {
        // Normal Fugitive turn
        // 1. Draw 2 cards if needed
        while (state.fugitiveDrawCountThisTurn < 1 && state.phase === "fugitive_turn") {
          const fView = projectToFugitiveView(state);
          const deck = chooseFugitiveDrawDeck(fView);
          state = applyAction(state, {
            type: "DRAW_CARD",
            player: "fugitive",
            deck,
          });
        }

        if (state.phase === "fugitive_turn") {
          // 2. Place hideout or pass
          const fView = projectToFugitiveView(state);
          const act = chooseFugitiveTurnAction(fView);
          state = applyAction(state, act);
        }
      }
    } else if (state.phase === "marshal_turn") {
      // 1. Draw cards
      while (state.marshalDrawsRemaining > 0 && state.phase === "marshal_turn") {
        const mView = projectToMarshalView(state);
        const deck = chooseMarshalDrawDeck(mView, difficulty);
        state = applyAction(state, {
          type: "DRAW_CARD",
          player: "marshal",
          deck,
        });
      }

      if (state.phase === "marshal_turn") {
        // 2. Guess
        const mView = projectToMarshalView(state);
        const act = chooseMarshalAction(mView);
        state = applyAction(state, act);
      }
    } else if (state.phase === "manhunt") {
      if (!state.manhunt?.active) {
        state = applyAction(state, { type: "TRIGGER_MANHUNT", trigger: true });
      } else {
        const mView = projectToMarshalView(state);
        const act = chooseMarshalAction(mView);
        state = applyAction(state, act);
      }
    }
  }

  expect(state.phase).toBe("game_over");
  expect(state.winner).toBeDefined();
  return { winner: state.winner!, turns: state.turnNumber };
}

describe("AI vs AI Gameplay Simulations", () => {
  it("runs simulations across Rookie difficulty without crashes", () => {
    let fugitiveWins = 0;
    let marshalWins = 0;

    for (let i = 1; i <= 25; i++) {
      const res = runSingleSimulation(i * 101, "rookie");
      if (res.winner === "fugitive") fugitiveWins++;
      else marshalWins++;
    }

    expect(fugitiveWins + marshalWins).toBe(25);
  });

  it("runs simulations across Detective difficulty without crashes", () => {
    let fugitiveWins = 0;
    let marshalWins = 0;

    for (let i = 1; i <= 25; i++) {
      const res = runSingleSimulation(i * 203, "detective");
      if (res.winner === "fugitive") fugitiveWins++;
      else marshalWins++;
    }

    expect(fugitiveWins + marshalWins).toBe(25);
  });

  it("runs simulations across US Marshal difficulty without crashes", () => {
    let fugitiveWins = 0;
    let marshalWins = 0;

    for (let i = 1; i <= 25; i++) {
      const res = runSingleSimulation(i * 307, "marshal");
      if (res.winner === "fugitive") fugitiveWins++;
      else marshalWins++;
    }

    expect(fugitiveWins + marshalWins).toBe(25);
  });
});
