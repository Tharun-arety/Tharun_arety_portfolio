import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { AskPanel } from "@/components/agent/AskPanel";
import { Section } from "@/components/site/Section";
import { StackChip } from "@/components/site/StackIcon";
import { SystemSheet } from "@/components/site/SystemSheet";
import { ThesisDiagram } from "@/components/site/ThesisDiagram";
import { EvalMatrix } from "@/components/trace/EvalMatrix";
import { TraceCard } from "@/components/trace/TraceCard";
import { systems } from "@/content/systems";
import { engineeringRepos, profile, skills } from "@/content/profile";
import { traceById, traces } from "@/lib/traces";

export default function Page() {
  // The turn where a gate actually did something. A clean run proves the
  // pipeline exists; this one proves it has teeth — so it leads the recorded
  // turns rather than sitting anonymously in the grid, and it is the one that
  // can be played and scrubbed.
  const featured = traceById("tool-arg-rejected");
  const rest = traces.filter((turn) => turn.id !== featured?.id);

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

        {/* The opening visual explains the work rather than demonstrating it.
            A recorded agent trace was here, and it was the strongest technical
            proof on the site sitting in the one place where the reader has not
            yet been given a reason to care what a tool loop is. It now leads
            the Reliability section instead, where that reason has been given. */}
        <div className="border-rule mt-10 border-t pt-8 sm:mt-14 sm:pt-10">
          <p className="prose-doc mb-7 max-w-2xl">
            Most enterprise AI work stops at an answer. An answer is where the useful part starts —
            the systems worth building carry a decision into the tools a business already runs on,
            do something, and feed the result back.
          </p>
          <ThesisDiagram />
        </div>

      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Principle                                                         */}
      {/* ---------------------------------------------------------------- */}
      <Section
        id="thesis"
        label="Principle"
        title={profile.principle}
        lede={
          <p>
            The clearest version of this: a compliance pipeline that wrote its results back into the
            spreadsheet the team already lived in, rather than asking anyone to adopt a new tool.
            Nobody had to be persuaded, so it got used.
          </p>
        }
      />

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
      {/* Ask                                                               */}
      {/* ---------------------------------------------------------------- */}
      <Section
        id="ask"
        label="Ask"
        title="Ask about any of it"
        lede={
          <p>
            A live agent over this site&rsquo;s own content. It answers from what is published here
            and refuses what is not — including anything that would identify the two clients under
            NDA. It shows its own latency, tokens and cost on every turn, the same way the recorded
            turns below do.
          </p>
        }
      >
        <AskPanel />
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

          {/* One turn gets the full width and the playback controls, because a
              reader who scrubs one understands the other five by reading. */}
          {featured && (
            <div className="mb-5">
              <TraceCard turn={featured} featured />
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {rest.map((turn) => (
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
