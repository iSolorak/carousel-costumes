"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Reads a tall "scrollytelling" section's scroll progress every frame and
 * hands it to `onProgress` as 0..1 — 0 when the section's top hits the top
 * of the viewport, 1 when its bottom does.
 *
 * Deliberately a callback rather than React state: these values change on
 * every single frame while scrolling, and re-rendering the tree that often
 * is exactly what makes a scrubbed canvas stutter. Consumers write to
 * refs/canvases/styles directly.
 *
 * Polled from rAF instead of a scroll listener because Lenis animates the
 * scroll position from its own ticker — sampling per frame keeps the
 * visuals locked to the smoothed position rather than to raw wheel events.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void
) {
  // Kept in a ref so a consumer passing an inline arrow function doesn't
  // tear down and restart the loop on every render.
  const callbackRef = useRef(onProgress);
  useEffect(() => {
    callbackRef.current = onProgress;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    let last = -1;

    const tick = () => {
      const rect = el.getBoundingClientRect();
      // The section is taller than the viewport by exactly the distance the
      // pinned content stays put for; that surplus is the scrub track.
      const track = rect.height - window.innerHeight;
      // With no track there is no progress to report — staying silent
      // rather than reporting a flat 0 leaves a section that has collapsed
      // its track (reduced motion) free to present its own end state
      // instead of having it overwritten every frame.
      if (track <= 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(Math.max(-rect.top / track, 0), 1);

      if (p !== last) {
        last = p;
        callbackRef.current(p);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [ref]);
}

/** Ramps 0→1 across [a, b] and clamps outside it. */
export function ramp(p: number, a: number, b: number) {
  if (b === a) return p >= b ? 1 : 0;
  return Math.min(Math.max((p - a) / (b - a), 0), 1);
}

/** 1 in the middle of [a, b], 0 at both ends — for cross-fading captions. */
export function band(p: number, a: number, b: number, fade = 0.12) {
  return Math.min(ramp(p, a, a + fade), 1 - ramp(p, b - fade, b));
}
