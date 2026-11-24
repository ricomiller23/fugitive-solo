import { AIDifficulty, DeckName, GameAction } from "../types.ts";
import { FugitiveView } from "../state.ts";
import { getSprintValue } from "../sprint.ts";

export interface LegalPlacement {
  card: number;
  sprintCards: number[];
  jumpDistance: number;
}

/**
 * Finds all legal hideout placements given a current last card and available hand.
 */
export function findLegalPlacements(lastCard: number, hand: number[]): LegalPlacement[] {
  const legal: LegalPlacement[] = [];

  // Candidates for hideout: any card in hand > lastCard
  const candidates = hand.filter((c) => c > lastCard);

  for (const card of candidates) {
    const baseGap = card - lastCard;
    if (baseGap <= 3) {
      // No sprint required
      legal.push({ card, sprintCards: [], jumpDistance: baseGap });
      continue;
    }

    const neededSprint = baseGap - 3;
    const sprintPool = hand.filter((c) => c !== card && c !== 42);

    // Try 1 sprint card
    for (let i = 0; i < sprintPool.length; i++) {
      const s1 = sprintPool[i];
      const val1 = getSprintValue(s1);
      if (val1 >= neededSprint) {
        legal.push({ card, sprintCards: [s1], jumpDistance: baseGap });
      }
    }

    // Try 2 sprint cards if needed
    if (neededSprint > 2) {
      for (let i = 0; i < sprintPool.length; i++) {
        for (let j = i + 1; j < sprintPool.length; j++) {
          const s1 = sprintPool[i];
          const s2 = sprintPool[j];
          const totalVal = getSprintValue(s1) + getSprintValue(s2);
          if (totalVal >= neededSprint) {
            legal.push({ card, sprintCards: [s1, s2], jumpDistance: baseGap });
          }
        }
      }
    }

    // Try 3 sprint cards if needed
    if (neededSprint > 4) {
      for (let i = 0; i < sprintPool.length; i++) {
        for (let j = i + 1; j < sprintPool.length; j++) {
          for (let k = j + 1; k < sprintPool.length; k++) {
            const s1 = sprintPool[i];
            const s2 = sprintPool[j];
            const s3 = sprintPool[k];
            const totalVal = getSprintValue(s1) + getSprintValue(s2) + getSprintValue(s3);
            if (totalVal >= neededSprint) {
              legal.push({ card, sprintCards: [s1, s2, s3], jumpDistance: baseGap });
            }
          }
        }
      }
    }
  }

  return legal;
}

/**
 * Choose starting 1 or 2 hideouts on turn 1.
 */
export function chooseFugitiveInitialPlacement(
  hand: number[],
  difficulty: AIDifficulty
): { hideouts: { card: number; sprintCards: number[] }[] } {
  // Turn 1 start at 0
  const legalFirst = findLegalPlacements(0, hand);
  if (legalFirst.length === 0) {
    // Should never happen with starting hand {1, 2, 3, ...}
    return { hideouts: [{ card: 1, sprintCards: [] }] };
  }

  // Evaluate placing 2 hideouts vs 1 hideout
  const twoHideoutOptions: { h1: LegalPlacement; h2: LegalPlacement }[] = [];

  for (const h1 of legalFirst) {
    // Remaining hand after h1
    const used = new Set([h1.card, ...h1.sprintCards]);
    const remHand = hand.filter((c) => !used.has(c));
    const legalSecond = findLegalPlacements(h1.card, remHand);

    for (const h2 of legalSecond) {
      // Don't place 42 on turn 1!
      if (h2.card !== 42) {
        twoHideoutOptions.push({ h1, h2 });
      }
    }
  }

  if (twoHideoutOptions.length > 0 && difficulty !== "rookie") {
    // Pick option that advances well (around card 4 to 8 total) without burning too many cards
    twoHideoutOptions.sort((a, b) => {
      const sprintCostA = a.h1.sprintCards.length + a.h2.sprintCards.length;
      const sprintCostB = b.h1.sprintCards.length + b.h2.sprintCards.length;
      if (sprintCostA !== sprintCostB) return sprintCostA - sprintCostB;
      return b.h2.card - a.h2.card;
    });

    const best = twoHideoutOptions[0];
    return {
      hideouts: [
        { card: best.h1.card, sprintCards: best.h1.sprintCards },
        { card: best.h2.card, sprintCards: best.h2.sprintCards },
      ],
    };
  }

  // Rookie or fallback: pick single or double with minimal sprint
  if (twoHideoutOptions.length > 0) {
    const noSprintTwo = twoHideoutOptions.find(
      (o) => o.h1.sprintCards.length === 0 && o.h2.sprintCards.length === 0
    );
    if (noSprintTwo) {
      return {
        hideouts: [
          { card: noSprintTwo.h1.card, sprintCards: [] },
          { card: noSprintTwo.h2.card, sprintCards: [] },
        ],
      };
    }
  }

  // Pick single first card
  const bestSingle = legalFirst.find((h) => h.card === 2 || h.card === 3) || legalFirst[0];
  return {
    hideouts: [{ card: bestSingle.card, sprintCards: bestSingle.sprintCards }],
  };
}

/**
 * Choose which deck the Fugitive should draw from.
 */
export function chooseFugitiveDrawDeck(view: FugitiveView): DeckName {
  const lastSlot = view.highway[view.highway.length - 1];
  const lastCard = lastSlot ? lastSlot.card : 0;

  const available: DeckName[] = [];
  if (view.deckCounts.A > 0) available.push("A");
  if (view.deckCounts.B > 0) available.push("B");
  if (view.deckCounts.C > 0) available.push("C");

  if (available.length === 0) return "A";

  if (lastCard <= 11 && view.deckCounts.A > 0) {
    return "A";
  } else if (lastCard <= 25 && view.deckCounts.B > 0) {
    return "B";
  } else if (view.deckCounts.C > 0) {
    return "C";
  }

  return available[0];
}

/**
 * Choose Fugitive turn action: place a hideout or pass.
 */
export function chooseFugitiveTurnAction(view: FugitiveView): GameAction {
  const lastSlot = view.highway[view.highway.length - 1];
  const lastCard = lastSlot ? lastSlot.card : 0;

  const legal = findLegalPlacements(lastCard, view.fugitiveHand);
  if (legal.length === 0) {
    return { type: "FUGITIVE_PASS" };
  }

  // Check if 42 can be placed
  const canPlace42 = legal.filter((l) => l.card === 42);
  if (canPlace42.length > 0) {
    // Check highest revealed
    let highestRevealed = 0;
    for (const s of view.highway) {
      if (s.isRevealed && s.card > highestRevealed) {
        highestRevealed = s.card;
      }
    }

    // If highest revealed > 29, Fugitive wins immediately!
    if (highestRevealed > 29) {
      const best = canPlace42.sort((a, b) => a.sprintCards.length - b.sprintCards.length)[0];
      return { type: "FUGITIVE_PLACE", hideout: 42, sprintCards: best.sprintCards };
    }

    // In manhunt trigger condition: how many unrevealed slots exist?
    const unrevealedCount = view.highway.filter((s) => !s.isRevealed).length;
    // If 2 or more unrevealed slots, manhunt is very advantageous for Fugitive
    if (unrevealedCount >= 2 || view.fugitiveHand.length <= 2) {
      const best = canPlace42.sort((a, b) => a.sprintCards.length - b.sprintCards.length)[0];
      return { type: "FUGITIVE_PLACE", hideout: 42, sprintCards: best.sprintCards };
    }
  }

  // Filter out 42 if we decided to wait
  const regularPlacements = legal.filter((l) => l.card !== 42);
  if (regularPlacements.length === 0) {
    if (canPlace42.length > 0) {
      const best = canPlace42[0];
      return { type: "FUGITIVE_PLACE", hideout: 42, sprintCards: best.sprintCards };
    }
    return { type: "FUGITIVE_PASS" };
  }

  // Prefer placements that advance steadily (gap of 2 to 6) without using more than 1 sprint card
  regularPlacements.sort((a, b) => {
    // Penalize high sprint cost
    const sprintDiff = a.sprintCards.length - b.sprintCards.length;
    if (sprintDiff !== 0) return sprintDiff;
    // Prefer healthy progress (card gap around 3..5)
    return Math.abs(a.jumpDistance - 4) - Math.abs(b.jumpDistance - 4);
  });

  const chosen = regularPlacements[0];
  return {
    type: "FUGITIVE_PLACE",
    hideout: chosen.card,
    sprintCards: chosen.sprintCards,
  };
}
