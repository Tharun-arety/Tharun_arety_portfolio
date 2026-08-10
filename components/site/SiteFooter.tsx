import { profile } from "@/content/profile";

/**
 * The title block.
 *
 * On a drawing this sits in the lower right and states who drew the sheet, who
 * released it, and at what revision. Here it is the page footer, holding the
 * same fields — which is why the whole site can be set as a document without
 * the conceit becoming decoration: the one place a drawing puts its metadata is
 * the one place a page puts its metadata anyway.
 */

const REVISION = "2026-08";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-rule border-t border-l px-3 py-2.5 ${className}`}>
      <div className="letter mb-1">{label}</div>
      <div className="text-ink text-sm leading-snug">{children}</div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 px-5 pb-16 sm:px-8 print:hidden">
      <div className="mx-auto max-w-5xl">
        <div className="sheet border-r-0 border-b-0 border-l-0">
          <div className="grid grid-cols-2 md:grid-cols-4">
            <Field label="Drawn by" className="border-l-0">
              {profile.name}
            </Field>
            <Field label="Discipline">{profile.role}</Field>
            <Field label="Location" className="border-l-0 md:border-l">
              {profile.location}
              <span className="text-ink-faint block text-xs">{profile.relocation}</span>
            </Field>
            <Field label="Revision">
              <span className="tnum text-sm">{REVISION}</span>
            </Field>

            <Field label="Contact" className="col-span-2 border-l-0">
              <a href={`mailto:${profile.contact.email}`} className="hover:text-verdigris transition-colors">
                {profile.contact.email}
              </a>
            </Field>
            <Field label="Source" className="col-span-2 border-l-0 md:border-l">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <a
                  href={profile.contact.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-verdigris transition-colors"
                >
                  GitHub / {profile.contact.githubHandle}
                </a>
                <a
                  href={profile.contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-verdigris transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </Field>
          </div>
        </div>

        <p className="text-ink-faint mt-4 text-xs">
          Built with Next.js. Every figure on this site is traceable to a committed eval report, a
          recorded trace, or a measured result.
        </p>
      </div>
    </footer>
  );
}
