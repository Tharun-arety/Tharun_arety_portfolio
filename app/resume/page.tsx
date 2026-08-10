import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "@/components/site/PrintButton";
import {
  achievements,
  certifications,
  education,
  experience,
  languages,
  profile,
  skills,
} from "@/content/profile";
import { systems } from "@/content/systems";

export const metadata: Metadata = {
  title: "Résumé",
  description: `${profile.name} — ${profile.role}. ${profile.thesis}`,
};

/**
 * The résumé, as a page rather than as an attachment.
 *
 * Deliberately the thirty-second read: the site carries the argument and this
 * carries the facts. The two client systems appear by what they are, never by
 * whose they were.
 *
 * The phone number is not here. It belongs in the copy sent to a named
 * recipient, not on a URL anyone can scrape.
 */
export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-8 sm:px-8 sm:pt-16 print:max-w-none print:px-0 print:pt-0">
      <div className="mb-8 flex flex-wrap items-center gap-4 print:hidden">
        <Link href="/" className="letter text-ink-faint hover:text-ink transition-colors">
          ← Back to the systems
        </Link>
        <div className="ml-auto">
          <PrintButton />
        </div>
      </div>

      {/* Head ---------------------------------------------------------- */}
      <header className="border-rule border-b pb-6">
        <h1 className="text-ink text-3xl sm:text-4xl">{profile.name}</h1>
        <p className="letter mt-2 text-[11px]">{profile.role}</p>
        <p className="text-ink-mid mt-4 text-sm">
          {profile.location} · {profile.relocation}
        </p>
        <p className="text-ink-mid mt-1 text-sm">
          <a href={`mailto:${profile.contact.email}`} className="hover:text-verdigris">
            {profile.contact.email}
          </a>
          {" · "}
          <a href={profile.contact.github} className="hover:text-verdigris">
            github.com/{profile.contact.githubHandle}
          </a>
          {" · "}
          <a href={profile.contact.linkedin} className="hover:text-verdigris">
            linkedin.com/in/{profile.contact.linkedinHandle}
          </a>
        </p>
      </header>

      <Part label="Profile">
        <p className="prose-doc text-base">
          AI systems builder with an engineering background, building agentic enterprise systems,
          RAG pipelines, MCP integrations, document intelligence and full-stack applications.
          Currently building AI-enabled ERP, CRM, PDM and compliance workflows at Vexos, turning
          fragmented business data and organizational knowledge into automated, agent-accessible
          systems. Materials engineer by training, which is why these tools land with the engineers
          who have to use them.
        </p>
      </Part>

      <Part label="Experience">
        <div className="space-y-6">
          {experience.map((role) => (
            <div key={`${role.org}-${role.title}`} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="text-ink text-base font-semibold">{role.title}</h3>
                <span className="tnum text-ink-faint ml-auto text-xs">{role.period}</span>
              </div>
              <div className="text-ink-mid mt-0.5 text-sm">{role.org}</div>
              <ul className="mt-2 space-y-1">
                {role.points.map((point) => (
                  <li key={point} className="text-ink-mid flex gap-2.5 text-sm leading-relaxed">
                    <span className="text-ink-faint select-none">—</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Part>

      <Part label="Selected systems">
        <div className="space-y-3">
          {systems.map((system) => (
            <div key={system.slug} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="text-ink text-sm font-semibold">{system.name}</h3>
                <span className="text-ink-faint text-xs">{system.stack.slice(0, 4).join(" · ")}</span>
              </div>
              <p className="text-ink-mid mt-0.5 text-sm leading-relaxed">{system.tagline}</p>
              {system.headline && (
                <p className="text-ink mt-0.5 text-sm">
                  <span className="tnum font-medium">{system.headline.value}</span>
                  <span className="text-ink-faint"> — {system.headline.label.toLowerCase()}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </Part>

      <Part label="Technical skills">
        <dl className="space-y-2">
          {skills.map((group) => (
            <div key={group.label} className="flex flex-wrap gap-x-3 text-sm">
              <dt className="text-ink w-40 shrink-0 font-medium">{group.label}</dt>
              <dd className="text-ink-mid min-w-0 flex-1 leading-relaxed">
                {group.items.join(" · ")}
              </dd>
            </div>
          ))}
        </dl>
      </Part>

      <Part label="Education">
        <div className="space-y-3">
          {education.map((entry) => (
            <div key={entry.degree}>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="text-ink text-sm font-semibold">{entry.degree}</h3>
                <span className="tnum text-ink-faint ml-auto text-xs">{entry.period}</span>
              </div>
              <div className="text-ink-mid text-sm">{entry.org}</div>
              {entry.note && <div className="text-ink-faint mt-0.5 text-xs">{entry.note}</div>}
            </div>
          ))}
        </div>
      </Part>

      <Part label="Achievements & certifications">
        <ul className="space-y-1.5">
          {achievements.map((item) => (
            <li key={item.title} className="text-sm">
              <span className="text-ink font-medium">{item.title}</span>
              <span className="text-ink-mid"> — {item.note}</span>
            </li>
          ))}
        </ul>
        <p className="text-ink-mid mt-3 text-sm">{certifications.join(" · ")}</p>
        <p className="text-ink-mid mt-3 text-sm">
          <span className="text-ink font-medium">Languages</span> —{" "}
          {languages.map((l) => `${l.name} ${l.level}`).join(" · ")}
        </p>
      </Part>
    </div>
  );
}

function Part({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 break-inside-avoid">
      <div className="legend mb-4">
        <span className="letter">{label}</span>
      </div>
      {children}
    </section>
  );
}
