import { MarshalView, PublicHideoutSlot } from "../state.ts";

export interface CandidateSlotAnalysis {
  slotIndex: number;
  sprintCount: number;
  minPossible: number;
  maxPossible: number;
  candidateProbabilities: { card: number; probability: number }[];
  mostLikelyCard: number | null;
}

export interface SolverResult {
  slots: CandidateSlotAnalysis[];
  bestSingleGuess: number | null;
  bestMultiGuess: number[] | null;
  confidence: number; // 0..1
}

/**
 * Solves possible hideout assignments strictly using information available to the Marshal.
 * NEVER accesses hidden GameState!
 */
export function solveMarshalInference(view: MarshalView): SolverResult {
  const eliminated = new Set<number>();

  // 1. Cards in Marshal hand are known not to be on the board
  for (const c of view.marshalHand) {
    eliminated.add(c);
  }

  // 2. Cards already revealed on the highway
  for (const slot of view.highway) {
    if (slot.isRevealed && slot.card !== null) {
      eliminated.add(slot.card);
    }
    if (slot.sprintCards) {
      for (const s of slot.sprintCards) {
        eliminated.add(s);
      }
    }
  }

  // 3. Previously missed guesses cannot be hideouts
  for (const g of view.guessedNumbers) {
    const isRevealed = view.highway.some((s) => s.isRevealed && s.card === g);
    if (!isRevealed) {
      eliminated.add(g);
    }
  }

  // Identify unrevealed slots
  const unrevealedSlots = view.highway.filter((s) => !s.isRevealed && s.slotIndex > 0);
  if (unrevealedSlots.length === 0) {
    return {
      slots: [],
      bestSingleGuess: null,
      bestMultiGuess: null,
      confidence: 1.0,
    };
  }

  // Bounding intervals for each slot
  const slotBounds: { slot: PublicHideoutSlot; min: number; max: number }[] = [];

  for (let i = 0; i < view.highway.length; i++) {
    const cur = view.highway[i];
    if (cur.slotIndex === 0) continue; // slot 0 is always 0

    // Find preceding revealed bound
    let lowerBound = 0;
    for (let p = i - 1; p >= 0; p--) {
      if (view.highway[p].isRevealed && view.highway[p].card !== null) {
        lowerBound = view.highway[p].card!;
        // Add 1 for every intermediate slot
        lowerBound += i - p;
        break;
      }
    }

    // Find succeeding revealed bound
    let upperBound = 42;
    for (let s = i + 1; s < view.highway.length; s++) {
      if (view.highway[s].isRevealed && view.highway[s].card !== null) {
        upperBound = view.highway[s].card!;
        // Subtract 1 for every intermediate slot
        upperBound -= s - i;
        break;
      }
    }

    // If cur is the last slot and card 42 was played
    if (i === view.highway.length - 1 && view.manhunt) {
      upperBound = 42;
    }

    // Maximum jump forward from previous slot: 3 + 2 * sprintCount
    const prevSlot = view.highway[i - 1];
    let maxJumpFromPrev = 42;
    if (prevSlot.isRevealed && prevSlot.card !== null) {
      maxJumpFromPrev = prevSlot.card + 3 + 2 * cur.sprintCount;
    }

    const effectiveMin = Math.max(1, lowerBound);
    const effectiveMax = Math.min(41, upperBound, maxJumpFromPrev);

    if (!cur.isRevealed) {
      slotBounds.push({
        slot: cur,
        min: effectiveMin,
        max: effectiveMax,
      });
    }
  }

  // Enumerate consistent candidate assignments using Monte Carlo / Constraint Satisfaction
  const cardFrequency = new Map<number, number>();
  const slotCardFrequency: Map<number, Map<number, number>> = new Map();
  for (const b of slotBounds) {
    slotCardFrequency.set(b.slot.slotIndex, new Map());
  }

  let validSampleCount = 0;
  const startTime = Date.now();
  const maxDurationMs = 120; // under 150ms budget

  function explore(slotIdx: number, prevCard: number, chosen: number[]): boolean {
    if (slotIdx >= slotBounds.length) {
      validSampleCount++;
      chosen.forEach((c, idx) => {
        cardFrequency.set(c, (cardFrequency.get(c) || 0) + 1);
        const map = slotCardFrequency.get(slotBounds[idx].slot.slotIndex)!;
        map.set(c, (map.get(c) || 0) + 1);
      });
      return true;
    }

    if (Date.now() - startTime > maxDurationMs) {
      return false; // time budget reached
    }

    const { slot, min, max } = slotBounds[slotIdx];
    const actualMin = Math.max(min, prevCard + 1);
    const actualMax = Math.min(max, prevCard + 3 + 2 * slot.sprintCount);

    for (let c = actualMin; c <= actualMax; c++) {
      if (eliminated.has(c)) continue;
      if (chosen.includes(c)) continue;

      chosen.push(c);
      const keepGoing = explore(slotIdx + 1, c, chosen);
      chosen.pop();
      if (!keepGoing) return false;
    }
    return true;
  }

  explore(0, 0, []);

  // If no assignments found due to tight constraints, fall back to uniform distribution in bounds
  if (validSampleCount === 0) {
    for (const b of slotBounds) {
      const candidates: number[] = [];
      for (let c = b.min; c <= b.max; c++) {
        if (!eliminated.has(c)) candidates.push(c);
      }
      for (const c of candidates) {
        cardFrequency.set(c, (cardFrequency.get(c) || 0) + 1);
        const map = slotCardFrequency.get(b.slot.slotIndex)!;
        map.set(c, 1);
      }
    }
    validSampleCount = 1;
  }

  const slotAnalyses: CandidateSlotAnalysis[] = slotBounds.map((b) => {
    const freqMap = slotCardFrequency.get(b.slot.slotIndex)!;
    const totalSlotCount = Array.from(freqMap.values()).reduce((sum, n) => sum + n, 0) || 1;

    const candidateProbabilities = Array.from(freqMap.entries())
      .map(([card, count]) => ({
        card,
        probability: count / totalSlotCount,
      }))
      .sort((a, b) => b.probability - a.probability);

    const mostLikelyCard =
      candidateProbabilities.length > 0 ? candidateProbabilities[0].card : null;

    return {
      slotIndex: b.slot.slotIndex,
      sprintCount: b.slot.sprintCount,
      minPossible: b.min,
      maxPossible: b.max,
      candidateProbabilities,
      mostLikelyCard,
    };
  });

  // Best single guess: overall most frequent candidate across all slots
  const sortedOverall = Array.from(cardFrequency.entries()).sort((a, b) => b[1] - a[1]);
  const bestSingleGuess = sortedOverall.length > 0 ? sortedOverall[0][0] : null;

  // Best multi-guess: slots that have high individual probability (> 0.65)
  const highConfidenceGuesses: number[] = [];
  for (const analysis of slotAnalyses) {
    if (analysis.candidateProbabilities.length > 0) {
      const top = analysis.candidateProbabilities[0];
      if (top.probability >= 0.70 && !highConfidenceGuesses.includes(top.card)) {
        highConfidenceGuesses.push(top.card);
      }
    }
  }

  const bestMultiGuess = highConfidenceGuesses.length >= 2 ? highConfidenceGuesses : null;
  const topProb =
    sortedOverall.length > 0 ? sortedOverall[0][1] / (validSampleCount * slotBounds.length || 1) : 0;

  return {
    slots: slotAnalyses,
    bestSingleGuess,
    bestMultiGuess,
    confidence: Math.min(1.0, topProb),
  };
}
