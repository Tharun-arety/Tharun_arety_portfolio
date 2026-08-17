/**
 * Capture evidence for Sheet 03 from the toolchain running locally.
 *
 * Sheet 03 is the largest system on the site and was the only one with nothing
 * a reader could verify — no live link, no repository, no image. The approval
 * gate is its strongest architectural claim and existed purely as prose.
 *
 * Drives an installed Chrome through puppeteer-core rather than downloading a
 * browser: the screenshots are of the real application, signed in as a real
 * seeded role, against the real database.
 *
 * Prerequisites — from `../Magnotherm`:
 *   backend   .venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
 *   frontend  npm run dev -- --port 3001
 *
 *   npm run capture:sheet03
 */

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import puppeteer, { type Browser, type Page } from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const APP = process.env.MT_URL ?? "http://localhost:3001";
const OUT = join(process.cwd(), "public", "shots");

/** Seeded demo credentials. Documented in the toolchain's own README; the
 *  dataset is synthetic and carries no personal or customer data. */
const EMAIL = "admin@magnotherm.test";
const PASSWORD = "magnotherm";

/** `expect` is a string that must appear on the rendered page. Without it a
 *  capture can silently succeed against an empty state or a redirect — which is
 *  exactly what happened on the first two runs. */
type Shot = { slug: string; path: string; expect: string; describe: string };

const SHOTS: Shot[] = [
  {
    slug: "pdm-bom",
    path: "/pdm",
    expect: "ECL-SYS-100",
    describe: "Nested bill of materials with lifecycle state per part.",
  },
  {
    slug: "approval-inbox",
    path: "/approval-inbox",
    expect: "waits here with its dry-run preview",
    describe: "Agent proposals waiting on a person with the right role.",
  },
  {
    slug: "agent-runs",
    path: "/agent-runs",
    expect: "Agent runs",
    describe: "Router decisions and tool calls, per run.",
  },
];

async function signIn(page: Page): Promise<void> {
  await page.goto(APP, { waitUntil: "networkidle2" });
  await page.waitForSelector("#login-password", { timeout: 20_000 });

  /**
   * Set the values through React's own setter, then submit the form.
   *
   * `page.type` left the fields looking filled while React's state stayed
   * empty, so the submit posted blank credentials and the form never cleared.
   * Going through the prototype's value setter and dispatching `input` is what
   * a controlled component actually listens for. `requestSubmit` runs the
   * React submit handler rather than doing a native form post.
   */
  // Passed as a string rather than a function: tsx compiles evaluated closures
  // through esbuild, which injects a `__name` helper that does not exist in the
  // page and fails with "__name is not defined".
  await page.evaluate(`(() => {
    const setValue = (element, value) => {
      const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, "value").set;
      setter.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    };
    setValue(document.querySelector("#login-email"), ${JSON.stringify(EMAIL)});
    setValue(document.querySelector("#login-password"), ${JSON.stringify(PASSWORD)});
    document.querySelector("form").requestSubmit();
  })()`);

  // Signed in when the login form is gone.
  await page
    .waitForFunction('!document.querySelector("#login-password")', { timeout: 30_000 })
    .catch(() => {
      throw new Error("Sign-in did not clear the password field — check the seeded credentials.");
    });

  // The dashboard renders "Loading…" before its first fetch resolves.
  await page
    .waitForFunction('!document.body.innerText.includes("Loading…")', { timeout: 20_000 })
    .catch(() => {
      /* some views have no loading state; carry on */
    });
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: true,
      // 2x so the stills stay sharp on a retina display without upscaling.
      defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
      args: ["--hide-scrollbars"],
    });

    const page = await browser.newPage();
    console.log(`Signing in to ${APP} as ${EMAIL}`);
    await signIn(page);
    console.log("Signed in.\n");

    for (const shot of SHOTS) {
      process.stdout.write(`  ${shot.slug.padEnd(18)} `);

      /**
       * Navigate by clicking the app's own nav link, not with `page.goto`.
       *
       * The access token lives in memory and the refresh token in an httpOnly
       * cookie, so a full document load drops the session and the router sends
       * you back to sign-in. The first run captured three identical pictures of
       * the login form. Client-side routing keeps the token.
       */
      await page.evaluate(`document.querySelector('a[href="${shot.path}"]').click()`);
      await page.waitForFunction(`location.pathname === ${JSON.stringify(shot.path)}`, {
        timeout: 20_000,
      });
      await page
        .waitForFunction('!document.body.innerText.includes("Loading…")', { timeout: 20_000 })
        .catch(() => {
          /* some views have no loading state */
        });
      // Let panels and charts settle before the shutter.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Fail loudly rather than shipping another picture of the login form.
      const bounced = await page.evaluate('!!document.querySelector("#login-password")');
      if (bounced) throw new Error(`${shot.slug}: bounced to sign-in — the session was lost.`);

      const onRightPage = await page.evaluate(
        `document.body.innerText.includes(${JSON.stringify(shot.expect)})`,
      );
      if (!onRightPage) {
        throw new Error(`${shot.slug}: page did not contain ${JSON.stringify(shot.expect)}.`);
      }

      const file = join(OUT, `sheet03-${shot.slug}.png`);
      await page.screenshot({ path: file as `${string}.png`, fullPage: true });
      console.log(`captured → public/shots/sheet03-${shot.slug}.png`);
    }

    console.log(`\nDone. ${SHOTS.length} stills in ${OUT}`);
  } finally {
    await browser?.close();
  }
}

main().catch((cause) => {
  console.error("\nCapture failed:", cause instanceof Error ? cause.message : cause);
  console.error("Is the toolchain running? See the header of this file.");
  process.exit(1);
});
