"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    // Exposed so scroll-driven sections can drive the page from their own
    // controls (arrows, dots, swipes) through the same smoothed scroller
    // instead of fighting it with a native scrollTo.
    window.__lenis = lenis;

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const stop = () => lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("app:lenis-stop", stop);
    window.addEventListener("app:lenis-start", start);

    return () => {
      window.removeEventListener("app:lenis-stop", stop);
      window.removeEventListener("app:lenis-start", start);
      lenis.destroy();
      delete window.__lenis;
      gsap.ticker.remove(raf);
    };
  }, []);

  return <>{children}</>;
}
