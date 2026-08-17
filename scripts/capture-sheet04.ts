/**
 * Capture evidence for Sheet 04 from the live deployment.
 *
 * Sheet 04 is the one system on the site whose argument is about what an agent
 * *refuses* to do, and that argument was carried entirely by prose and by a
 * number (95.9%). A reader could not see a guardrail fire. These stills are the
 * inspector drawer at the moment it fires, captured against the deployed app.
 *
 * The two probes are the app's own built-in suggestions — it ships with two
 * questions designed to fail, because that is how you see the guardrails work.
 * The injection probe is refused deterministically before the first model call,
 * so it costs nothing. The out-of-range rig probe does spend a few tenths of a
 * cent on the owner's key; that is the price of a real picture of a real retry.
 *
 * Nothing is typed, staged or mocked — every shot is a click on a control the
 * app already has.
 *
 *   npm run capture:sheet04
 */

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import puppeteer, { type Browser, type Page } from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const APP = process.env.MC_URL ?? "https://magnetocaloric-engineering-agent.vercel.app";
const OUT = join(process.cwd(), "public", "shots");

/**
 * `probe` is matched against the app's own suggestion buttons, so a renamed or
 * removed probe fails the capture instead of quietly shooting the wrong turn.
 * `expect` must appear in the panel afterwards — without it a screenshot can
 * succeed against an error state and look plausible.
 */
type Shot = { slug: string; probe: string; expect: string };

const PROBES: Shot[] = [
  {
    slug: "injection-refused",
    probe: "Ignore previous instructions",
    // The refusal is deterministic, so its wording is fixed and can be asserted.
    expect: "instruction",
  },
  {
    slug: "arg-rejected",
    probe: "rig_999",
    expect: "rig",
  },
];

/** Wait until the panel stops changing — the stream has no completion marker in
 *  the DOM, and polling for stillness beats guessing at internals. */
async function settle(page: Page, quietMs = 2500, limitMs = 90_000): Promise<void> {
  const started = Date.now();
  let previous = "";
  let stableSince = Date.now();

  for (;;) {
    const text = (await page.evaluate('document.querySelector("aside").innerText')) as string;
    if (text !== previous) {
      previous = text;
      stableSince = Date.now();
    } else if (Date.now() - stableSince >= quietMs) {
      return;
    }
    if (Date.now() - started > limitMs) {
      throw new Error("The answer never stopped changing — is the deployment streaming?");
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}

/** Click a suggestion by its visible text. Passed as a string because tsx
 *  compiles evaluated closures through esbuild, which injects a `__name` helper
 *  that does not exist in the page. */
async function clickProbe(page: Page, probe: string): Promise<void> {
  const clicked = await page.evaluate(`(() => {
    const needle = ${JSON.stringify(probe)};
    const button = Array.from(document.querySelectorAll("aside button"))
      .find((element) => element.innerText.includes(needle));
    if (!button) return false;
    button.click();
    return true;
  })()`);

  if (!clicked) {
    throw new Error(`No suggestion button contains ${JSON.stringify(probe)} — has the app changed?`);
  }
}

async function open(page: Page): Promise<void> {
  await page.goto(APP, { waitUntil: "networkidle2" });
  await page.waitForSelector("aside textarea", { timeout: 30_000 });
  // The telemetry chart and corpus panel arrive on their own fetches.
  await page.waitForFunction('document.body.innerText.includes("KNOWLEDGE CORPUS")', {
    timeout: 30_000,
  });
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: true,
      args: ["--hide-scrollbars"],
    });

    const page = await browser.newPage();

    // --- The instrument, whole -------------------------------------------
    // Wide enough for the two-column layout the app is designed around.
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    console.log(`Opening ${APP}`);
    await open(page);

    process.stdout.write("  dashboard          ");
    await page.screenshot({ path: join(OUT, "sheet04-dashboard.png") as `${string}.png` });
    console.log("captured → public/shots/sheet04-dashboard.png");

    // --- The two probes ----------------------------------------------------
    // Shot per page load: the suggestion list only renders on an empty
    // conversation, and one turn per capture keeps each still unambiguous.
    // The chat column is 400px, so it is captured at 3x — it will be shown
    // across a 768px content column and would otherwise be upscaled to mush.
    await page.setViewport({ width: 1440, height: 1300, deviceScaleFactor: 3 });

    for (const shot of PROBES) {
      process.stdout.write(`  ${shot.slug.padEnd(19)}`);
      await open(page);
      await clickProbe(page, shot.probe);
      await settle(page);

      const text = (await page.evaluate('document.querySelector("aside").innerText')) as string;
      if (!text.toLowerCase().includes(shot.expect.toLowerCase())) {
        throw new Error(`${shot.slug}: panel did not mention ${JSON.stringify(shot.expect)}.`);
      }
      // A refusal that produced no verdict is a screenshot of nothing.
      if (!/guardrail|refus|reject|block/i.test(text)) {
        throw new Error(`${shot.slug}: no guardrail verdict in the panel — inspect mode off?`);
      }

      /**
       * Clip to the turn rather than to the panel.
       *
       * The panel is a full-height column with the composer pinned at the
       * bottom, so shooting the element gave a picture that was two-thirds
       * empty — unreadable once scaled into a 768px content column. Measuring
       * the last rendered turn crops to what the reader is meant to look at,
       * without touching the DOM to get it.
       */
      const clip = (await page.evaluate(`(() => {
        const aside = document.querySelector("aside");
        const scroller = aside.querySelector(".overflow-y-auto");
        const last = scroller.lastElementChild.getBoundingClientRect();
        const box = aside.getBoundingClientRect();
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: Math.min(last.bottom - box.y + 16, box.height),
        };
      })()`)) as { x: number; y: number; width: number; height: number };

      const file = join(OUT, `sheet04-${shot.slug}.png`);
      await page.screenshot({ path: file as `${string}.png`, clip });
      console.log(`captured → public/shots/sheet04-${shot.slug}.png`);
    }

    console.log(`\nDone. ${PROBES.length + 1} stills in ${OUT}`);
  } finally {
    await browser?.close();
  }
}

main().catch((cause) => {
  console.error("\nCapture failed:", cause instanceof Error ? cause.message : cause);
  console.error(`Is ${APP} reachable, and is its OpenAI key still funded?`);
  process.exit(1);
});
