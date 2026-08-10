/**
 * Copy the eval report out of the agent project, narrowed to what the site shows.
 *
 * The per-case detail is dropped — 144 rows of "blocked by input.injection,
 * expected input.injection" is the right artifact for a terminal and the wrong
 * one for a page. The headline, the twelve metric scores and the calibration
 * note survive, because those are the claims the site makes.
 *
 * Deliberately a copy rather than an import across the directory boundary: the
 * site must build on a machine that has only this repository checked out, and a
 * committed snapshot is honest as long as its provenance travels with it.
 *
 *   npm run sync:evals
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const SOURCE = resolve(process.cwd(), "..", "portfolio", "evals", "report", "latest.json");
const OUT = join(process.cwd(), "data", "evals.json");

type SourceReport = {
  generatedAt: string;
  tier: string;
  model: string;
  embeddingModel: string;
  groundingFloor: number;
  overall: number;
  totals: { passed: number; total: number };
  notes: string[];
  metrics: { name: string; label: string; score: number; passed: number; total: number }[];
};

if (!existsSync(SOURCE)) {
  console.error(`No eval report at ${SOURCE}`);
  console.error("Run `npm run eval:full` in the Agent_Architecture_model checkout first.");
  process.exit(1);
}

const report = JSON.parse(readFileSync(SOURCE, "utf8")) as SourceReport;

const narrowed = {
  generatedAt: report.generatedAt,
  tier: report.tier,
  model: report.model,
  embeddingModel: report.embeddingModel,
  groundingFloor: report.groundingFloor,
  overall: report.overall,
  totals: report.totals,
  notes: report.notes,
  metrics: report.metrics.map(({ name, label, score, passed, total }) => ({
    name,
    label,
    score,
    passed,
    total,
  })),
  provenance: {
    project: "Agent_Architecture_model",
    file: "evals/report/latest.json",
    syncedBy: "scripts/sync-evals.ts",
  },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(narrowed, null, 2) + "\n");

const pct = (report.overall * 100).toFixed(1);
console.log(
  `Synced ${narrowed.metrics.length} metrics — ${pct}% overall ` +
    `(${report.totals.passed}/${report.totals.total}), generated ${report.generatedAt}`,
);
