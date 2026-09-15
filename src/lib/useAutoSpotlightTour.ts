"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import type { HeroRevealLayerHandle } from "@/components/HeroRevealLayer";

// Fractions of the hero's own box, so the tour scales to any hero size
// instead of hardcoded pixels. Durations are deliberately long — this
// should read as a slow, ambient drift, not something chasing the eye.
const WAYPOINTS = [
  { x: 0.28, y: 0.3, duration: 11 },
  { x: 0.7, y: 0.22, duration: 13 },
  { x: 0.6, y: 0.7, duration: 12 },
  { x: 0.22, y: 0.62, duration: 10 },
  { x: 0.5, y: 0.42, duration: 11 },
];

/**
 * Mobile/touch fallback for the spotlight cursor: with no mouse to drag the
 * reveal around, the hero would otherwise stay fully dark until someone
 * happens to swipe across it. Wanders a virtual torch around the hero on
 * its own, slowly, so the bright side keeps surfacing without input.
 *
 * Scoped to whatever container is passed in (the hero section) — it never
 * runs anywhere else on the site.
 */
export function useAutoSpotlightTour(
  containerRef: RefObject<HTMLElement | null>,
  revealRef: RefObject<HeroRevealLayerHandle | null>,
  enabled: boolean
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const toPx = (fx: number, fy: number) => {
      const rect = container.getBoundingClientRect();
      return { x: fx * rect.width, y: fy * rect.height };
    };

    if (prefersReducedMotion) {
      // No ongoing animation — just reveal a few fixed spots so the image
      // isn't left completely hidden for users who opted out of motion.
      WAYPOINTS.forEach((wp) => {
        const { x, y } = toPx(wp.x, wp.y);
        revealRef.current?.paintAt(x, y);
      });
      return;
    }

    const start = toPx(WAYPOINTS[0].x, WAYPOINTS[0].y);
    const point = { x: start.x, y: start.y };

    const tl = gsap.timeline({ repeat: -1 });
    WAYPOINTS.forEach((wp, i) => {
      const next = WAYPOINTS[(i + 1) % WAYPOINTS.length];
      const target = toPx(next.x, next.y);
      tl.to(point, {
        x: target.x,
        y: target.y,
        duration: next.duration,
        ease: "sine.inOut",
        onUpdate: () => revealRef.current?.paintAt(point.x, point.y),
      });
    });

    return () => {
      tl.kill();
    };
  }, [containerRef, revealRef, enabled]);
}
