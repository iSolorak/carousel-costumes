import Link from "next/link";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-raised/60 px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg text-fg">{SITE_NAME}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{SITE_TAGLINE}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm tracking-wide">
          <span className="mb-1 text-xs tracking-[0.25em] text-muted uppercase">
            Explore
          </span>
          <Link href="/" className="w-fit text-fg transition-colors hover:text-accent">
            Home
          </Link>
          <Link
            href="/catalogue"
            className="w-fit text-fg transition-colors hover:text-accent"
          >
            Catalogue
          </Link>
          <Link href="/about" className="w-fit text-fg transition-colors hover:text-accent">
            About
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm tracking-wide">
          <span className="mb-1 text-xs tracking-[0.25em] text-muted uppercase">
            Get in touch
          </span>
          <a
            href={`tel:${CONTACT_PHONE_HREF}`}
            className="w-fit text-fg transition-colors hover:text-accent"
          >
            {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-start gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {YEAR} {SITE_NAME}. All rights reserved.
        </p>
        <p>Made to order, stitched by hand.</p>
      </div>
    </footer>
  );
}
