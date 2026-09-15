"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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
      gsap.ticker.remove(raf);
    };
  }, []);

  return <>{children}</>;
}
