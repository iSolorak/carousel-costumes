"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { uploadUrl } from "@/lib/costumes";

export type CarouselCostume = {
  id: string;
  title: string;
  description: string;
  imagePath: string;
};

export default function ProductCarousel({
  costumes,
}: {
  costumes: CarouselCostume[];
}) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const count = costumes.length;

  const scrollToCard = (i: number) => {
    const track = trackRef.current;
    const card = cardRefs.current[i];
    if (!track || !card) return;
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  const goTo = (i: number) => scrollToCard(((i % count) + count) % count);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Tracks which card sits nearest the track's center as the user scrolls
  // or swipes, so the dots/scaling stay in sync with native momentum
  // scrolling instead of fighting it.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf: number | null = null;
    const handleScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const center = track.scrollLeft + track.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(cardCenter - center);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setIndex(closest);
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

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
        ref={trackRef}
        className="no-scrollbar relative z-10 flex w-full snap-x snap-mandatory gap-6 overflow-x-auto px-[12%] sm:px-[26%]"
      >
        {costumes.map((costume, i) => {
          const image = uploadUrl(costume.imagePath);
          const isActive = i === index;
          return (
            <div
              key={costume.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`w-64 shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/60 backdrop-blur-sm transition-all duration-500 ease-out sm:w-72 ${
                isActive
                  ? "scale-100 opacity-100"
                  : "scale-90 opacity-50"
              }`}
            >
              {image && (
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={image}
                    alt={costume.title}
                    fill
                    sizes="(min-width: 640px) 288px, 256px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="px-5 py-5 text-center">
                <span className="text-xs tracking-[0.3em] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-2 font-display text-xl text-white sm:text-2xl">
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

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous costume"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:left-6"
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
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:right-6"
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
                  i === index ? "w-6 bg-accent" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
