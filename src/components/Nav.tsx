"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/site";

const LINKS = [
  { href: "/", label: "ΑΡΧΙΚΗ" },
  { href: "/catalogue", label: "ΚΑΤΑΛΟΓΟΣ" },
  { href: "/about", label: "ΓΙΑ ΕΜΑΣ" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHero = pathname === "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${
        isHero
          ? "border-transparent bg-transparent"
          : "bg-bg/70 border-border backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className={`flex items-center gap-2 ${
            isHero
              ? "font-playfair text-2xl text-white italic"
              : "font-display text-fg text-lg tracking-wide"
          }`}
          onClick={() => setOpen(false)}
        >
          {isHero && (
            <svg
              width="26"
              height="26"
              viewBox="0 0 256 256"
              fill="#ffffff"
              aria-hidden
            >
              <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
            </svg>
          )}
          {isHero ? "Carousel" : SITE_NAME}
        </Link>

        {isHero ? (
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/30 bg-white/20 px-2 py-2 backdrop-blur-md md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-white"
                    : "text-white/80 hover:bg-white/20 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : (
          <nav className="hidden gap-8 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-colors hover:text-accent ${
                  pathname === link.href ? "text-accent" : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {/* {isHero && (
            <Link
              href="/catalogue"
              className="hidden rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 md:block"
            >
              Shop Now
            </Link>
          )} */}

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`flex h-9 w-9 items-center justify-center ${
              isHero ? "md:hidden" : "sm:hidden"
            }`}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute top-0 left-0 h-px w-full transition-transform ${
                  isHero ? "bg-white" : "bg-fg"
                } ${open ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`absolute top-1/2 left-0 h-px w-full -translate-y-1/2 transition-opacity ${
                  isHero ? "bg-white" : "bg-fg"
                } ${open ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px w-full transition-transform ${
                  isHero ? "bg-white" : "bg-fg"
                } ${open ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          className={`flex flex-col gap-1 px-5 pb-4 ${
            isHero
              ? "bg-black/90 backdrop-blur-md md:hidden"
              : "border-border border-t sm:hidden"
          }`}
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-3 text-sm tracking-wide ${
                isHero
                  ? pathname === link.href
                    ? "text-white"
                    : "text-white/80"
                  : pathname === link.href
                    ? "text-accent"
                    : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isHero && (
            <Link
              href="/catalogue"
              onClick={() => setOpen(false)}
              className="mt-2 w-fit rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900"
            >
              Shop Now
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
