"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Lightbox, { LightboxCostume } from "@/components/Lightbox";
import { uploadUrl } from "@/lib/costumes";

export type CatalogueCostume = {
  id: string;
  title: string;
  description: string;
  imagePath: string;
};

export default function CatalogueGrid({
  costumes,
}: {
  costumes: CatalogueCostume[];
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<LightboxCostume | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const hoverCleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");

      if (!prefersReducedMotion) {
        gsap.set(cards, { opacity: 0, y: 28 });
        ScrollTrigger.batch(cards, {
          start: "top 88%",
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power2.out",
            }),
          once: true,
        });
      }

      if (canHover && !prefersReducedMotion) {
        cards.forEach((card) => {
          const setX = gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power2.out" });
          const setY = gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power2.out" });

          const onMove = (event: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;
            setX(px * 10);
            setY(py * -10);
          };
          const onLeave = () => {
            setX(0);
            setY(0);
          };

          card.addEventListener("mousemove", onMove);
          card.addEventListener("mouseleave", onLeave);
          hoverCleanups.push(() => {
            card.removeEventListener("mousemove", onMove);
            card.removeEventListener("mouseleave", onLeave);
          });
        });
      }
    }, gridRef);

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [costumes]);

  return (
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        style={{ perspective: 1000 }}
      >
        {costumes.map((costume, index) => {
          const image = uploadUrl(costume.imagePath);
          if (!image) return null;

          return (
            <button
              key={costume.id}
              type="button"
              data-card
              onClick={() =>
                setActive({
                  title: costume.title,
                  description: costume.description,
                  image,
                })
              }
              className="group text-left will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-bg-raised">
                <Image
                  src={image}
                  alt={costume.title}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h2 className="mt-4 font-display text-lg text-fg">
                {costume.title}
              </h2>
              <p className="mt-1 text-sm text-muted">{costume.description}</p>
            </button>
          );
        })}
      </div>

      {active && <Lightbox costume={active} onClose={() => setActive(null)} />}
    </>
  );
}
