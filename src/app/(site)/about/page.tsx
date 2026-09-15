import type { Metadata } from "next";
import {
  ABOUT_BIO,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About the maker and how to get in touch.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-16 px-5 pb-24 pt-32 sm:px-8">
      <div>
        <h1 className="font-display text-3xl text-fg sm:text-4xl">About</h1>
        <p className="mt-6 text-base leading-relaxed text-muted">
          {ABOUT_BIO}
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl text-fg">Contact</h2>
        <a
          href={`tel:${CONTACT_PHONE_HREF}`}
          className="mt-4 inline-block text-lg tracking-wide text-accent"
        >
          {CONTACT_PHONE_DISPLAY}
        </a>
      </div>
    </section>
  );
}
