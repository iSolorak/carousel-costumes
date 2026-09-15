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

const isPrimaryButton = (e: ReactPointerEvent) =>
  e.pointerType !== "mouse" || e.button === 0;

export type CarouselCostume = {
  id: string;
  title: string;
  description: string;
  imagePath: string;
};

// Matches the track's `gap-6`.
const GAP_PX = 24;
// Fraction of a card's width a drag must cover before it counts as a swipe
// instead of snapping back to the current card.
const DRAG_THRESHOLD_RATIO = 0.18;
// A pointer has to move at least this many px before a drag "counts" —
// keeps an ordinary tap on a card from being swallowed as a zero-length
// swipe (which would otherwise suppress the card's own click-to-select).
const DRAG_INTENT_PX = 6;

export default function ProductCarousel({
  costumes,
}: {
  costumes: CarouselCostume[];
}) {
  const count = costumes.length;
  const [index, setIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, offset: 0, moved: false });

  // Measured live (rather than assumed from the Tailwind breakpoints below)
  // so the translate math stays correct however the card actually renders.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() =>
      setViewportWidth(viewport.clientWidth)
    );
    observer.observe(viewport);
    setViewportWidth(viewport.clientWidth);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const card = firstCardRef.current;
    if (!card) return;
    const observer = new ResizeObserver(() => setCardWidth(card.offsetWidth));
    observer.observe(card);
    setCardWidth(card.offsetWidth);
    return () => observer.disconnect();
  }, []);

  const step = cardWidth + GAP_PX;
  const ready = viewportWidth > 0 && cardWidth > 0;
  const centerOffset = (viewportWidth - cardWidth) / 2;
  const baseTranslate = centerOffset - index * step;

  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return;
      setIndex(((i % count) + count) % count);
    },
    [count]
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Tracked via window-level listeners rather than setPointerCapture:
  // capturing the pointer on the container retargets the eventual "click"
  // to the capturing element instead of the card under the cursor, which
  // silently ate every card click (and any click during a would-be drag).
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (count <= 1 || !isPrimaryButton(e)) return;
    drag.current = { active: true, startX: e.clientX, offset: 0, moved: false };
    setIsDragging(true);

    const handleMove = (ev: PointerEvent) => {
      const offset = ev.clientX - drag.current.startX;
      drag.current.offset = offset;
      if (Math.abs(offset) > DRAG_INTENT_PX) drag.current.moved = true;
      setDragOffset(offset);
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);

      const { offset } = drag.current;
      drag.current.active = false;
      setIsDragging(false);
      setDragOffset(0);
      if (step > 0 && Math.abs(offset) > step * DRAG_THRESHOLD_RATIO) {
        if (offset < 0) next();
        else prev();
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
    <section className="relative flex h-svh min-h-[560px] w-full flex-col items-center justify-center overflow-hidden bg-black py-10">
      <div className="absolute inset-[-15%]">
        <Image
          src="/hero/spotlight-base.jpg"
          alt=""
          fill
          sizes="130vw"
          className="object-cover"
          style={{ filter: "blur(10px) brightness(0.5)" }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

      <div
        ref={viewportRef}
        className={`relative z-10 w-full touch-pan-y overflow-hidden transition-opacity duration-300 select-none ${
          ready ? "opacity-100" : "opacity-0"
        } ${isDragging ? "cursor-grabbing" : count > 1 ? "cursor-grab" : ""}`}
        onPointerDown={onPointerDown}
      >
        <div
          className="flex items-stretch"
          style={{
            gap: `${GAP_PX}px`,
            transform: `translateX(${baseTranslate + dragOffset}px)`,
            transition: isDragging
              ? "none"
              : "transform 550ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {costumes.map((costume, i) => {
            const image = uploadUrl(costume.imagePath);
            const isActive = i === index;
            return (
              <div
                key={costume.id}
                ref={(el) => {
                  if (i === 0) firstCardRef.current = el;
                }}
                role="button"
                tabIndex={0}
                aria-label={`Go to ${costume.title}`}
                aria-current={isActive}
                onClick={() => onCardClick(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goTo(i);
                  }
                }}
                className={`group w-64 shrink-0 cursor-pointer overflow-hidden rounded-3xl border bg-white/5 backdrop-blur-sm transition-all duration-500 ease-out sm:w-72 ${
                  isActive
                    ? "scale-100 border-accent/50 opacity-100 shadow-[0_0_0_1px_rgba(201,64,31,0.25),0_30px_60px_-15px_rgba(0,0,0,0.7),0_0_50px_-10px_rgba(201,64,31,0.35)]"
                    : "scale-90 border-white/10 opacity-50 shadow-2xl shadow-black/60 hover:scale-[0.93] hover:opacity-70"
                }`}
              >
                {image && (
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={image}
                      alt={costume.title}
                      fill
                      draggable={false}
                      sizes="(min-width: 640px) 288px, 256px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                    <span
                      className={`absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full font-display text-[11px] tracking-wide backdrop-blur-sm ${
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
                  <h2 className="font-display text-xl text-white sm:text-2xl">
                    {costume.title}
                  </h2>
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
            onClick={prev}
            aria-label="Previous costume"
            className="absolute top-1/2 left-3 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:left-6"
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
            onClick={next}
            aria-label="Next costume"
            className="absolute top-1/2 right-3 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:right-6"
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
                aria-label={`Go to ${costume.title}`}
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
    </section>
  );
}
