"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { HeroRevealLayerHandle } from "@/components/HeroRevealLayer";

/**
 * Drives a HeroRevealLayer from the cursor, in coordinates local to
 * `containerRef`'s own box — so the trail tracks correctly no matter
 * where the container sits on the page or how far it's scrolled. Bypasses
 * React state for the per-frame update (see HeroRevealLayer).
 *
 * Paints continuously along wherever the pointer (or a dragging finger)
 * moves, gliding smoothly behind it — and never un-paints: once an area
 * has been revealed it stays revealed, so the second image progressively
 * uncovers itself as you move around.
 *
 * Not gated behind `prefers-reduced-motion`: this only ever moves in
 * response to the user's own pointer, it never animates on its own, and
 * skipping it entirely used to leave the reveal layer's mask unset —
 * which meant the "hidden" image showed fully, permanently, with no
 * interaction at all.
 */
// Exponential time constant (ms), not a flat per-frame factor — a flat
// factor applied once per `requestAnimationFrame` converges twice as fast
// on a 120Hz display as on 60Hz, which is what made the trail feel snappy
// on high-refresh-rate screens. Chosen to match the old 0.06-per-frame
// feel at 60Hz (dt ~16.7ms).
const SMOOTH_TAU_MS = 270;

export function useSpotlightCursor(
  containerRef: RefObject<HTMLElement | null>,
  revealRef: RefObject<HeroRevealLayerHandle | null>
) {
  const mouse = useRef({ x: -9999, y: -9999 });
  const smooth = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // `pointermove` fires for a mouse cursor and for a dragging finger
    // alike, so this paints from touch input too.
    const handlePointerMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    // Puts the smoothed position right where the pointer enters, so the
    // first stamp lands there instead of gliding in from off-screen.
    const handlePointerEnter = (e: PointerEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      smooth.current.x = e.clientX;
      smooth.current.y = e.clientY;
    };

    container.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    container.addEventListener("pointerenter", handlePointerEnter);

    let last = performance.now();

    const loop = (now: number) => {
      // Capped so a backgrounded tab doesn't lurch the trail across the
      // screen in one jump when it regains focus.
      const dt = Math.min(now - last, 100);
      last = now;
      const factor = 1 - Math.exp(-dt / SMOOTH_TAU_MS);

      const dx = mouse.current.x - smooth.current.x;
      const dy = mouse.current.y - smooth.current.y;
      smooth.current.x += dx * factor;
      smooth.current.y += dy * factor;

      // Skip the (re)paint once the eased position has settled — avoids
      // burning a canvas composite every frame while the pointer is idle.
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        const rect = container.getBoundingClientRect();
        revealRef.current?.paintAt(
          smooth.current.x - rect.left,
          smooth.current.y - rect.top
        );
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerenter", handlePointerEnter);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, revealRef]);
}
