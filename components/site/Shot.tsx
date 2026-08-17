import Image from "next/image";

/**
 * A still of a running system.
 *
 * Framed rather than bled: these are captures of another application with its
 * own visual language — the toolchain is dark where this document is light —
 * and pretending otherwise would make the page look broken. A ruled frame with
 * a lettered caption reads as a plate mounted on a sheet, which is what it is.
 *
 * The caption carries provenance, not decoration. A screenshot on a portfolio
 * is only worth anything if the reader can tell what they are looking at and
 * when it was taken.
 */
export function Shot({
  src,
  alt,
  caption,
  provenance,
  width,
  height,
  priority = false,
}: {
  src: string;
  alt: string;
  caption: string;
  provenance?: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <figure className="sheet">
      <div className="bg-inset border-rule border-b">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(max-width: 768px) 100vw, 768px"
          className="h-auto w-full"
        />
      </div>
      <figcaption className="px-4 py-3">
        <p className="text-ink-mid text-sm leading-relaxed">{caption}</p>
        {provenance && <p className="text-ink-faint mt-1.5 text-xs">{provenance}</p>}
      </figcaption>
    </figure>
  );
}
