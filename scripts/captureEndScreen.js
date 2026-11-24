import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const DOWNLOADS_DIR = "/Users/ericmiller/Downloads";
const SCREENSHOTS_DIR = "/Users/ericmiller/.gemini/antigravity/scratch/fugitive-solo/screenshots";

async function run() {
  const server = spawn("npx", ["vite", "preview", "--port", "4173", "--strictPort"], {
    cwd: "/Users/ericmiller/.gemini/antigravity/scratch/fugitive-solo",
    stdio: "inherit",
  });

  await new Promise((r) => setTimeout(r, 2000));

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto("http://localhost:4173", { waitUntil: "networkidle" });

    // Transition store state to game over escape with full highway
    await page.evaluate(() => {
      const store = window.__gameStore;
      if (store) {
        store.setState((prev) => ({
          ...prev,
          screen: "game_over",
          gameState: {
            ...prev.gameState,
            phase: "game_over",
            winner: "fugitive",
            winReason: "Fugitive escaped across the state line at Card 42!",
            highway: [
              { slotIndex: 0, card: 0, isRevealed: true, sprintCards: [], sprintRevealed: false },
              { slotIndex: 1, card: 3, isRevealed: true, sprintCards: [], sprintRevealed: true },
              { slotIndex: 2, card: 8, isRevealed: true, sprintCards: [2], sprintRevealed: true },
              { slotIndex: 3, card: 15, isRevealed: true, sprintCards: [5, 6], sprintRevealed: true },
              { slotIndex: 4, card: 24, isRevealed: true, sprintCards: [18], sprintRevealed: true },
              { slotIndex: 5, card: 32, isRevealed: false, sprintCards: [22], sprintRevealed: false },
              { slotIndex: 6, card: 42, isRevealed: true, sprintCards: [], sprintRevealed: false },
            ],
          },
        }));
      }
    });

    await page.waitForTimeout(600);

    const endPath = path.join(SCREENSHOTS_DIR, "fugitive_05_end_screen_reveal.png");
    await page.screenshot({ path: endPath, fullPage: true });

    const dest = path.join(DOWNLOADS_DIR, "fugitive_05_end_screen_reveal.png");
    fs.copyFileSync(endPath, dest);
    console.log(`Exported end screen to ${dest}`);
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch((err) => {
  console.error("End screen capture failed:", err);
  process.exit(1);
});
