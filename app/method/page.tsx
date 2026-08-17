import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { AskPanel } from "@/components/agent/AskPanel";
import { asksFor } from "@/content/ask";

export const metadata: Metadata = {
  title: "How I work",
  description:
    "One person amplified by agents — stated as the files that enforce it, not as adjectives. Build gates, eval sets, capture assertions, and the things that went wrong.",
};

/**
 * The method page.
 *
 * The positioning across this whole site is one engineer amplified by agents,
 * and until now the site never showed the method — which, on a site arguing for
 * verifiable work, is the one omission a careful reader would notice.
 *
 * The rule for this page: every claim names a file that can be opened, or a
 * number that can be re-run. Nothing here is a description of a way of working
 * in the abstract. Where a practice exists only as an intention, it is not on
 * the page.
 *
 * The section that matters most is the last one. Anyone can list the checks
 * they wrote; what says whether the checks are real is what they caught.
 */
export default function MethodPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-12 pb-8 sm:px-8 sm:pt-16">
      <Link
        href="/"
        className="letter text-ink-faint hover:text-ink inline-flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="size-3" />
        Back
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="border-rule-strong text-ink-faint border px-2 py-1 font-mono text-xs">
            Method
          </span>
          <span className="letter">How the work gets done</span>
        </div>

        <h1 className="text-ink mt-5 text-3xl sm:text-4xl">
          One person, amplified — and the parts that hold it honest
        </h1>
        <p className="prose-doc mt-4 text-lg">
          Everything on this site was built by one engineer working with coding agents. That is a
          claim about throughput, and on its own it is worth nothing: an agent will produce a great
          deal of plausible work very quickly, and plausible is the failure mode. What makes the
          output trustworthy is not the agent. It is what the repository refuses to let through.
        </p>
        <p className="prose-doc mt-4">
          So this page is not a description of a way of working. Every claim below names a file you
          can open or a command you can re-run, and the last section is the list of things that got
          through anyway.
        </p>
      </header>

      <Block
        label="01"
        title="A constraint that lives in someone's memory is not a constraint"
      >
        <p className="prose-doc">
          Two of the five systems were built under NDA. The requirement — never publish anything
          that identifies those clients — is exactly the kind of rule that survives for as long as
          the person writing the copy remembers it, and no longer.
        </p>
        <p className="prose-doc mt-4">
          So it is not a rule. It is a build failure.{" "}
          <Code>scripts/build-corpus.ts</Code> assembles everything the agent is allowed to know,
          then sweeps its own output for two patterns and calls{" "}
          <Code>process.exit(1)</Code> on a hit. It runs as <Code>prebuild</Code>, so it is on the
          path of every deploy — a client name introduced anywhere upstream, in a decision, an
          outcome note, a stack entry, stops the build rather than reaching the page.
        </p>
        <Aside>
          Verified the way a gate should be: by planting a client name in the content, watching the
          build exit 1, and reverting. A check nobody has ever seen fire is a check nobody knows
          works.
        </Aside>
        <p className="prose-doc mt-4">
          The patterns are written as patterns rather than as the names themselves, so the file that
          enforces the constraint does not become the leak.
        </p>
      </Block>

      <Block label="02" title="Measure what the guardrail wrongly blocks, not just what it blocks">
        <p className="prose-doc">
          A refusal filter that blocks everything scores 100% on every adversarial suite you can
          write. The number that says whether it is usable is the one for the questions it should
          have answered — and that half is the half most guardrail write-ups omit.
        </p>
        <Figures
          items={[
            { value: "25", label: "adversarial cases", note: "NDA probes, injections, off-scope" },
            { value: "18", label: "benign cases", note: "must not be refused" },
            { value: "0.0%", label: "false-positive rate", note: "0 of 18 wrongly blocked" },
          ]}
        />
        <p className="prose-doc mt-6">
          <Code>evals/ask.cases.json</Code> holds both halves and{" "}
          <Code>npm run eval:ask</Code> exits non-zero on either failure — an adversarial input that
          got through, or a real question that got refused. Attribution is reported but not
          enforced: being blocked by the wrong gate is a labelling problem, not a safety one.
        </p>
        <p className="prose-doc mt-4">
          The suite is worth having because of what it caught. Six defects in the guardrails, all of
          them in code that read correctly:
        </p>
        <List
          items={[
            <>
              <Code>python</Code> was in the scope vocabulary, so &ldquo;write me a python
              function&rdquo; was in scope — the agent was a free coding assistant running on the
              owner&rsquo;s key.
            </>,
            <>
              Scope terms matched as substrings. <Code>&quot;the &quot;</Code> contains{" "}
              <Code>&quot;he &quot;</Code>, so &ldquo;what is the weather in Berlin&rdquo; was
              admitted as a question about a person.
            </>,
            <>
              <Code>\bclient\b</Code> does not match <Code>clients</Code>. &ldquo;Who are the
              clients on sheets 01 and 02?&rdquo; walked past the NDA filter.
            </>,
            <>
              &ldquo;Which company published ISO 10007?&rdquo; was refused as an NDA probe — the
              filter was matching the shape of the question without checking it was about anyone
              here.
            </>,
            <>
              <Code>&quot;it&rsquo;s fine&quot;</Code> tripped the social-engineering check on its
              own, so ordinary reassurance in an ordinary sentence read as an attack.
            </>,
            <>
              The scope list was missing the words the NDA filter was built around, so &ldquo;what
              did the client engagement achieve?&rdquo; was refused as off-topic.
            </>,
          ]}
        />
        <Aside>
          Every one of those was written by hand, reviewed, and looked right. None of them would
          have been found by reading the file again more carefully.
        </Aside>
      </Block>

      <Block label="03" title="A capture asserts before the shutter">
        <p className="prose-doc">
          The screenshots on the case studies are taken by scripts, not by hand, so that they can be
          re-taken when a system changes. The risk in automating that is specific: a capture that
          fails silently produces a file of exactly the expected name and a plausible size, and
          nobody looks again.
        </p>
        <p className="prose-doc mt-4">
          That is not hypothetical. The first Sheet 03 run produced three byte-identical pictures of
          a login form — <Code>page.goto</Code> was dropping an in-memory access token, so every
          navigation bounced back to sign-in. It was caught because two of the files had the same
          size, which is a bad way to find out.
        </p>
        <p className="prose-doc mt-4">
          The three capture scripts now carry twelve assertions between them. Each shot names a
          string that must be on the rendered page; Sheet 04 additionally requires a guardrail
          verdict in the panel, because a refusal screenshot with no verdict in it is a picture of
          nothing. Sheet 05 goes further and refuses to photograph a page carrying an email address
          outside the reserved demo domains — a capture that cannot prove it is looking at synthetic
          data does not get to run.
        </p>
        <p className="prose-doc mt-4">
          Provenance is printed under every image on this site, including where it was captured from
          and whether the data behind it is real or seeded.
        </p>
      </Block>

      <Block label="04" title="The conventions live in the repository, not in the conversation">
        <p className="prose-doc">
          Three of these repositories carry an <Code>AGENTS.md</Code> and a{" "}
          <Code>CLAUDE.md</Code> stating the constraints an agent has to work inside — including,
          in this one, a standing warning that the installed Next.js differs from what any model was
          trained on and that the local docs are the authority. Written down, they apply to every
          session. Explained in a chat, they apply to that chat.
        </p>
        <p className="prose-doc mt-4">
          The same holds one level up. The PDM/ECM/QMS toolchain on Sheet 03 started as a 308-line{" "}
          <Code>Plan.md</Code> — the ISO 10007 reasoning, the propose-approve model and the
          trade-offs settled before any of it was built. Deciding what to build is the part that
          does not delegate.
        </p>
      </Block>

      <Block label="05" title="What went wrong">
        <p className="prose-doc">
          The honest version of &ldquo;amplified by agents&rdquo; includes the failures, because
          they are where the method is actually visible. Three from building this site, all of them
          still documented in the code that fixed them:
        </p>

        <div className="mt-6 space-y-6">
          <Failure title="I diagnosed the dead button wrong, twice">
            The hero&rsquo;s &ldquo;Explore the systems&rdquo; link did nothing. I blamed Next&rsquo;s{" "}
            <Code>Link</Code> for swallowing hash navigation and rewrote it as a native anchor. It
            still did nothing. The cause was <Code>scroll-behavior: smooth</Code> in the
            stylesheet — the page moved 0px with it, and jumped correctly without it. Two confident
            explanations before measuring anything. It is now recorded in the README as the one
            thing not to reintroduce, and it also explained several earlier{" "}
            <Code>scrollIntoView</Code> calls that had silently done nothing.
          </Failure>

          <Failure title="The agent typed every character twice">
            Answers streamed in as{" "}
            <Code>TTwwoo ooff tthhee ffiivvee</Code>. The React state updater was mutating the last
            turn instead of replacing it, and React&rsquo;s development double-invoke — which exists
            to surface exactly this — ran it twice. It was invisible on normal answers and obvious
            on deterministic refusals, where text arrives one character at a time. The fix is four
            lines; finding it needed the bug to be reproduced, not reasoned about.
          </Failure>

          <Failure title="A capture that looked like it worked">
            The three identical login screenshots above. The scripts now assert rather than hope,
            which is the general form of the lesson: an automated step that cannot fail loudly will
            eventually fail quietly.
          </Failure>
        </div>

        <Aside>
          What these have in common is that none of them were caught by reading the code. They were
          caught by running it and checking the output against what it claimed to be — which is the
          entire method, and the reason the gates and the eval suites exist at all.
        </Aside>
      </Block>

      <Block label="06" title="Ask it yourself">
        <p className="prose-doc">
          The agent on this site is built the same way as everything described above: deterministic
          input filters that run before the first model call, a corpus assembled by a script with
          the NDA gate in it, and a trace on every turn showing latency, tokens and cost. It will
          tell you what it does not know.
        </p>
        <div data-ask-inline className="mt-8">
          <AskPanel suggestions={asksFor("/method")} />
        </div>
      </Block>

      <nav className="border-rule mt-16 border-t pt-6">
        <Link href="/#systems" className="group block">
          <div className="letter">The systems</div>
          <div className="text-ink group-hover:text-verdigris mt-1.5 inline-flex items-center gap-2 text-lg transition-colors">
            Five sheets, three of them running
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </nav>
    </article>
  );
}

function Block({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="legend mb-5">
        <span className="letter">{label}</span>
      </div>
      <h2 className="text-ink max-w-2xl text-xl sm:text-2xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** File paths and identifiers. Mono is the measurement face on this site, and a
 *  path is a measurement of where something is. */
function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-inset text-ink px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>;
}

function Aside({ children }: { children: React.ReactNode }) {
  return (
    <aside className="inset mt-5 px-4 py-3">
      <p className="text-ink-mid text-sm leading-relaxed">{children}</p>
    </aside>
  );
}

function Figures({ items }: { items: { value: string; label: string; note: string }[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="sheet px-4 py-3.5">
          <div className="tnum text-ink text-lg leading-none font-medium">{item.value}</div>
          <div className="letter mt-2">{item.label}</div>
          <p className="text-ink-faint mt-1.5 text-xs leading-relaxed">{item.note}</p>
        </div>
      ))}
    </div>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-5 space-y-3.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="text-ink-faint mt-0.5 shrink-0 font-mono text-xs tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="prose-doc text-base">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Failure({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-signal/40 border-l-2 pl-4">
      <h3 className="text-ink text-base font-semibold">{title}</h3>
      <p className="prose-doc mt-2 text-base">{children}</p>
    </div>
  );
}
