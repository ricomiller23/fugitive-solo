# FUGITIVE — Solo Edition

A solo card game adaptation of Tim Fowers' 2-player hidden movement game, engineered with a **Desert Noir 1960s aesthetic**, procedural mid-century vector card art, a synthesized Web Audio engine, and an information-isolated AI opponent across three difficulty tiers.

---

## Quick Start

```bash
cd /Users/ericmiller/.gemini/antigravity/scratch/fugitive-solo
npm install
npm run dev
```

Visit `http://localhost:5173` to play in browser.

To run the unit and simulation tests:
```bash
npm test
```

To build for production:
```bash
npm run build
npm run preview
```

---

## Architecture & Design Highlights

### 1. Framework-Free Game Engine (`/src/engine`)
The game engine is self-contained with no React imports:
- **`sprint.ts`**: Single source of truth for card sprint values (`SPRINT_VALUES: Record<number, 1 | 2>`). Odd cards grant +1 sprint; even cards grant +2 sprint; card 42 has no sprint value.
- **`types.ts`**: Immutable actions, game phases, roles, and manhunt state.
- **`state.ts`**: Authoritative `GameState` and information-hiding projections (`projectToMarshalView`, `projectToFugitiveView`).
- **`rules.ts`**: Pure reducer `applyAction(state, action)` enforcing movement bounds, deck draws, raid resolutions, manhunt triggers, and victory conditions.

### 2. Information-Isolated AI Solver (`/src/engine/ai`)
- **Strict Information Hiding**: The AI Marshal strictly receives `MarshalView`. It never accesses the true underlying state or hidden cards.
- **Inference Solver (`marshalSolver.ts`)**: Models probability distributions per unrevealed hideout slot by factoring in:
  - Cards held in Marshal's hand (eliminated from board)
  - Cards already found on the highway
  - Sprints revealed on found hideouts
  - Deck counts remaining across Decks A, B, and C
  - Candidate bounds: previous hideout + 1 to previous hideout + 3 + max sprint
- **Three Distinct AI Difficulties**:
  1. **Rookie Deputy (Default, Easy)**: Raids front-line hideouts with basic card logic; never multi-guesses. Recommended for initial games.
  2. **Detective (Medium)**: Selects the single guess with highest candidate probability based on Bayesian inference.
  3. **U.S. Marshal (Hard)**: Evaluates multi-card raids when candidate bounds collapse and handles the Manhunt dragnet with optimal target sequencing.

### 3. Procedural Desert Noir Vector Artwork (`/src/art/cardSvgScenes.tsx`)
- All 43 cards (0 through 42) feature unique procedural SVG graphic scenes seeded by card number:
  - **Card 0 (County Jail)**: Searchlight beams, guard towers, cut razor wire.
  - **Cards 1–14 (Deck A / Lowlands)**: Dusty alleys, scrap yards, abandoned gas stations, Route 66 motels.
  - **Cards 15–28 (Deck B / Badlands)**: Red rock canyons, mesa lookouts, telegraph wires, arroyo crossings.
  - **Cards 29–41 (Deck C / High Sierra)**: Pine ridge switchbacks, mountain passes, airstrips, gorge trestles.
  - **Card 42 (State Line)**: Golden sunrise horizon and the welcoming freedom highway monument.
- Tactile 3D card flips with rubber-ink "FOUND" stamps upon successful raids.

### 4. Synthesized Audio Engine (`/src/audio/soundManager.ts`)
- Pure Web Audio API synthesizer requiring no external audio downloads.
- Generates paper card slides, tactile flips, wooden thuds on placement, rubber ink stamps on raids, dull metallic miss pings, manhunt sirens, and heartbeat tension pulses.

---

## Test Suite

- **Engine Tests (`tests/engine.test.ts`)**: Validates setup deck distributions, sprint math, single-card raids, multi-card raids, and the card 42 threshold (manhunt if highest revealed <= 29; immediate escape if > 29).
- **AI Information Isolation Tests (`tests/ai.test.ts`)**: Confirms `solveMarshalInference` takes strictly `MarshalView` and eliminates cards held in hand or revealed on the board.
- **Gameplay Simulations (`tests/simulation.test.ts`)**: Runs autonomous games across Rookie, Detective, and U.S. Marshal difficulties to verify game resolution without illegal moves.

---

## Visual Deliverables

All high-resolution screenshots are exported to `~/Downloads` (`/Users/ericmiller/Downloads`):
1. `fugitive_01_title_screen.png`: Desert Noir title screen with difficulty selector and role picker.
2. `fugitive_02_highway_midgame.png`: Highway ribbon with active hideouts, sprint footprints, and player hand.
3. `fugitive_03_mobile_viewport.png`: Mobile phone layout tested at 390x844 iPhone benchmark.
4. `fugitive_04_case_file_dossier.png`: U.S. Marshal evidence grid (1–41) and activity chronology.
5. `fugitive_05_end_screen_reveal.png`: Case resolution screen showing the full highway reveal and route metrics.
