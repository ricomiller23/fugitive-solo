// SPRINT VALUES CONFIGURATION
// Check against physical cards if your deck edition differs.
// This is the single source of truth for all sprint values.
// Note: Card 0 is never in a hand. Card 42 cannot be used as a sprint card.

export const SPRINT_VALUES: Record<number, 1 | 2> = {
  1: 1, 2: 2, 3: 1, 4: 2, 5: 1, 6: 2, 7: 1, 8: 2, 9: 1, 10: 2,
  11: 1, 12: 2, 13: 1, 14: 2, 15: 1, 16: 2, 17: 1, 18: 2, 19: 1, 20: 2,
  21: 1, 22: 2, 23: 1, 24: 2, 25: 1, 26: 2, 27: 1, 28: 2, 29: 1, 30: 2,
  31: 1, 32: 2, 33: 1, 34: 2, 35: 1, 36: 2, 37: 1, 38: 2, 39: 1, 40: 2,
  41: 1
  // Card 42 has no sprint value and cannot be played as a sprint card.
};

export function getSprintValue(card: number): number {
  if (card === 42 || card === 0) return 0;
  return SPRINT_VALUES[card] ?? (card % 2 === 1 ? 1 : 2);
}

export function getTotalSprint(cards: number[]): number {
  return cards.reduce((sum, c) => sum + getSprintValue(c), 0);
}
