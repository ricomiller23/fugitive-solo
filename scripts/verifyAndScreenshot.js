import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const DOWNLOADS_DIR = "/Users/ericmiller/Downloads";
const SCREENSHOTS_DIR = "/Users/ericmiller/.gemini/antigravity/scratch/fugitive-solo/screenshots";

async function run() {
  console.log("Starting preview server on port 4173...");
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

    console.log("Navigating to http://localhost:4173...");
    await page.goto("http://localhost:4173", { waitUntil: "networkidle" });

    // 1. Title Screen Screenshot
    console.log("Capturing Title Screen...");
    const titlePath = path.join(SCREENSHOTS_DIR, "fugitive_01_title_screen.png");
    await page.screenshot({ path: titlePath, fullPage: true });

    // Test Tutorial Modal
    console.log("Testing Tutorial modal click...");
    await page.click("button:has-text('How To Play')");
    await page.waitForTimeout(600);
    await page.click("button[aria-label='Close']");
    await page.waitForTimeout(400);

    // Test Settings Modal
    console.log("Testing Settings modal click...");
    await page.click("button:has-text('Settings')");
    await page.waitForTimeout(600);
    await page.click("button:has-text('Done')");
    await page.waitForTimeout(400);

    // 2. Mobile Viewport Test (390x844 iPhone dimensions per Rule 20)
    console.log("Testing Mobile Viewport (390x844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);
    const mobilePath = path.join(SCREENSHOTS_DIR, "fugitive_03_mobile_viewport.png");
    await page.screenshot({ path: mobilePath, fullPage: true });

    // Return to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);

    // 3. Start Game as Fugitive
    console.log("Starting Game as Fugitive...");
    await page.click("button:has-text('PLAY AS FUGITIVE')");
    await page.waitForTimeout(1000);

    // Turn 1: Initial Hideout Placement
    console.log("Executing Turn 1 initial placement...");
    const cards = await page.$$("footer .relative.select-none");
    if (cards.length > 0) {
      // Click first card (usually Card 1 or 2)
      await cards[0].click();
      await page.waitForTimeout(400);

      const placeBtn = await page.$("button:has-text('Place Hideout')");
      if (placeBtn && !(await placeBtn.isDisabled())) {
        await placeBtn.click();
        console.log("Placed initial hideout successfully!");
        await page.waitForTimeout(2000); // Wait for AI Marshal turn
      }
    }

    // Capture Mid-Game Highway
    console.log("Capturing Mid-Game Highway...");
    const highwayPath = path.join(SCREENSHOTS_DIR, "fugitive_02_highway_midgame.png");
    await page.screenshot({ path: highwayPath, fullPage: true });

    // Open Case Dossier
    console.log("Opening Case Dossier...");
    await page.click("button:has-text('Dossier')");
    await page.waitForTimeout(600);
    const dossierPath = path.join(SCREENSHOTS_DIR, "fugitive_04_case_file_dossier.png");
    await page.screenshot({ path: dossierPath, fullPage: true });
    await page.click("button:has-text('Close Dossier')");
    await page.waitForTimeout(500);

    // Copy all screenshots to ~/Downloads (Rule 6)
    console.log("Exporting screenshots to ~/Downloads as per Rule 6...");
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    for (const f of files) {
      if (f.endsWith(".png")) {
        const src = path.join(SCREENSHOTS_DIR, f);
        const dest = path.join(DOWNLOADS_DIR, f);
        fs.copyFileSync(src, dest);
        console.log(`Exported: ${f} -> ${dest}`);
      }
    }

    console.log("Script completed successfully!");
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
