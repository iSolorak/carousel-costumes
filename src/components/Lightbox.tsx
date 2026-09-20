"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from "@/lib/site";

export type LightboxCostume = {
  title: string;
  description: string;
  image: string;
};

// How long the close (fade + settle) transition takes, in ms — must match
// the duration classes below so the DOM node isn't torn out mid-animation.
const EXIT_DURATION_MS = 300;
const TRANSITION =
  "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";

export default function Lightbox({
  costume,
  onClose,
}: {
  costume: LightboxCostume | null;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Kept mounted for a beat after `costume` goes null so the close
  // transition has something to animate — otherwise the modal would just
  // vanish the instant it's dismissed, same as it popping in with no
  // transition at all.
  const [renderedCostume, setRenderedCostume] =
    useState<LightboxCostume | null>(costume);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (costume) {
      setRenderedCostume(costume);
      // Mount in the hidden state first, then flip to visible on the next
      // frame so the browser actually has something to transition from.
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timeout = setTimeout(
      () => setRenderedCostume(null),
      EXIT_DURATION_MS
    );
    return () => clearTimeout(timeout);
  }, [costume]);

  useEffect(() => {
    if (!renderedCostume) return;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("app:lenis-stop"));
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("app:lenis-start"));
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [renderedCostume, onClose]);

  if (!renderedCostume) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={renderedCostume.title}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-bg/90 p-4 backdrop-blur-sm sm:p-8 ${TRANSITION} ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center text-2xl text-muted transition-colors hover:text-accent"
      >
        ×
      </button>

      <div
        className={`flex w-full max-w-4xl flex-col gap-6 sm:flex-row sm:items-center ${TRANSITION} ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[3/4] w-full max-w-sm shrink-0 self-center overflow-hidden rounded-sm sm:max-w-md">
          <Image
            src={renderedCostume.image}
            alt={renderedCostume.title}
            fill
            sizes="(min-width: 640px) 448px, 90vw"
            className="object-cover"
          />
        </div>

        <div className="max-w-sm">
          <h2 className="font-display text-2xl text-fg sm:text-3xl">
            {renderedCostume.title}
          </h2>
          <p className="mt-3 text-sm text-muted">
            {renderedCostume.description}
          </p>

          <a
            href={`tel:${CONTACT_PHONE_HREF}`}
            className="group mt-6 inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-lg shadow-accent/30 transition-all hover:scale-[1.03] hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/40 active:scale-95"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
            </svg>
            Call to order
            <span className="text-white/80">{CONTACT_PHONE_DISPLAY}</span>
          </a>
          <p className="mt-3 text-xs text-muted">
            Made to order — call to ask about this costume.
          </p>
        </div>
      </div>
    </div>
  );
}
