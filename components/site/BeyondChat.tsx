/**
 * The correction, placed before the console rather than after it.
 *
 * Everything downstream of here — the live console, the profile agent in the
 * corner — is a text box you type into, so by the time a reader reaches them
 * the word "agent" has quietly collapsed into "chatbot". This section spends
 * itself stopping that, and it has to do it before the collapse happens rather
 * than arguing with it afterwards.
 *
 * Two halves, because the claim has two parts. The ledger is the argument: six
 * dimensions on which a chat box and a deployed system differ, with the
 * chatbot column set dim and the system column set in ink, so the comparison
 * is legible before a word of it is read. The surfaces underneath are the
 * evidence: four ways into this work, only one of which is a conversation, and
 * each one traceable to a system in the section below.
 *
 * Every figure here is already on the page somewhere else — the eval counts
 * from `system-entries.ts`, the refusal cost from the guardrail row, the
 * eleven domains from the first case study. Nothing was invented to make the
 * right-hand column longer.
 */

import Link from "next/link";
import { ArrowRight, CalendarClock, MessageSquare, Stamp, Webhook } from "lucide-react";

export type Row = {
  /** The axis of comparison, set as a field label. */
  dimension: string;
  chatbot: string;
  system: string;
};

export const ROWS: Row[] = [
  {
    dimension: "what starts it",
    chatbot: "A person types a question and waits.",
    system:
      "A certificate lands in an inbox. A date crosses a thirty-day horizon. A record changes upstream. Most runs begin with nobody present.",
  },
  {
    dimension: "what comes out",
    chatbot: "Text, and then the conversation is over.",
    system:
      "A proposed change to a system of record, carrying the field-level diff it would apply, held until someone approves it.",
  },
  {
    dimension: "what it can reach",
    chatbot: "Whatever was pasted into its context window.",
    system:
      "Eleven record domains — PDM, ECM, QMS, procurement, controlling and six more — behind one tool interface. Read freely, written only on approval.",
  },
  {
    dimension: "when it does not know",
    chatbot: "Answers anyway, in the same confident register it uses when it does.",
    system:
      "Refuses before the model is called. Nothing clears the similarity floor, so the turn costs 0 ms and 0 tokens.",
  },
  {
    dimension: "who is accountable",
    chatbot: "Nobody. A transcript is the only thing left behind.",
    system:
      "The named approver in the transaction that wrote, with the tool call that proposed it recorded beside their name.",
  },
  {
    dimension: "how you know it works",
    chatbot: "You try a few questions and form an impression.",
    system:
      "144 fixed cases across 12 metrics. The first run scored 85.6%, which is the only reason the current 95.9% means anything.",
  },
];

export type Surface = {
  icon: typeof MessageSquare;
  title: string;
  body: string;
  /** Where this surface actually exists, so the claim can be checked. */
  source: string;
  href?: string;
};

export const SURFACES: Surface[] = [
  {
    icon: MessageSquare,
    title: "A chat box",
    body: "The console in the next section, and the profile agent in the corner of this one. It earns its place on questions nobody anticipated. It is also the surface that demonstrates best and carries the least of the work.",
    source: "On this page",
  },
  {
    icon: Stamp,
    title: "An approval inbox",
    body: "Agent-proposed changes wait with a dry-run diff of every field they would touch, until someone holding the required role approves them, in one transaction, under their own name. Approving is the only thing that writes.",
    source: "System 01",
    href: "/projects/agentic-pdm-ecm-qms",
  },
  {
    icon: CalendarClock,
    title: "A schedule",
    body: "Expiry monitoring runs against stored dates rather than documents, which is what makes it cheap enough to run continuously. A date crossing the horizon starts the supplier chase, instead of someone remembering to.",
    source: "System 03",
    href: "/projects/autonomous-compliance",
  },
  {
    icon: Webhook,
    title: "A tool surface",
    body: "MCP servers and tool calling, so other software can call the agent and the agent can call the systems that hold the answer. This is the step where a question stops being research and becomes a change.",
    source: "Across the work",
  },
];

export function BeyondChat() {
  return (
    <section id="beyond-chat">
      <div className="shell py-16 lg:py-24">
        <span className="eyebrow">Not a chatbot</span>
        <h2 className="display-sm text-ink mt-5 max-w-[24ch]">
          Most of this work happens with nobody typing
        </h2>
        <p className="lede mt-4 max-w-[54ch]">
          Every system here can be talked to, and one of them is a text box further down this page.
          That is the part which demonstrates well and the smallest part of what is running. What
          decides whether an agent is worth deploying is what starts it, what it is allowed to
          touch, and what it does when it is wrong.
        </p>

        {/* The ledger. Column headings only exist from `md` up; below that each
            row stacks and labels its own two halves, because a three-column
            table on a phone is a table nobody reads. */}
        <div className="frame mt-12">
          <div className="border-rule bg-panel hidden border-b md:grid md:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1.35fr)]">
            <span className="micro px-5 py-3" />
            <span className="micro px-0 py-3 pr-8">a chatbot</span>
            <span className="micro text-cold border-rule border-l py-3 pr-5 pl-8">these systems</span>
          </div>

          <ul className="divide-rule divide-y">
            {ROWS.map((row) => (
              <li
                key={row.dimension}
                className="grid gap-y-3 px-5 py-5 md:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1.35fr)] md:gap-y-0 md:px-0"
              >
                <p className="micro md:px-5 md:pt-0.5">{row.dimension}</p>

                <p className="text-faint text-fine leading-[1.7] md:pr-8">
                  <span className="micro mr-2 md:hidden">chatbot</span>
                  {row.chatbot}
                </p>

                <p className="border-rule text-ink text-fine leading-[1.7] md:border-l md:pr-5 md:pl-8">
                  <span className="micro text-cold mr-2 md:hidden">system</span>
                  {row.system}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <h3 className="legend mt-16">Four ways in. Only one of them is a conversation</h3>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {SURFACES.map((surface) => (
            <article key={surface.title} className="frame flex flex-col p-6">
              <surface.icon className="text-cold size-5" strokeWidth={1.5} aria-hidden="true" />
              <h4 className="text-ink mt-4 text-base leading-snug font-medium">{surface.title}</h4>
              <p className="text-dim mt-2.5 text-fine leading-[1.65]">{surface.body}</p>

              <div className="border-rule mt-auto border-t pt-4">
                {surface.href ? (
                  <Link
                    href={surface.href}
                    className="text-cold hover:text-ink inline-flex items-center gap-1.5 font-mono text-micro transition-colors"
                  >
                    {surface.source}
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="text-faint font-mono text-micro">{surface.source}</span>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="text-faint mt-6 text-fine leading-relaxed">
          The chat box is the surface I can put in front of you, because the prototype it belongs
          to is the only system here that is mine to publish. It is also the least representative of
          the four.
        </p>
      </div>
    </section>
  );
}
