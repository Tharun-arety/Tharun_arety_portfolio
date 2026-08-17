import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Lock } from "lucide-react";

import { ArchitectureStack } from "@/components/site/ArchitectureStack";
import { Shot } from "@/components/site/Shot";
import { StackChip } from "@/components/site/StackIcon";
import { EVIDENCE_LABEL, systemBySlug, systems } from "@/content/systems";

export function generateStaticParams() {
  return systems.map((system) => ({ slug: system.slug }));
}

export async function generateMetadata(props: PageProps<"/systems/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const system = systemBySlug(slug);
  if (!system) return {};
  return { title: system.name, description: system.tagline };
}

/**
 * One template for all five sheets.
 *
 * Same sections in the same order every time, because the reason to write these
 * as a set rather than as five pages is that they can be held against each
 * other. The section that carries the weight is "Decisions" — anyone can list
 * what they built, and the trade-offs are where the judgement shows.
 */
export default async function SystemPage(props: PageProps<"/systems/[slug]">) {
  const { slug } = await props.params;
  const system = systemBySlug(slug);
  if (!system) notFound();

  const index = systems.findIndex((s) => s.slug === slug);
  const next = systems[(index + 1) % systems.length];

  return (
    <article className="mx-auto max-w-3xl px-5 pt-12 pb-8 sm:px-8 sm:pt-16">
      <Link
        href="/#systems"
        className="letter text-ink-faint hover:text-ink inline-flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="size-3" />
        All systems
      </Link>

      {/* Sheet head: number, evidence, title. */}
      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="border-rule-strong text-ink-faint border px-2 py-1 font-mono text-xs">
            Sheet {system.sheet}
          </span>
          <span className="letter">{system.context}</span>
          <span
            className={`letter ml-auto border px-2 py-1 ${
              system.evidence === "live"
                ? "border-verdigris text-verdigris bg-verdigris-soft"
                : "border-rule-strong text-ink-faint"
            }`}
          >
            {EVIDENCE_LABEL[system.evidence]}
          </span>
        </div>

        <h1 className="text-ink mt-5 text-3xl sm:text-4xl">{system.name}</h1>
        <p className="prose-doc mt-4 text-lg">{system.tagline}</p>

        {system.links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {system.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={
                  link.kind === "live"
                    ? "border-verdigris bg-verdigris-soft text-verdigris hover:bg-verdigris hover:text-sheet inline-flex items-center gap-2 border px-3 py-2 text-sm font-semibold shadow-sm transition-colors"
                    : "text-ink hover:text-verdigris inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                }
              >
                {link.kind === "live" && (
                  <span className="size-1.5 bg-current" aria-hidden="true" />
                )}
                {link.label}
                <ExternalLink className={link.kind === "live" ? "size-3.5" : "size-3"} />
              </a>
            ))}
          </div>
        )}
      </header>

      {/* The NDA note is stated up front rather than buried, because it changes
          how everything below should be read. */}
      {system.nda && (
        <aside className="inset mt-8 flex gap-3 px-4 py-3">
          <Lock className="text-ink-faint mt-0.5 size-3.5 shrink-0" />
          <p className="text-ink-mid text-sm leading-relaxed">{system.nda}</p>
        </aside>
      )}

      {system.headline && (
        <div className="sheet mt-8 px-5 py-4">
          {/* Mono is for measurements. A headline that is a sentence rather than
              a figure gets the display face, or it reads like console output. */}
          <div
            className={`text-ink text-2xl leading-tight font-medium ${
              /\d/.test(system.headline.value) ? "tnum" : ""
            }`}
          >
            {system.headline.value}
          </div>
          <div className="letter mt-2">{system.headline.label}</div>
          {system.headline.note && (
            <p className="text-ink-faint mt-2 text-xs">{system.headline.note}</p>
          )}
        </div>
      )}

      <Block label="The problem">
        <p className="prose-doc">{system.problem}</p>
      </Block>

      <Block label="What I built">
        <p className="prose-doc">{system.built}</p>
      </Block>

      <Block label="Architecture">
        <ArchitectureStack tiers={system.architecture.tiers} caption={system.architecture.caption} />
      </Block>

      {system.evidenceShots && system.evidenceShots.length > 0 && (
        <Block label="Running">
          <div className="space-y-6">
            {system.evidenceShots.map((shot, index) => (
              <Shot
                key={shot.src}
                src={shot.src}
                alt={shot.alt}
                caption={shot.caption}
                provenance={shot.provenance}
                width={shot.width}
                height={shot.height}
                // Only the first is above the fold on a phone; the rest can wait.
                priority={index === 0}
              />
            ))}
          </div>
        </Block>
      )}

      <Block label="Decisions and trade-offs">
        <div className="space-y-7">
          {system.decisions.map((decision) => (
            <div key={decision.title}>
              <h3 className="text-ink text-base font-semibold">{decision.title}</h3>
              <p className="prose-doc mt-2 text-base">{decision.body}</p>
            </div>
          ))}
        </div>
      </Block>

      {system.outcomes.length > 0 && (
        <Block label="Outcome">
          <div className="grid gap-4 sm:grid-cols-2">
            {system.outcomes.map((outcome) => (
              <div key={outcome.label} className="sheet px-4 py-3.5">
                <div className="tnum text-ink text-lg leading-none font-medium">
                  {outcome.value}
                </div>
                <div className="letter mt-2">{outcome.label}</div>
                {outcome.note && (
                  <p className="text-ink-faint mt-1.5 text-xs leading-relaxed">{outcome.note}</p>
                )}
              </div>
            ))}
          </div>
        </Block>
      )}

      <Block label="Stack">
        <div className="flex flex-wrap gap-2">
          {system.stack.map((item) => (
            <StackChip key={item} name={item} />
          ))}
        </div>
      </Block>

      <nav className="border-rule mt-16 border-t pt-6">
        <Link href={`/systems/${next.slug}`} className="group block">
          <div className="letter">Next sheet — {next.sheet}</div>
          <div className="text-ink group-hover:text-verdigris mt-1.5 inline-flex items-center gap-2 text-lg transition-colors">
            {next.name}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </nav>
    </article>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="legend mb-5">
        <span className="letter">{label}</span>
      </div>
      {children}
    </section>
  );
}
