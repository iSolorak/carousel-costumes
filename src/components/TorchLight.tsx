"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Soft warm glows that drift on their own across the whole site (mounted
 * once in the root layout) — independent of the cursor. Two motions
 * compose per torch: a slow autonomous "free roam" loop between viewport
 * waypoints, and a gentle vertical drift tied to how far down the page
 * you've scrolled, like distant light sources travelling with you.
 */
type TorchConfig = {
  sizeClass: string;
  opacity: number;
  start: { left: string; top: string };
  waypoints: { left: string; top: string; duration: number }[];
  scrollDrift: number;
};

// Sizes step down at each breakpoint so the glows stay proportional on
// small screens instead of overwhelming a narrow viewport.
const TORCHES: TorchConfig[] = [
  {
    sizeClass: "h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72",
    opacity: 0.55,
    start: { left: "18%", top: "22%" },
    waypoints: [
      { left: "72%", top: "14%", duration: 18 },
      { left: "24%", top: "76%", duration: 22 },
      { left: "80%", top: "58%", duration: 20 },
      { left: "38%", top: "28%", duration: 16 },
    ],
    scrollDrift: 180,
  },
  {
    sizeClass: "h-28 w-28 sm:h-32 sm:w-32 md:h-40 md:w-40",
    opacity: 0.4,
    start: { left: "62%", top: "68%" },
    waypoints: [
      { left: "14%", top: "48%", duration: 13 },
      { left: "46%", top: "12%", duration: 15 },
      { left: "84%", top: "34%", duration: 14 },
      { left: "58%", top: "82%", duration: 12 },
    ],
    scrollDrift: -120,
  },
  {
    sizeClass: "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28",
    opacity: 0.35,
    start: { left: "40%", top: "50%" },
    waypoints: [
      { left: "8%", top: "18%", duration: 10 },
      { left: "30%", top: "88%", duration: 11 },
      { left: "68%", top: "70%", duration: 9 },
      { left: "90%", top: "10%", duration: 13 },
    ],
    scrollDrift: 90,
  },
];

export default function TorchLight() {
  const torchRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const torches = torchRefs.current.filter(
      (el): el is HTMLDivElement => Boolean(el)
    );
    if (torches.length === 0) return;

    const ctx = gsap.context(() => {
      torches.forEach((torch, i) => {
        const config = TORCHES[i];
        // Always place it somewhere, even with reduced motion — only the
        // roaming/drift animations below are skipped in that case.
        gsap.set(torch, config.start);
        if (prefersReducedMotion) return;

        const tl = gsap.timeline({
          repeat: -1,
          yoyo: true,
          defaults: { ease: "sine.inOut" },
        });
        config.waypoints.forEach(({ left, top, duration }) => {
          tl.to(torch, { left, top, duration });
        });

        gsap.to(torch, {
          y: config.scrollDrift,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
    >
      {TORCHES.map((config, i) => (
        <div
          key={i}
          ref={(el) => {
            torchRefs.current[i] = el;
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${config.sizeClass}`}
          style={{
            background: `radial-gradient(circle, rgba(255,196,120,${config.opacity}) 0%, rgba(255,150,60,${config.opacity * 0.5}) 40%, rgba(255,120,40,0) 72%)`,
            mixBlendMode: "screen",
            filter: "blur(6px)",
          }}
        />
      ))}
    </div>
  );
}
