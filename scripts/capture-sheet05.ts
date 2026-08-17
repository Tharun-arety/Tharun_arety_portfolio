/**
 * Capture evidence for Sheet 05 from TalentFlow running locally.
 *
 * TalentFlow is deployed and linked from the case study, but it is invite-only
 * on purpose — an applicant tracking system holds candidates' names, contact
 * details and CVs, and a valid Google account is not consent to read them. So a
 * reader cannot get past its sign-in page, and the screenshots have to come
 * from somewhere else.
 *
 * They come from the application's own zero-setup path: an in-process Postgres
 * over a real socket, migrations applied and seeded with fictional data. That
 * is the same code against the same schema, with nobody's real details in it.
 *
 * Prerequisites — from `../hiring-pipeline`:
 *   database  npm run db:local -- --seed
 *   app       DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres \
 *             AUTH_TRUST_HOST=true npm run dev -- --port 3002
 *
 *   npm run capture:sheet05
 */

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import puppeteer, { type Browser, type Page } from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const APP = process.env.TF_URL ?? "http://localhost:3002";
const OUT = join(process.cwd(), "public", "shots");

/** Seeded demo credentials, documented in TalentFlow's own README. The account
 *  is an admin so the stills show the full product rather than a role's subset. */
const EMAIL = "priya.raman@northwind.example";
const PASSWORD = "talentflow";

/**
 * The dataset must be the fictional one.
 *
 * The app's real deployment runs against Neon, and its `.env.local` still
 * points there. Shell variables take precedence over `.env` files, so the dev
 * server above uses the local socket — but "should" is not a guarantee worth
 * betting a candidate's personal details on. Every seeded address ends in one
 * of these reserved domains, so this check fails the capture rather than
 * shipping a picture of someone real.
 */
const SYNTHETIC = /@(?:[a-z0-9.-]+\.)?(?:example\.com|northwind\.example)\b/i;

type Shot = {
  slug: string;
  path: string;
  expect: string;
  /** The board is a horizontally scrolling region with its own maximum width,
   *  so a wider viewport only adds margin — 1920 is where the most stages fit. */
  width?: number;
};

const SHOTS: Shot[] = [
  {
    slug: "pipeline",
    path: "/pipeline",
    // Stage columns are the claim the case study makes about this system.
    expect: "Screening",
    width: 1920,
  },
  {
    slug: "funnel",
    path: "/dashboard",
    expect: "Offer",
  },
  {
    slug: "scorecard",
    // Resolved at capture time — see `findScoredCandidate`.
    path: "",
    expect: "Scorecards",
  },
];

/**
 * Find a candidate who actually has structured feedback against them.
 *
 * "Gather structured feedback" is one of the case study's claims, and the seed
 * spreads twelve scorecards across fifty-two candidates — so picking the first
 * row would usually produce a picture of an empty tab. This walks the list
 * until it finds one with a scorecard, and fails rather than shooting a blank.
 */
async function findScoredCandidate(page: Page): Promise<string> {
  await page.goto(`${APP}/candidates`, { waitUntil: "networkidle2" });
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const paths = (await page.evaluate(`(() => {
    const links = Array.from(document.querySelectorAll('a[href^="/candidates/"]'));
    return Array.from(new Set(links.map((link) => link.getAttribute("href"))));
  })()`)) as string[];

  for (const path of paths.slice(0, 20)) {
    await page.goto(`${APP}${path}`, { waitUntil: "networkidle2" });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    // The tab carries its own count, so the page states whether it is worth shooting.
    const scored = (await page.evaluate(`(() => {
      const text = document.body.innerText;
      const match = text.match(/Scorecards\\s*(\\d+)/);
      return match ? Number(match[1]) > 0 : false;
    })()`)) as boolean;
    if (scored) return path;
  }

  throw new Error("No seeded candidate has a scorecard — was the database seeded?");
}

async function signIn(page: Page): Promise<void> {
  await page.goto(`${APP}/login`, { waitUntil: "networkidle2" });

  // The password form is behind a disclosure — Google is the primary path.
  // Passed as a string because tsx compiles evaluated closures through esbuild,
  // which injects a `__name` helper that does not exist in the page.
  await page.evaluate(`(() => {
    const button = Array.from(document.querySelectorAll("button"))
      .find((element) => element.innerText.includes("password instead"));
    if (button) button.click();
  })()`);
  await page.waitForSelector('input[type="password"]', { timeout: 20_000 });

  /** Set values through React's own setter. `page.type` leaves a controlled
   *  input looking filled while its state stays empty, so the form posts blank
   *  credentials — the failure that cost three runs on Sheet 03. */
  await page.evaluate(`(() => {
    const setValue = (element, value) => {
      const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, "value").set;
      setter.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    };
    setValue(document.querySelector('input[type="email"]'), ${JSON.stringify(EMAIL)});
    setValue(document.querySelector('input[type="password"]'), ${JSON.stringify(PASSWORD)});
    document.querySelector("form").requestSubmit();
  })()`);

  await page
    .waitForFunction('!location.pathname.startsWith("/login")', { timeout: 30_000 })
    .catch(() => {
      throw new Error(
        "Sign-in never left /login — is the local database seeded, and is the app pointed at it?",
      );
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
      process.stdout.write(`  ${shot.slug.padEnd(12)} `);

      await page.setViewport({
        width: shot.width ?? 1440,
        height: 900,
        deviceScaleFactor: 2,
      });
      const path = shot.slug === "scorecard" ? await findScoredCandidate(page) : shot.path;
      await page.goto(`${APP}${path}`, { waitUntil: "networkidle2" });

      if (shot.slug === "scorecard") {
        // Open the tab the shot is about; it is not the default one.
        await page.evaluate(`(() => {
          const tab = Array.from(document.querySelectorAll("button, [role=tab]"))
            .find((element) => element.innerText.trim().startsWith("Scorecards"));
          if (tab) tab.click();
        })()`);
      }

      /** These are captured from `next dev`, which floats its own development
       *  indicator over the bottom-left corner. It belongs to the toolchain,
       *  not to the product, so it is hidden rather than cropped around. */
      await page.evaluate(`(() => {
        const style = document.createElement("style");
        style.textContent = "nextjs-portal, #next-logo, [data-nextjs-toast] { display: none !important; }";
        document.head.appendChild(style);
      })()`);

      // Board columns and charts mount after their first data fetch.
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const text = (await page.evaluate("document.body.innerText")) as string;

      if (/sign in|invite-only/i.test(text) && !text.includes(shot.expect)) {
        throw new Error(`${shot.slug}: bounced to sign-in — the session was lost.`);
      }
      if (!text.includes(shot.expect)) {
        throw new Error(`${shot.slug}: page did not contain ${JSON.stringify(shot.expect)}.`);
      }

      // The guarantee that nobody real is in this picture.
      const addresses = text.match(/[\w.+-]+@[\w.-]+\.\w+/g) ?? [];
      const outsiders = addresses.filter((address) => !SYNTHETIC.test(address));
      if (outsiders.length > 0) {
        throw new Error(
          `${shot.slug}: non-synthetic address on the page (${outsiders[0]}). ` +
            "Refusing to capture — this looks like the production database.",
        );
      }

      /**
       * Trim the empty half of the frame.
       *
       * These are fixed-height application layouts, so a page with three cards
       * on it still renders 900px tall and the still arrives mostly blank. This
       * measures how far down the content actually reaches and cuts there —
       * cropping only, never restyling what was rendered.
       */
      const height = (await page.evaluate(`(() => {
        const main = document.querySelector("main") ?? document.body;
        let bottom = 0;
        for (const element of main.querySelectorAll("*")) {
          const box = element.getBoundingClientRect();
          if (box.width > 0 && box.height > 0) bottom = Math.max(bottom, box.bottom);
        }
        return Math.min(Math.ceil(bottom) + 32, window.innerHeight);
      })()`)) as number;

      const file = join(OUT, `sheet05-${shot.slug}.png`);
      await page.screenshot({
        path: file as `${string}.png`,
        clip: { x: 0, y: 0, width: shot.width ?? 1440, height },
      });
      console.log(`captured → public/shots/sheet05-${shot.slug}.png (${addresses.length} seeded addresses checked)`);
    }

    console.log(`\nDone. ${SHOTS.length} stills in ${OUT}`);
  } finally {
    await browser?.close();
  }
}

main().catch((cause) => {
  console.error("\nCapture failed:", cause instanceof Error ? cause.message : cause);
  console.error("Is TalentFlow running against the local database? See the header of this file.");
  process.exit(1);
});
