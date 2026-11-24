import { getTotalSprint } from "./sprint.ts";
import {
  AIDifficulty,
  DeckName,
  GameAction,
  HideoutSlot,
  PlayerRole,
  TurnLogEntry,
} from "./types.ts";
import { GameState } from "./state.ts";

// Simple reproducible seeded PRNG (Mulberry32)
export function createRng(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createInitialGameState(
  seed = Date.now(),
  playerRole: PlayerRole = "fugitive",
  difficulty: AIDifficulty = "rookie"
): GameState {
  const rng = createRng(seed);

  // Deck A: 4..14
  const deckA = shuffle(
    Array.from({ length: 11 }, (_, i) => i + 4),
    rng
  );
  // Deck B: 15..28
  const deckB = shuffle(
    Array.from({ length: 14 }, (_, i) => i + 15),
    rng
  );
  // Deck C: 29..41
  const deckC = shuffle(
    Array.from({ length: 13 }, (_, i) => i + 29),
    rng
  );

  // Fugitive starting hand: 1, 2, 3, 42 + 3 from Deck A + 2 from Deck B
  const fugitiveHand: number[] = [1, 2, 3, 42];
  for (let i = 0; i < 3; i++) {
    const card = deckA.pop();
    if (card !== undefined) fugitiveHand.push(card);
  }
  for (let i = 0; i < 2; i++) {
    const card = deckB.pop();
    if (card !== undefined) fugitiveHand.push(card);
  }
  fugitiveHand.sort((a, b) => a - b);

  // Highway starting with 0 revealed
  const highway: HideoutSlot[] = [
    {
      slotIndex: 0,
      card: 0,
      isRevealed: true,
      sprintCards: [],
      sprintRevealed: true,
    },
  ];

  return {
    seed,
    turnNumber: 1,
    phase: "fugitive_turn",
    playerRole,
    difficulty,
    decks: {
      A: deckA,
      B: deckB,
      C: deckC,
    },
    fugitiveHand,
    marshalHand: [],
    highway,
    fugitiveDrawCountThisTurn: 0,
    marshalDrawsRemaining: 2, // Turn 1 Marshal draws 2
    fugitivePassCount: 0,
    drawHistory: [],
    guessedNumbers: new Set<number>(),
    manhunt: null,
    history: [
      {
        turnNumber: 1,
        player: "fugitive",
        description: "Fugitive begins the escape from hideout 0.",
        timestamp: Date.now(),
      },
    ],
    winner: null,
    winReason: null,
  };
}

export function canPlaceHideout(
  fromCard: number,
  toCard: number,
  sprintCards: number[]
): {
  valid: boolean;
  reason?: string;
  gap: number;
  requiredSprint: number;
  providedSprint: number;
} {
  if (toCard <= fromCard) {
    return {
      valid: false,
      reason: "Hideout number must be strictly higher than previous hideout.",
      gap: toCard - fromCard,
      requiredSprint: 0,
      providedSprint: 0,
    };
  }

  if (sprintCards.includes(42)) {
    return {
      valid: false,
      reason: "Card 42 cannot be played as a sprint card.",
      gap: toCard - fromCard,
      requiredSprint: 0,
      providedSprint: 0,
    };
  }

  const gap = toCard - fromCard;
  const requiredSprint = Math.max(0, gap - 3);
  const providedSprint = getTotalSprint(sprintCards);

  if (providedSprint < requiredSprint) {
    return {
      valid: false,
      reason: `Gap of ${gap} requires +${requiredSprint} sprint; provided ${providedSprint}.`,
      gap,
      requiredSprint,
      providedSprint,
    };
  }

  return {
    valid: true,
    gap,
    requiredSprint,
    providedSprint,
  };
}

export function getHighestRevealedHideout(highway: HideoutSlot[]): number {
  let highest = 0;
  for (const slot of highway) {
    if (slot.isRevealed && slot.card > highest) {
      highest = slot.card;
    }
  }
  return highest;
}

export function areAllHideoutsRevealed(highway: HideoutSlot[]): boolean {
  // All hideouts other than slot 0 must be revealed
  if (highway.length <= 1) return false;
  return highway.slice(1).every((h) => h.isRevealed);
}

export function checkWinCondition(state: GameState): {
  isGameOver: boolean;
  winner?: PlayerRole;
  reason?: string;
} {
  // 1. Marshal catches Fugitive if all hideouts (other than starting 0) are revealed
  if (areAllHideoutsRevealed(state.highway)) {
    return {
      isGameOver: true,
      winner: "marshal",
      reason: "Marshal revealed every hideout on the highway!",
    };
  }

  // 2. Fugitive escapes if 42 is played and either manhunt declined or manhunt failed
  const lastHideout = state.highway[state.highway.length - 1];
  if (lastHideout && lastHideout.card === 42) {
    if (state.manhunt === null) {
      // Checked if manhunt was possible
      const highest = getHighestRevealedHideout(state.highway);
      if (highest > 29) {
        return {
          isGameOver: true,
          winner: "fugitive",
          reason: "Fugitive reached state line (42) and highest revealed hideout was above 29 (no manhunt).",
        };
      }
    }
  }

  return { isGameOver: false };
}

export function applyAction(state: GameState, action: GameAction): GameState {
  if (state.winner) {
    throw new Error("Game is already finished.");
  }

  const nextState: GameState = {
    ...state,
    decks: {
      A: [...state.decks.A],
      B: [...state.decks.B],
      C: [...state.decks.C],
    },
    fugitiveHand: [...state.fugitiveHand],
    marshalHand: [...state.marshalHand],
    highway: state.highway.map((h) => ({
      ...h,
      sprintCards: [...h.sprintCards],
    })),
    drawHistory: [...state.drawHistory],
    guessedNumbers: new Set(state.guessedNumbers),
    history: [...state.history],
    manhunt: state.manhunt ? { ...state.manhunt, guesses: [...state.manhunt.guesses] } : null,
  };

  switch (action.type) {
    // ----------------------------------------------------
    // FUGITIVE INITIAL PLACEMENT (Turn 1: place 1 or 2 hideouts)
    // ----------------------------------------------------
    case "FUGITIVE_INITIAL_PLACE": {
      if (state.turnNumber !== 1 || state.phase !== "fugitive_turn") {
        throw new Error("Initial placement only valid on Fugitive Turn 1.");
      }
      if (action.hideouts.length < 1 || action.hideouts.length > 2) {
        throw new Error("Fugitive must place 1 or 2 hideouts on turn 1.");
      }

      let prevCard = 0;
      const cardsUsed = new Set<number>();

      for (const h of action.hideouts) {
        if (!nextState.fugitiveHand.includes(h.card)) {
          throw new Error(`Card ${h.card} is not in hand.`);
        }
        if (cardsUsed.has(h.card)) {
          throw new Error(`Card ${h.card} used more than once.`);
        }
        cardsUsed.add(h.card);

        for (const s of h.sprintCards) {
          if (!nextState.fugitiveHand.includes(s) || cardsUsed.has(s)) {
            throw new Error(`Sprint card ${s} not available.`);
          }
          cardsUsed.add(s);
        }

        const check = canPlaceHideout(prevCard, h.card, h.sprintCards);
        if (!check.valid) {
          throw new Error(check.reason);
        }

        nextState.highway.push({
          slotIndex: nextState.highway.length,
          card: h.card,
          isRevealed: false,
          sprintCards: [...h.sprintCards],
          sprintRevealed: false,
        });

        prevCard = h.card;
      }

      // Remove played cards from hand
      nextState.fugitiveHand = nextState.fugitiveHand.filter((c) => !cardsUsed.has(c));

      nextState.history.unshift({
        turnNumber: state.turnNumber,
        player: "fugitive",
        description: `Fugitive placed ${action.hideouts.length} initial hideout${action.hideouts.length > 1 ? "s" : ""}.`,
        timestamp: Date.now(),
      });

      // Advance to Marshal Turn 1
      nextState.phase = "marshal_turn";
      nextState.marshalDrawsRemaining = 2; // Marshal draws 2 cards on turn 1
      return nextState;
    }

    // ----------------------------------------------------
    // DRAW CARD
    // ----------------------------------------------------
    case "DRAW_CARD": {
      const { player, deck } = action;
      if (player === "fugitive") {
        if (state.phase !== "fugitive_turn") {
          throw new Error("Not fugitive turn.");
        }
        if (state.turnNumber === 1) {
          throw new Error("Fugitive cannot draw on turn 1.");
        }
        if (nextState.fugitiveDrawCountThisTurn >= 1) {
          throw new Error("Fugitive already drew this turn.");
        }
        if (nextState.decks[deck].length === 0) {
          throw new Error(`Deck ${deck} is empty.`);
        }

        const drawnCard = nextState.decks[deck].pop()!;
        nextState.fugitiveHand.push(drawnCard);
        nextState.fugitiveHand.sort((a, b) => a - b);
        nextState.fugitiveDrawCountThisTurn = 1;
        nextState.drawHistory.push({
          turnNumber: state.turnNumber,
          player: "fugitive",
          deck,
        });

        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "fugitive",
          description: `Fugitive drew 1 card from Deck ${deck}.`,
          timestamp: Date.now(),
        });

        return nextState;
      } else {
        // Marshal Draw
        if (state.phase !== "marshal_turn") {
          throw new Error("Not marshal turn.");
        }
        if (nextState.marshalDrawsRemaining <= 0) {
          throw new Error("Marshal has no draws remaining this turn.");
        }
        if (nextState.decks[deck].length === 0) {
          throw new Error(`Deck ${deck} is empty.`);
        }

        const drawnCard = nextState.decks[deck].pop()!;
        nextState.marshalHand.push(drawnCard);
        nextState.marshalHand.sort((a, b) => a - b);
        nextState.marshalDrawsRemaining -= 1;
        nextState.drawHistory.push({
          turnNumber: state.turnNumber,
          player: "marshal",
          deck,
        });

        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "marshal",
          description: `Marshal drew 1 card from Deck ${deck}.`,
          timestamp: Date.now(),
        });

        return nextState;
      }
    }

    // ----------------------------------------------------
    // FUGITIVE PLACE HIDEOUT (Turn 2+)
    // ----------------------------------------------------
    case "FUGITIVE_PLACE": {
      if (state.phase !== "fugitive_turn") {
        throw new Error("Not fugitive turn.");
      }
      if (state.turnNumber > 1 && nextState.fugitiveDrawCountThisTurn === 0) {
        // Must draw unless all decks are empty
        const totalCardsInDecks =
          nextState.decks.A.length + nextState.decks.B.length + nextState.decks.C.length;
        if (totalCardsInDecks > 0) {
          throw new Error("Fugitive must draw before placing a hideout.");
        }
      }

      const { hideout, sprintCards } = action;
      if (!nextState.fugitiveHand.includes(hideout)) {
        throw new Error(`Card ${hideout} is not in hand.`);
      }

      const cardsUsed = new Set<number>([hideout]);
      for (const s of sprintCards) {
        if (!nextState.fugitiveHand.includes(s) || cardsUsed.has(s)) {
          throw new Error(`Sprint card ${s} is not available in hand.`);
        }
        cardsUsed.add(s);
      }

      const prevHideout = nextState.highway[nextState.highway.length - 1];
      const check = canPlaceHideout(prevHideout.card, hideout, sprintCards);
      if (!check.valid) {
        throw new Error(check.reason);
      }

      nextState.highway.push({
        slotIndex: nextState.highway.length,
        card: hideout,
        isRevealed: false,
        sprintCards: [...sprintCards],
        sprintRevealed: false,
      });

      nextState.fugitiveHand = nextState.fugitiveHand.filter((c) => !cardsUsed.has(c));

      nextState.history.unshift({
        turnNumber: state.turnNumber,
        player: "fugitive",
        description: `Fugitive placed a new hideout (${sprintCards.length} sprint card${sprintCards.length === 1 ? "" : "s"}).`,
        timestamp: Date.now(),
      });

      // Check if 42 was played!
      if (hideout === 42) {
        const highest = getHighestRevealedHideout(nextState.highway);
        if (highest <= 29) {
          // Manhunt threshold met! Marshal gets option to trigger manhunt
          nextState.phase = "manhunt";
          nextState.manhunt = {
            active: false, // awaiting Marshal decision
            triggerCard: 42,
            highestRevealedAtTrigger: highest,
            currentGuessIndex: 0,
            guesses: [],
            revealedCount: 0,
          };
          nextState.history.unshift({
            turnNumber: state.turnNumber,
            player: "marshal",
            description: `Fugitive played 42! Highest revealed hideout is ${highest} (<= 29). Manhunt opportunity available.`,
            timestamp: Date.now(),
          });
          return nextState;
        } else {
          // No manhunt possible: Fugitive escapes and wins!
          nextState.phase = "game_over";
          nextState.winner = "fugitive";
          nextState.winReason = "Fugitive escaped to card 42 with highest revealed hideout > 29!";
          return nextState;
        }
      }

      // Normal turn switch to Marshal
      nextState.phase = "marshal_turn";
      nextState.fugitiveDrawCountThisTurn = 0;
      nextState.marshalDrawsRemaining = 1; // standard turns draw 1
      return nextState;
    }

    // ----------------------------------------------------
    // FUGITIVE PASS
    // ----------------------------------------------------
    case "FUGITIVE_PASS": {
      if (state.phase !== "fugitive_turn") {
        throw new Error("Not fugitive turn.");
      }
      if (state.turnNumber === 1) {
        throw new Error("Fugitive cannot pass on turn 1.");
      }

      nextState.fugitivePassCount += 1;
      nextState.history.unshift({
        turnNumber: state.turnNumber,
        player: "fugitive",
        description: "Fugitive passed.",
        timestamp: Date.now(),
      });

      nextState.phase = "marshal_turn";
      nextState.fugitiveDrawCountThisTurn = 0;
      nextState.marshalDrawsRemaining = 1;
      return nextState;
    }

    // ----------------------------------------------------
    // MARSHAL GUESS SINGLE
    // ----------------------------------------------------
    case "MARSHAL_GUESS_SINGLE": {
      if (state.phase !== "marshal_turn") {
        throw new Error("Not marshal turn.");
      }
      if (nextState.marshalDrawsRemaining > 0) {
        const totalCardsInDecks =
          nextState.decks.A.length + nextState.decks.B.length + nextState.decks.C.length;
        if (totalCardsInDecks > 0) {
          throw new Error("Marshal must draw remaining cards before guessing.");
        }
      }

      const { guess } = action;
      if (guess < 1 || guess > 41) {
        throw new Error("Guesses must be numbers 1 through 41.");
      }

      nextState.guessedNumbers.add(guess);

      // Check if guess matches a face-down hideout
      const matchSlot = nextState.highway.find(
        (slot) => slot.slotIndex > 0 && !slot.isRevealed && slot.card === guess
      );

      if (matchSlot) {
        matchSlot.isRevealed = true;
        matchSlot.sprintRevealed = true;

        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "marshal",
          description: `HIT! Marshal revealed Hideout ${guess}!`,
          timestamp: Date.now(),
          isHit: true,
        });

        // Check if all hideouts revealed
        if (areAllHideoutsRevealed(nextState.highway)) {
          nextState.phase = "game_over";
          nextState.winner = "marshal";
          nextState.winReason = "Marshal revealed every hideout on the highway!";
          return nextState;
        }
      } else {
        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "marshal",
          description: `MISS! Marshal guessed ${guess} (no match).`,
          timestamp: Date.now(),
          isHit: false,
        });
      }

      // Advance turn to Fugitive
      nextState.turnNumber += 1;
      nextState.phase = "fugitive_turn";
      nextState.fugitiveDrawCountThisTurn = 0;
      return nextState;
    }

    // ----------------------------------------------------
    // MARSHAL GUESS MULTI
    // ----------------------------------------------------
    case "MARSHAL_GUESS_MULTI": {
      if (state.phase !== "marshal_turn") {
        throw new Error("Not marshal turn.");
      }
      if (nextState.marshalDrawsRemaining > 0) {
        const totalCardsInDecks =
          nextState.decks.A.length + nextState.decks.B.length + nextState.decks.C.length;
        if (totalCardsInDecks > 0) {
          throw new Error("Marshal must draw remaining cards before guessing.");
        }
      }

      const { guesses } = action;
      if (guesses.length < 2) {
        throw new Error("Multi-guess requires at least 2 distinct numbers.");
      }
      for (const g of guesses) {
        if (g < 1 || g > 41) {
          throw new Error("All guesses must be numbers 1 through 41.");
        }
        nextState.guessedNumbers.add(g);
      }

      // Check if ALL guesses match distinct face-down hideouts
      const matchedSlots: HideoutSlot[] = [];
      let allCorrect = true;

      for (const g of guesses) {
        const match = nextState.highway.find(
          (s) => s.slotIndex > 0 && !s.isRevealed && s.card === g && !matchedSlots.includes(s)
        );
        if (match) {
          matchedSlots.push(match);
        } else {
          allCorrect = false;
          break;
        }
      }

      if (allCorrect) {
        for (const slot of matchedSlots) {
          slot.isRevealed = true;
          slot.sprintRevealed = true;
        }
        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "marshal",
          description: `MULTI-HIT! Marshal revealed ${matchedSlots.length} hideouts: ${guesses.join(", ")}!`,
          timestamp: Date.now(),
          isHit: true,
        });

        if (areAllHideoutsRevealed(nextState.highway)) {
          nextState.phase = "game_over";
          nextState.winner = "marshal";
          nextState.winReason = "Marshal revealed every hideout on the highway!";
          return nextState;
        }
      } else {
        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "marshal",
          description: `MULTI-MISS! Multi-guess failed (${guesses.join(", ")}). Nothing revealed.`,
          timestamp: Date.now(),
          isHit: false,
        });
      }

      // Advance turn to Fugitive
      nextState.turnNumber += 1;
      nextState.phase = "fugitive_turn";
      nextState.fugitiveDrawCountThisTurn = 0;
      return nextState;
    }

    // ----------------------------------------------------
    // TRIGGER OR DECLINE MANHUNT
    // ----------------------------------------------------
    case "TRIGGER_MANHUNT": {
      if (state.phase !== "manhunt" || !state.manhunt) {
        throw new Error("Not in manhunt phase.");
      }

      if (action.trigger) {
        if (nextState.manhunt) nextState.manhunt.active = true;
        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "marshal",
          description: "SIRENS BLARING! Marshal initiated a MANHUNT!",
          timestamp: Date.now(),
        });
        return nextState;
      } else {
        // Marshal declined manhunt -> Fugitive escapes and wins!
        nextState.phase = "game_over";
        nextState.winner = "fugitive";
        nextState.winReason = "Marshal declined Manhunt. Fugitive escaped across the state line!";
        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "marshal",
          description: "Marshal declined Manhunt. Fugitive escapes!",
          timestamp: Date.now(),
        });
        return nextState;
      }
    }

    // ----------------------------------------------------
    // MANHUNT GUESS (One by one: one miss = lose; reveal all = win)
    // ----------------------------------------------------
    case "MANHUNT_GUESS": {
      if (state.phase !== "manhunt" || !state.manhunt || !state.manhunt.active) {
        throw new Error("Manhunt is not active.");
      }

      const { guess } = action;
      if (guess < 1 || guess > 41) {
        throw new Error("Manhunt guesses must be 1 through 41.");
      }

      if (nextState.manhunt) {
        nextState.manhunt.guesses.push(guess);
      }
      nextState.guessedNumbers.add(guess);

      const matchSlot = nextState.highway.find(
        (s) => s.slotIndex > 0 && !s.isRevealed && s.card === guess
      );

      if (matchSlot) {
        matchSlot.isRevealed = true;
        matchSlot.sprintRevealed = true;
        if (nextState.manhunt) {
          nextState.manhunt.revealedCount += 1;
        }

        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "marshal",
          description: `MANHUNT HIT! Revealed Hideout ${guess}!`,
          timestamp: Date.now(),
          isHit: true,
        });

        // Check if every hideout except card 42 is revealed
        // (Sprint cards under 42 are never revealed; card 42 itself is the state line)
        const unrevealedRemaining = nextState.highway.filter(
          (s) => s.slotIndex > 0 && s.card !== 42 && !s.isRevealed
        );

        if (unrevealedRemaining.length === 0) {
          nextState.phase = "game_over";
          nextState.winner = "marshal";
          nextState.winReason = "Marshal caught the Fugitive during the Manhunt!";
          return nextState;
        }

        // Continue manhunt (Marshal guesses again)
        return nextState;
      } else {
        // ONE MISS = FUGITIVE ESCAPES!
        nextState.history.unshift({
          turnNumber: state.turnNumber,
          player: "marshal",
          description: `MANHUNT FAILED! Guess ${guess} was a miss. Fugitive escapes!`,
          timestamp: Date.now(),
          isHit: false,
        });

        nextState.phase = "game_over";
        nextState.winner = "fugitive";
        nextState.winReason = `Marshal missed guess ${guess} during Manhunt. Fugitive escaped!`;
        return nextState;
      }
    }

    default:
      throw new Error("Unknown action.");
  }
}
