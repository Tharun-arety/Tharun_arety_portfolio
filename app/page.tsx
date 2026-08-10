import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { Section } from "@/components/site/Section";
import { StackChip } from "@/components/site/StackIcon";
import { SystemSheet } from "@/components/site/SystemSheet";
import { ThesisDiagram } from "@/components/site/ThesisDiagram";
import { EvalMatrix } from "@/components/trace/EvalMatrix";
import { StageBar } from "@/components/trace/StageBar";
import { TraceCard } from "@/components/trace/TraceCard";
import { TraceReplay } from "@/components/trace/TraceReplay";
import { systems } from "@/content/systems";
import { engineeringRepos, profile, skills } from "@/content/profile";
import { formatMs, formatUsd, traceById, traceOf, traces } from "@/lib/traces";

export default function Page() {
  // The hero shows a turn where a gate actually did something. A clean run
  // proves the pipeline exists; this one proves it has teeth.
  const heroTurn = traceById("tool-arg-rejected");
  const heroTrace = heroTurn ? traceOf(heroTurn) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-24 px-5 pt-12 pb-8 sm:px-8 sm:pt-20">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <header>
        {/* Whose portfolio this is comes first and comes big. The claim is the
            reason to keep reading; the name is the reason to remember it. */}
        <h1 className="text-ink text-5xl leading-[0.95] sm:text-7xl">{profile.name}</h1>

        {/* Separators live inside their span rather than between siblings, so a
            wrap never strands a middot at the end of a line. */}
        <div className="border-rule mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t pt-4">
          <span className="letter text-ink">{profile.role}</span>
          <span className="text-ink-faint text-xs">
            {profile.location} · {profile.relocation}
          </span>
        </div>

        <p className="text-ink mt-8 max-w-3xl text-2xl leading-tight font-semibold sm:text-4xl">
          I build AI-leveraged systems.
        </p>

        <p className="prose-doc mt-4 max-w-2xl text-lg">{profile.thesis}</p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* A native anchor, not a router Link. Next's client navigation
              treats a same-page hash as a route change with no work to do and
              never performs the scroll, so the button silently did nothing. */}
          <a
            href="#systems"
            className="border-ink bg-ink text-ground hover:bg-ink-mid hover:border-ink-mid inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors"
          >
            Explore the systems
            <ArrowRight className="size-3.5" />
          </a>
          <Link
            href="/resume"
            className="border-rule-strong text-ink hover:border-ink inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors"
          >
            Résumé
          </Link>
          <a
            href={`mailto:${profile.contact.email}`}
            className="text-ink-mid hover:text-ink text-sm transition-colors"
          >
            {profile.contact.email}
          </a>
        </div>

        {/* The signature. A real turn, at true scale, with a gate visibly
            refusing something. */}
        {heroTurn && heroTrace && (
          <div className="sheet mt-14">
            <div className="border-rule flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b px-5 py-3">
              <span className="letter">Recorded turn</span>
              <span className="text-ink-mid font-mono text-xs">{heroTurn.prompt}</span>
            </div>
            <div className="px-5 py-5">
              <TraceReplay durationMs={heroTrace.totals.durationMs} autoPlay>
                <StageBar trace={heroTrace} />
              </TraceReplay>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="callout">{formatMs(heroTrace.totals.durationMs)}</span>
                <span className="callout">{heroTrace.totals.modelCalls} model calls</span>
                <span className="callout">{formatUsd(heroTrace.totals.costUsd)}</span>
                <span className="callout callout-gate">1 tool call rejected</span>
              </div>
              <p className="text-ink-mid mt-4 max-w-2xl text-sm leading-relaxed">{heroTurn.claim}</p>
            </div>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Thesis                                                            */}
      {/* ---------------------------------------------------------------- */}
      <Section
        id="thesis"
        label="Thesis"
        title="From information to action"
        lede={
          <p>
            Most enterprise AI work stops at an answer. An answer is where the useful part starts:
            the systems worth building carry a decision into the tools the business already runs on,
            do something, and feed the result back.
          </p>
        }
      >
        <ThesisDiagram />

        <blockquote className="border-verdigris mt-10 border-l-2 pl-5">
          <p className="text-ink max-w-xl text-xl leading-snug">{profile.principle}</p>
          <p className="prose-doc mt-3 max-w-xl text-base">
            The clearest version of this: a compliance pipeline that wrote its results back into the
            spreadsheet the team already lived in, rather than asking anyone to adopt a new tool.
            Nobody had to be persuaded, so it got used.
          </p>
        </blockquote>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Systems                                                           */}
      {/* ---------------------------------------------------------------- */}
      <Section
        id="systems"
        label="Systems"
        title="Five systems, ordered by how much you can verify"
        lede={
          <p>
            The first two shipped to businesses and are described without their clients. The next two
            can be opened and read. The last one you can log into. Each card says which before it
            says anything else.
          </p>
        }
      >
        <div className="space-y-5">
          {systems.map((system) => (
            <SystemSheet key={system.slug} system={system} />
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Reliability                                                       */}
      {/* ---------------------------------------------------------------- */}
      <Section
        id="reliability"
        label="Reliability"
        title="How I know the systems behave"
        lede={
          <p>
            Anyone can demonstrate an agent answering a question it was built to answer. The
            interesting cases are the hostile input, the tool call for a thing that does not exist,
            and the question the corpus cannot support. Below is a real eval suite over the
            magnetocaloric agent, and six turns recorded from it — including the ones that failed on
            purpose.
          </p>
        }
      >
        <EvalMatrix />

        <div className="mt-12">
          <div className="legend mb-6">
            <span className="letter">Recorded turns</span>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {traces.map((turn) => (
              <TraceCard key={turn.id} turn={turn} />
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Background                                                        */}
      {/* ---------------------------------------------------------------- */}
      <Section
        id="background"
        label="Background"
        title="A materials engineer who learned to build the tools"
        lede={
          <p>
            I came to this from composites research, not from a platform team. That is the reason
            these systems land in engineering organizations: BOMs, revision states, calibration
            schedules and test-bench data are not domain research for me, and the people who use
            these tools are the people I trained as.
          </p>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="sheet p-5">
            <div className="letter mb-4">Computational engineering</div>
            <p className="prose-doc mb-5 text-base">
              Differentiable simulation and optimization, in the open. These are the work that makes
              the domain claim checkable rather than asserted.
            </p>
            <ul className="space-y-3">
              {engineeringRepos.map((repo) => (
                <li key={repo.name}>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink hover:text-verdigris inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                  >
                    {repo.name}
                    <ExternalLink className="size-3" />
                  </a>
                  <p className="text-ink-faint mt-0.5 text-xs leading-relaxed">{repo.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="sheet p-5">
            <div className="letter mb-4">What I work with</div>
            <dl className="space-y-4">
              {skills.map((group) => (
                <div key={group.label}>
                  <dt className="text-ink mb-2 text-sm font-medium">{group.label}</dt>
                  <dd>
                    {group.chips ? (
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <StackChip key={item} name={item} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-ink-faint text-xs leading-relaxed">
                        {group.items.join(" · ")}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Contact                                                           */}
      {/* ---------------------------------------------------------------- */}
      <Section
        id="contact"
        label="Contact"
        title="Building this kind of backbone somewhere?"
        lede={
          <p>
            I am looking for the role where one person, working agentically, owns the systems a
            company runs on. If that is the job, I would like to hear about it.
          </p>
        }
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={`mailto:${profile.contact.email}`}
            className="border-ink bg-ink text-ground hover:bg-ink-mid hover:border-ink-mid inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors"
          >
            {profile.contact.email}
          </a>
          <a
            href={profile.contact.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-ink-mid hover:text-ink inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            LinkedIn <ExternalLink className="size-3" />
          </a>
          <a
            href={profile.contact.github}
            target="_blank"
            rel="noreferrer"
            className="text-ink-mid hover:text-ink inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            GitHub <ExternalLink className="size-3" />
          </a>
        </div>
      </Section>
    </div>
  );
}
