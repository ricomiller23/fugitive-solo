# Fugitive Solo Rules & Implementation Notes

## 1. Decks & Initial Setup
- **Total Cards**: 43 cards numbered 0 through 42.
- **Starting Card**: Card 0 (County Jail) starts face up on the highway.
- **Decks**:
  - Deck A: Cards 4 through 14 (11 cards)
  - Deck B: Cards 15 through 28 (14 cards)
  - Deck C: Cards 29 through 41 (13 cards)
- **Fugitive Starting Hand**: Cards 1, 2, 3, 42, plus 3 cards drawn from Deck A and 2 cards drawn from Deck B (9 cards total).
- **Marshal Starting Hand**: 0 cards initially.
- **Turn 1 Special Rule**:
  - Fugitive establishes 1 or 2 hideouts on Turn 1 without drawing.
  - Marshal draws 2 cards from any available deck(s) on Turn 1 before making a raid.
  - Subsequent turns: Fugitive draws 1 card before moving/passing; Marshal draws 1 card before raiding.

## 2. Hideout Jumps & Sprint Values
- Movement from hideout $H_{prev}$ to $H_{next}$ must satisfy $H_{next} > H_{prev}$.
- Base jump distance: $H_{next} \le H_{prev} + 3$.
- Sprints: Extra cards played face down underneath $H_{next}$ provide additional jump distance.
  - Odd cards (1, 3, 5, ..., 41): +1 sprint value.
  - Even cards (2, 4, 6, ..., 40): +2 sprint value.
  - Card 42: Cannot be played as a sprint card.
- Total allowed jump: $H_{next} \le H_{prev} + 3 + \sum \text{sprint values}$.

## 3. Raids & Investigations
- **Single Guess**: Marshal targets one number. If present on the highway, it flips face up and its sprint cards are exposed.
- **Multi-Guess**: Marshal targets multiple numbers. All target numbers must be present on the highway. If even one is wrong, none are revealed!

## 4. Victory & Manhunt Rules
- **Fugitive Victory**:
  - Fugitive establishes Card 42 when the highest revealed hideout is 30 or higher (instant escape).
  - Or Fugitive establishes Card 42 when highest revealed hideout is 29 or lower, and Marshal misses any guess during the subsequent Manhunt.
- **Marshal Victory**:
  - Marshal reveals every hideout on the highway during normal turns.
  - Or Marshal reveals all remaining hideouts consecutively in order during a Manhunt.

## 5. Information Hiding
- The AI Marshal receives only `MarshalView`, which strips unrevealed hideout numbers, unrevealed sprint identities, and the Fugitive's hand.
- The AI Marshal solver computes candidate likelihoods based on visible footprints, hand contents, and previous misses.
