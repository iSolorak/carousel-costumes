"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import HeroRevealLayer, {
  type HeroRevealLayerHandle,
} from "@/components/HeroRevealLayer";
import { gsap } from "@/lib/gsap";
import { useAutoSpotlightTour } from "@/lib/useAutoSpotlightTour";
import { useSpotlightCursor } from "@/lib/useSpotlightCursor";

export default function Hero({
  baseSrc = "/hero/spotlight-base.jpg",
  revealSrc = "/hero/spotlight-reveal.jpg",
}: {
  baseSrc?: string;
  revealSrc?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HeroRevealLayerHandle>(null);
  // Coarse pointer (touch) devices have no cursor to drag the reveal
  // around, so they get the autonomous wandering torch instead. This is
  // still server-rendered (a client component pre-renders on the server
  // for the initial HTML), so the lazy initializer guards for `window`.
  const [isCoarsePointer, setIsCoarsePointer] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const handleChange = (e: MediaQueryListEvent) =>
      setIsCoarsePointer(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useSpotlightCursor(rootRef, revealRef);
  useAutoSpotlightTour(rootRef, revealRef, isCoarsePointer);

  // Fades the hero's text out as the page scrolls into the next section,
  // for a smoother hand-off than a hard cut.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(rootRef.current!.querySelectorAll(".hero-anim"), {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "100dvh" }}
    >
      <div className="hero-zoom absolute inset-0 z-10">
        <Image
          src={baseSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <HeroRevealLayer ref={revealRef} image={revealSrc} />

      <div className="pointer-events-none absolute top-[14%] right-0 left-0 z-50 flex flex-col items-center px-5 text-center">
        <h1 className="leading-[0.95] text-white">
          <span
            className="hero-anim hero-reveal block font-display text-5xl font-normal italic sm:text-7xl md:text-8xl"
            style={{ letterSpacing: "-0.05em", animationDelay: "0.25s" }}
          >
            ΠΑΙΔΙΚΕΣ
          </span>
          <span
            className="hero-anim hero-reveal -mt-1 block font-display text-5xl font-normal sm:text-7xl md:text-8xl"
            style={{ letterSpacing: "-0.08em", animationDelay: "0.42s" }}
          >
            ΣΤΟΛΕΣ
          </span>
        </h1>
      </div>

      <div
        className="hero-anim hero-fade absolute bottom-14 left-10 z-50 hidden max-w-[260px] sm:block md:left-14"
        style={{ animationDelay: "0.7s" }}
      >
        <p className="text-sm leading-relaxed text-white/80">
         Κάθε στολή φτιαγμένη με μεράκι.
        </p>
      </div>

      <div
        className="hero-anim hero-fade absolute right-5 bottom-10 left-5 z-50 flex max-w-full flex-col items-start gap-4 sm:right-10 sm:bottom-24 sm:left-auto sm:max-w-[260px] sm:gap-5 md:right-14"
        style={{ animationDelay: "0.85s" }}
      >
        <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
          Ανακάλυψε μοναδικές στολές με χαρακτήρα και ποιότητα.
        </p>
        <Link
          href="/catalogue"
          className="rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/30 active:scale-95"
        >
          Βρες τη στολή σου.
        </Link>
      </div>
    </section>
  );
}
