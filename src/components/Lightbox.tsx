"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type LightboxCostume = {
  title: string;
  description: string;
  image: string;
};

export default function Lightbox({
  costume,
  onClose,
}: {
  costume: LightboxCostume;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
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
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={costume.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/90 p-4 backdrop-blur-sm sm:p-8"
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
        className="flex w-full max-w-4xl flex-col gap-6 sm:flex-row sm:items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[3/4] w-full max-w-sm shrink-0 self-center overflow-hidden rounded-sm sm:max-w-md">
          <Image
            src={costume.image}
            alt={costume.title}
            fill
            sizes="(min-width: 640px) 448px, 90vw"
            className="object-cover"
          />
        </div>

        <div className="max-w-sm">
          <h2 className="font-display text-2xl text-fg sm:text-3xl">
            {costume.title}
          </h2>
          <p className="mt-3 text-sm text-muted">{costume.description}</p>
        </div>
      </div>
    </div>
  );
}
