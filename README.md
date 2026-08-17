# Portfolio — AI-Leveraged Systems Architect

A portfolio site for roles where one person, working agentically, owns the systems a company runs
on. Five systems, presented as a controlled document set.

Static Next.js: no database, no API key, no server routes. It deploys anywhere and cannot break
while a hiring manager is reading it.

---

## The two rules

**No client names.** Two of the five systems were built under NDA. They are described by problem
shape, architecture and measured result — never by client, product or geography beyond a region.
Before any push, sweep for the client identifiers.

**No number without a source.** Every figure on the site traces to one of three things:

| Claim | Comes from |
|---|---|
| Eval scores (95.9%, 138/144, the twelve metrics) | `data/evals.json`, synced from the agent project's committed report |
| Latency, tokens, cost, guardrail verdicts | `data/traces/*.json`, captured from real runs |
| ~60 min → <2 min | A measured before/after on the client engagement |

Nothing is estimated, rounded up, or illustrated with plausible-looking values.

---

## The recorded turns

The reliability section replays six real agent turns. They were produced by actually running
[Agent_Architecture_model](https://github.com/Tharun-arety/Agent_Architecture_model) against its
real corpus and model, and recording every SSE frame with the millisecond offset at which it
arrived. The bar is drawn at true scale, so the playhead moves at the speed the turn ran at.

They are labelled as recorded, and the replay never claims to be re-running. A page arguing that AI
systems should be measurable cannot present a simulation as a live system.

To re-capture, with the agent project's dev server running:

```bash
npm run capture -- --base http://localhost:3100
```

Each scenario's `claim` is written **after** reading what the run did. When the capture was first
taken, one scenario labelled "malformed argument, rejected, corrected" turned out to have succeeded
first time, and another turned out to be far better than predicted — the model invented `rig_7`, the
bounds gate rejected it and named the three rigs that exist, and the model corrected itself. The
labels were changed to match the traces, not the other way round.

To re-sync the eval report after running `npm run eval:full` in that project:

```bash
npm run sync:evals
```

---

## Design

A drawing sheet rather than a landing page: drafting-film ground, graphite ink, and two accents that
mean one thing each — **verdigris** for verified/released/passed, **signal** for a human gate or a
guardrail block. Nothing else may use signal.

**Light is the default and the OS preference does not override it.** A released drawing is white,
and a visitor arriving from a link should meet the design as drawn. Dark is one toggle away and only
a stored choice turns it on.

Type is Bricolage Grotesque (headings and every field label, using its width axis the way a title
block is lettered, and its optical-size axis so display sizes are drawn rather than scaled), Geist
(running text), and Geist Mono (every measurement, tabular).

Tech-stack marks are drawn inline in `components/site/StackIcon.tsx` — monochrome `currentColor` on
a 24-unit grid, so no external requests and no nine brand colours in a document whose argument is
that two accents mean two specific things. Anything without a mark worth drawing falls back to a
lettered tile, which looks chosen rather than missing. Tools get marks; concepts like "RAG" do not.

### One thing not to reintroduce

`scroll-behavior: smooth` on `html`. With it set, every in-page anchor silently did nothing — the
hash updated and the page never moved, because something cancels the smooth scroll on its first
frame. Anchors jump instantly now, and they work.

The signature is the **stage bar**: a real turn drawn at true proportions. On a grounded answer the
input guardrails are 2ms of twelve seconds and render as a hairline; on a prompt injection the same
guardrails *are* the turn — one band, one millisecond, zero model calls, $0. Those two pictures next
to each other are the argument.

### Why the stage bar is not in the hero

It was, and it was wrong. The first screen is read by recruiters and founders who do not work in
agent systems, and it opened on `TOOL LOOP`, `SYNTHESIS` and `3 model calls` — the strongest proof on
the site sitting in the one place where nobody had yet been given a reason to care. A reader who
bounces there never reaches the part that would have convinced them.

The hero now opens on the **thesis diagram**: two chains of plain boxes, `Documents → Retrieval →
Answer ⊣ nothing happens` against the full loop ending in an action a person releases. No jargon,
and it says what the work is for. The stage bar leads the Reliability section instead, where the
reader has been told what they are looking at, and it is the one trace on the page that plays and
scrubs — it starts when it scrolls into view, not on mount, so it no longer plays to an empty room.

Both diagrams on this site are built from **reflowing boxes, not SVG**, for the same reason: a fixed
720-unit drawing in a horizontal scroller shows a phone reader the left third and hides the payoff
behind a sideways drag. Chips wrap in reading order at every width.

---

## Commands

```bash
npm run dev
```

| Command | What it does |
|---|---|
| `npm run build` | Production build — all routes prerender |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run capture` | Re-record traces from a running agent project |
| `npm run sync:evals` | Pull the eval report in from `../portfolio` |

## Deploying

Live at **https://tharunaretyportfolio.vercel.app** — note that the production hostname is not the
Vercel project name, which is `landing-page-portfolio`.

`main` is connected to the Vercel project, so **pushing to `main` deploys to production**. Other
branches get preview deployments.

To deploy by hand, the team scope is required — without it the CLI fails with `Not authorized`
even when `vercel whoami` succeeds, because the project lives under the `tharun-arety1` team:

```bash
npx vercel --prod --scope tharun-arety1
```

Set `NEXT_PUBLIC_SITE_URL` to the custom domain once there is one, so share cards stop advertising
a `*.vercel.app` address. Without it, Vercel's own hostname is used.

There is no `resume.pdf` in `public/`. The résumé page carries a print stylesheet and the browser
makes the PDF, so there is only ever one version of the facts.
