"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { uploadUrl } from "@/lib/costumes";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { ramp, useScrollProgress } from "@/lib/useScrollProgress";

const isPrimaryButton = (e: ReactPointerEvent) =>
  e.pointerType !== "mouse" || e.button === 0;

export type CarouselCostume = {
  id: string;
  title: string;
  description: string;
  imagePath: string;
};

// Viewport heights of scrolling each costume gets. Long enough that a card
// holds centre stage for a beat, short enough that the section doesn't
// become a wall between the hero and the rest of the page.
const SCROLL_PER_CARD = 0.62;
// How much of a card's width a neighbour is pushed aside by — under 1 so
// the flanking costumes overlap into depth rather than sitting in a row.
const SPREAD = 0.66;
// Cards further than this from centre are fully faded out, so a long
// collection doesn't pay for transforming stills nobody can see.
const DEPTH_LIMIT = 3;
// Fraction of a card's width a drag must cover to count as a swipe.
const DRAG_THRESHOLD_RATIO = 0.18;
const DRAG_INTENT_PX = 6;

/**
 * The costume showcase, told on the scroll like the hero above it: the
 * section pins and the scroll position itself walks the rack forward, one
 * costume at a time, each rotating up out of the depth into the light.
 *
 * Scroll is the single source of truth for which costume is centred — the
 * arrows, dots and swipes all work by scrolling the page rather than by
 * setting their own index, so the two can never disagree.
 */
export default function ProductCarousel({
  costumes,
}: {
  costumes: CarouselCostume[];
}) {
  const count = costumes.length;

  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
  const headingRef = useRef<HTMLDivElement>(null);

  // The card position the scroll alone asks for, and the extra offset a
  // finger is currently dragging it by. Kept out of state: both change per
  // frame, and re-rendering a rack of images that often is what makes a
  // scrubbed section stutter.
  const scrollPosRef = useRef(0);
  const dragPosRef = useRef(0);
  const cardWidthRef = useRef(0);
  const drag = useRef({ active: false, startX: 0, offset: 0, moved: false });

  const [index, setIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const card = cardsRef.current[0];
    if (!card) return;
    const measure = () => {
      cardWidthRef.current = card.offsetWidth;
      setCardWidth(card.offsetWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  /** Writes the depth transforms for a (possibly fractional) rack position. */
  const layout = useCallback(
    (position: number) => {
      const step = cardWidthRef.current * SPREAD;
      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        const offset = i - position;
        const distance = Math.min(Math.abs(offset), DEPTH_LIMIT);
        const clamped = Math.max(-DEPTH_LIMIT, Math.min(DEPTH_LIMIT, offset));

        const x = clamped * step;
        const z = -distance * 190;
        const rotateY = -clamped * 15;
        const scale = 1 - distance * 0.07;
        const opacity = Math.max(0, 1 - distance * 0.3);

        // The cards are pinned to the stage's centre point and offset from
        // there — an absolutely positioned child doesn't take part in the
        // parent's flex centring, so leaving it to the static position put
        // the rack off-centre by a different amount at every width.
        el.style.transform =
          `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) ` +
          `rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = distance < 0.1 ? "none" : `blur(${(distance * 2).toFixed(1)}px)`;
        el.style.zIndex = String(100 - Math.round(distance * 10));
        el.style.pointerEvents = distance > 2.2 ? "none" : "auto";
      });
    },
    []
  );

  const applyProgress = useCallback(
    (p: number) => {
      // The rack holds still for a beat at each end so the first and last
      // costume get a moment centred rather than sliding straight through.
      const walk = ramp(p, 0.08, 0.92);
      scrollPosRef.current = walk * Math.max(count - 1, 0);
      layout(scrollPosRef.current + dragPosRef.current);

      const rounded = Math.round(scrollPosRef.current);
      setIndex((prev) => (prev === rounded ? prev : rounded));

      if (headingRef.current) {
        const o = ramp(p, 0.01, 0.1);
        headingRef.current.style.opacity = o.toFixed(3);
        headingRef.current.style.transform = `translateY(${((1 - o) * 20).toFixed(1)}px)`;
      }
    },
    [count, layout]
  );

  useScrollProgress(rootRef, applyProgress);

  // With motion reduced there is no scrub track, so the rack is laid out
  // once around whichever costume the controls have selected.
  useEffect(() => {
    if (reduced) layout(index);
  }, [reduced, index, layout]);

  // Re-runs the layout when the cards finish measuring, so the rack isn't
  // left stacked at the origin before the first scroll tick.
  useEffect(() => {
    if (cardWidth > 0) layout(scrollPosRef.current + dragPosRef.current);
  }, [cardWidth, layout]);

  /**
   * Moves to a costume by scrolling the page to where that costume is
   * centred — the same position the scroll listener above would read.
   */
  const goTo = useCallback(
    (i: number) => {
      const root = rootRef.current;
      if (!root || count <= 1) return;
      const target = Math.max(0, Math.min(count - 1, i));

      if (reduced) {
        setIndex(target);
        return;
      }

      const track = root.offsetHeight - window.innerHeight;
      // Inverse of `walk` in applyProgress.
      const p = 0.08 + (target / (count - 1)) * (0.92 - 0.08);
      const top = root.offsetTop + track * p;

      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(top, { duration: 0.9 });
      else window.scrollTo({ top, behavior: "smooth" });
    },
    [count, reduced]
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (count <= 1 || !isPrimaryButton(e)) return;
    drag.current = { active: true, startX: e.clientX, offset: 0, moved: false };
    setIsDragging(true);

    const handleMove = (ev: PointerEvent) => {
      const offset = ev.clientX - drag.current.startX;
      drag.current.offset = offset;
      if (Math.abs(offset) > DRAG_INTENT_PX) drag.current.moved = true;
      const step = cardWidthRef.current * SPREAD;
      dragPosRef.current = step > 0 ? -offset / step : 0;
      layout(scrollPosRef.current + dragPosRef.current);
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);

      const { offset } = drag.current;
      drag.current.active = false;
      setIsDragging(false);
      dragPosRef.current = 0;

      const step = cardWidthRef.current * SPREAD;
      if (step > 0 && Math.abs(offset) > step * DRAG_THRESHOLD_RATIO) {
        goTo(Math.round(scrollPosRef.current) + (offset < 0 ? 1 : -1));
      } else {
        layout(scrollPosRef.current);
      }
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
  };

  const onCardClick = (i: number) => {
    // A drag that just ended shouldn't also register as a card tap.
    if (drag.current.moved) return;
    goTo(i);
  };

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Ξεχωριστές στολές"
      className="relative w-full bg-black"
      style={{
        height: reduced
          ? "100svh"
          : `calc(100svh + ${Math.max(count - 1, 0) * SCROLL_PER_CARD * 100}svh)`,
      }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-[100svh] min-h-[560px] w-full flex-col items-center justify-center overflow-hidden"
      >
        {/* The last frame of the hero's clip — this section opens on exactly
            the stage the scroll above it just finished lighting. */}
        <Image
          src="/bg/stage-lit.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{ filter: "brightness(0.62) saturate(1.05)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,196,110,0.12)_0%,transparent_58%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,4,12,0.82)_0%,rgba(8,4,12,0.15)_34%,rgba(8,4,12,0.2)_62%,var(--color-bg)_100%)]"
        />

        <div
          ref={headingRef}
          style={reduced ? undefined : { opacity: 0 }}
          className="relative z-10 mb-8 px-6 text-center sm:mb-10"
        >
          <p className="text-[11px] tracking-[0.24em] text-white/55 uppercase">
            Η συλλογή
          </p>
          <h2
            className="mt-2 font-display text-3xl text-white sm:text-5xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Στη σκηνή, μία‑μία.
          </h2>
        </div>

        <div
          className={`relative z-10 w-full touch-pan-y select-none ${
            isDragging ? "cursor-grabbing" : count > 1 ? "cursor-grab" : ""
          }`}
          onPointerDown={onPointerDown}
          style={{ perspective: "1400px" }}
        >
          <div
            ref={trackRef}
            className="relative mx-auto flex h-[clamp(380px,52svh,520px)] w-full items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {costumes.map((costume, i) => {
              const image = uploadUrl(costume.imagePath);
              const isActive = i === index;
              return (
                <div
                  key={costume.id}
                  ref={(el) => {
                    cardsRef.current[i] = el;
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Δες τη στολή ${costume.title}`}
                  aria-current={isActive}
                  onClick={() => onCardClick(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goTo(i);
                    }
                  }}
                  className={`absolute top-1/2 left-1/2 w-56 shrink-0 cursor-pointer overflow-hidden rounded-3xl border backdrop-blur-md will-change-transform sm:w-64 md:w-72 ${
                    isActive
                      ? "border-accent/50 bg-[#1a0f20]/70 shadow-[0_0_0_1px_rgba(236,72,153,0.25),0_30px_60px_-15px_rgba(0,0,0,0.7),0_0_60px_-10px_rgba(236,72,153,0.45)]"
                      : "border-white/10 bg-[#1a0f20]/60 shadow-2xl shadow-black/60"
                  }`}
                  style={{
                    // Transforms are written straight to the node by
                    // `layout`; only the colour treatment transitions.
                    transition: "border-color 400ms ease, box-shadow 400ms ease",
                    // The server has no card width to lay the rack out
                    // from, so until the first measured layout runs the
                    // stack is centred with only the leading costume shown
                    // — rather than every card piled on the same spot.
                    transform: "translate(-50%,-50%)",
                    opacity: i === 0 ? 1 : 0,
                  }}
                >
                  {image && (
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image
                        src={image}
                        alt={costume.title}
                        fill
                        draggable={false}
                        sizes="(min-width: 768px) 288px, (min-width: 640px) 256px, 224px"
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                      <span
                        className={`absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full font-display text-[11px] tracking-wide backdrop-blur-sm transition-colors ${
                          isActive
                            ? "bg-accent text-white"
                            : "bg-black/40 text-white/80"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}

                  <div className="px-5 py-5 text-center">
                    <h3 className="font-display text-xl text-white sm:text-2xl">
                      {costume.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-white/70">
                      {costume.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Προηγούμενη στολή"
              className="absolute top-1/2 left-3 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:pointer-events-none disabled:opacity-25 sm:left-6"
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
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === count - 1}
              aria-label="Επόμενη στολή"
              className="absolute top-1/2 right-3 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:pointer-events-none disabled:opacity-25 sm:right-6"
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
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

            <div className="relative z-20 mt-8 flex items-center gap-2">
              {costumes.map((costume, i) => (
                <button
                  key={costume.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Δες τη στολή ${costume.title}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-accent"
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
