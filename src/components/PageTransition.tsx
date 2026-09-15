"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";

// Deep-red velvet, built from CSS gradients only: a repeating pleat
// pattern layered over a vertical sheen, so no generated art is needed.
const CURTAIN_BG = [
  "repeating-linear-gradient(90deg, rgba(0,0,0,0.35) 0px, rgba(255,255,255,0.06) 7px, rgba(0,0,0,0.3) 14px, rgba(255,255,255,0.1) 21px)",
  "linear-gradient(180deg, #4a070c 0%, #7d1119 45%, #3a0509 100%)",
].join(", ");

/**
 * A curtain-close/open transition between routes within the (site) app.
 * Clicking an internal link closes the curtain first, navigates once it
 * meets in the middle, then opens again to reveal the new page — a nod
 * to the site's stage/spotlight theme.
 */
export default function PageTransition() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const isClosed = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  // The resting position must be set by GSAP itself, not a CSS class or
  // inline `transform` string: GSAP tracks plain-pixel `x` and `xPercent`
  // as two separate, ADDITIVE internal buckets per element. A transform
  // it didn't apply gets filed under `x`, so a later `gsap.set(el, {
  // xPercent })` doesn't override it — it adds on top, and a subsequent
  // `.to(..., { xPercent: 0 })` tween interpolates between two identical
  // values and never visibly moves. Doing it here, once, in a layout
  // effect (so it lands before the browser paints, no flash) keeps GSAP
  // as the single source of truth for this transform.
  useLayoutEffect(() => {
    gsap.set(leftRef.current, { xPercent: -100 });
    gsap.set(rightRef.current, { xPercent: 100 });
  }, []);

  // Route actually changed underneath the curtain — open it back up.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isClosed.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    isClosed.current = false;
    gsap.to([leftRef.current, rightRef.current], {
      xPercent: (i) => (i === 0 ? -100 : 100),
      duration: prefersReducedMotion ? 0 : 0.7,
      ease: "power4.inOut",
      delay: prefersReducedMotion ? 0 : 0.1,
    });
  }, [pathname]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const handleClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      const anchor = (e.target as HTMLElement)?.closest?.(
        "a[href]"
      ) as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download"))
        return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;

      const destination = url.pathname + url.search + url.hash;

      if (prefersReducedMotion) return; // let the default navigation happen

      // Must run — and stop the event — before it reaches the anchor's own
      // click handler (Next's Link already calls router.push there), or
      // navigation happens instantly and the curtain never gets to close.
      e.preventDefault();
      e.stopPropagation();
      isClosed.current = true;
      gsap.to([leftRef.current, rightRef.current], {
        xPercent: 0,
        duration: 0.6,
        ease: "power4.inOut",
        onComplete: () => router.push(destination),
      });
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, [router]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] flex">
      <div
        ref={leftRef}
        className="h-full w-1/2"
        style={{ background: CURTAIN_BG, boxShadow: "inset -16px 0 30px rgba(0,0,0,0.65)" }}
      />
      <div
        ref={rightRef}
        className="h-full w-1/2"
        style={{ background: CURTAIN_BG, boxShadow: "inset 16px 0 30px rgba(0,0,0,0.65)" }}
      />
    </div>
  );
}
