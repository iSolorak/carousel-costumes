"use client";

// Aliased: the frame loader below needs the DOM `Image` constructor.
import NextImage from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import HeroRevealLayer, {
  type HeroRevealLayerHandle,
} from "@/components/HeroRevealLayer";
import {
  band,
  ramp,
  useScrollProgress,
} from "@/lib/useScrollProgress";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useAutoSpotlightTour } from "@/lib/useAutoSpotlightTour";
import { useSpotlightCursor } from "@/lib/useSpotlightCursor";

// Produced by scripts/build-hero-frames.mjs — keep in sync with the count
// it prints.
const FRAME_COUNT = 110;
const framePath = (i: number) =>
  `/hero/frames/frame_${String(i + 1).padStart(4, "0")}.webp`;

// The footage finishes lighting up slightly before the scroll track ends,
// so the closing act sits on a settled, fully-lit frame instead of one
// still visibly changing under the call to action.
const FOOTAGE_END = 0.88;

// How many frames to fetch at once. The sequence is ~5 MB; firing all 110
// requests at once would starve the first few frames, which are the only
// ones needed to paint something immediately.
const LOAD_CONCURRENCY = 6;

const CHAPTERS = ["Στο σκοτάδι", "Τα φώτα", "Η σκηνή σου"];

/**
 * The homepage's scroll-told opening: a pinned stage that plays a
 * scroll-scrubbed frame sequence (dark theatre → flooded with light and
 * confetti) while the existing torch reveal lets you paint the lit version
 * of the same scene through the darkness with the cursor.
 *
 * The two halves line up because the clip was generated from the very
 * stills the torch cross-fades between — see scripts/build-hero-frames.mjs.
 * The torch owns the first act; once the stage lights start coming up on
 * their own, the reveal layer hands the frame over to the footage.
 */
export default function HeroCinematic() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HeroRevealLayerHandle>(null);
  const revealBoxRef = useRef<HTMLDivElement>(null);
  const actsRef = useRef<Array<HTMLDivElement | null>>([]);
  const scrimRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Array<HTMLLIElement | null>>([]);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const drawnRef = useRef(-1);

  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Coarse pointer (touch) devices have no cursor to drag the torch
  // around, so they get the autonomous wandering one instead.
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");

  // The torch paints in coordinates local to the pinned stage (not the
  // tall scroll track around it), so both hooks get the stage element.
  useSpotlightCursor(stageRef, revealRef);
  useAutoSpotlightTour(stageRef, revealRef, isCoarsePointer);

  // ---- frame sequence ----------------------------------------------------
  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imagesRef.current[index];
    if (!canvas || !ctx) return;
    // Frames stream in over a few seconds; until the requested one lands,
    // whatever was drawn last stays on screen rather than flashing black.
    if (!img?.complete || !img.naturalWidth) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.fillStyle = "#07040a";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    drawnRef.current = index;
  };

  useEffect(() => {
    // With motion reduced the stage never scrubs, so the 5 MB sequence is
    // never fetched — the lit still below does the whole job.
    if (reduced) return;

    let cancelled = false;
    let cursor = 0;

    const loadNext = () => {
      if (cancelled || cursor >= FRAME_COUNT) return;
      const index = cursor++;
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(index);
      imagesRef.current[index] = img;
      const done = () => {
        if (cancelled) return;
        // The very first frame is what the section opens on, and any frame
        // that arrives after the scroll has already moved past it needs to
        // replace the stale one still showing.
        if (index === 0 || index === drawnRef.current) draw(index);
        else if (drawnRef.current < 0) draw(index);
        loadNext();
      };
      img.onload = done;
      img.onerror = done;
    };

    for (let i = 0; i < LOAD_CONCURRENCY; i++) loadNext();
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(Math.max(drawnRef.current, 0));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // ---- scroll choreography ----------------------------------------------
  const applyProgress = (p: number) => {
    if (reduced) return;
    const frame = Math.min(
      FRAME_COUNT - 1,
      Math.round(ramp(p, 0, FOOTAGE_END) * (FRAME_COUNT - 1))
    );
    if (frame !== drawnRef.current) draw(frame);

    const reveal = revealRef.current;
    if (reveal) {
      // Act one: light floods out from the lamp over the dark footage.
      reveal.setFloor(ramp(p, 0.06, 0.32));
      // Act two: the footage is lighting itself, so the still bows out —
      // early enough that the clip's slow dolly hasn't yet pulled the two
      // versions of the scene out of register.
      reveal.setLayerOpacity(1 - ramp(p, 0.2, 0.4));
    }
    // Tracks the clip's push-in closely enough that the hand-off above
    // reads as a bloom of light rather than a cut between two framings.
    if (revealBoxRef.current) {
      revealBoxRef.current.style.transform = `scale(${1 + p * 0.1})`;
    }

    // The stage gets brighter and busier than white text can hold its own
    // against, so the scrim behind the copy comes up with the lights.
    if (scrimRef.current) {
      scrimRef.current.style.opacity = (ramp(p, 0.12, 0.6) * 0.66).toFixed(3);
    }

    const bands: Array<[number, number]> = [
      [0, 0.34],
      [0.32, 0.66],
      [0.64, 1.01],
    ];
    actsRef.current.forEach((el, i) => {
      if (!el) return;
      const [a, b] = bands[i];
      // The opening act is already on screen before a single pixel has
      // scrolled, so it only fades out; the closing one only fades in, so
      // the call to action is still there when the scroll comes to rest.
      const o =
        i === 0
          ? 1 - ramp(p, b - 0.12, b)
          : i === 2
            ? ramp(p, a, a + 0.12)
            : band(p, a, b);
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translateY(${((1 - o) * 26).toFixed(1)}px)`;
      el.style.filter = o > 0.99 ? "none" : `blur(${((1 - o) * 7).toFixed(1)}px)`;
      el.style.pointerEvents = o > 0.9 ? "auto" : "none";
    });

    chapterRefs.current.forEach((el, i) => {
      if (!el) return;
      const active = p >= bands[i][0] && p < (bands[i][1] ?? 1.01);
      el.dataset.active = String(active);
    });

    if (railRef.current) railRef.current.style.transform = `scaleY(${p})`;
    if (hintRef.current) {
      hintRef.current.style.opacity = (1 - ramp(p, 0, 0.06)).toFixed(3);
    }
  };

  useScrollProgress(rootRef, applyProgress);

  // With motion reduced there is no scrub track, so the stage is presented
  // lit and still. The opening headline and the closing call to action both
  // stay put (only the middle act, which exists purely as a beat between
  // them, is dropped) so the section still works as a hero rather than as a
  // frozen frame of something else.
  //
  // These styles are written out rather than left to the `reduced ? …`
  // props below because the media query only resolves after hydration: the
  // first client render always believes motion is allowed, and the scroll
  // choreography gets one frame to write its opening state over the DOM
  // before the flag flips.
  useEffect(() => {
    if (!reduced) return;
    const statics = [1, 0, 1];
    actsRef.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = String(statics[i]);
      el.style.transform = "none";
      el.style.filter = "none";
      el.style.pointerEvents = statics[i] ? "auto" : "none";
    });
    if (scrimRef.current) scrimRef.current.style.opacity = "0.5";
    if (railRef.current) railRef.current.style.transform = "scaleY(1)";
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-black"
      // The surplus over one viewport is the scrub track: ~2.6 screens of
      // scrolling spread across the clip's three acts.
      style={{ height: reduced ? "100svh" : "360svh" }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-black"
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 z-10 h-full w-full"
        />

        {reduced ? (
          // No canvas, no mask, no 5 MB sequence — just the lit stage.
          <NextImage
            src="/hero/spotlight-reveal.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="z-20 object-cover"
          />
        ) : (
          <div
            ref={revealBoxRef}
            className="absolute inset-0 z-20 origin-center will-change-transform"
          >
            <HeroRevealLayer
              ref={revealRef}
              image="/hero/spotlight-reveal.jpg"
            />
          </div>
        )}

        {/* Keeps the nav and the closing copy legible over the brightest
            frames without flattening the stage in the dark ones. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(to_bottom,rgba(8,4,12,0.72)_0%,transparent_26%,transparent_58%,rgba(8,4,12,0.78)_100%)]"
        />
        {/* Pulled up under the copy by the scroll, in step with the stage
            lights — see applyProgress. Soft-edged so it reads as haze in
            the beam rather than as a panel behind the words. */}
        <div
          ref={scrimRef}
          aria-hidden
          style={reduced ? { opacity: 0.55 } : { opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(ellipse_72%_58%_at_50%_44%,rgba(6,3,10,0.92)_0%,rgba(6,3,10,0.6)_46%,rgba(6,3,10,0)_78%)]"
        />

        {/* Chapter rail */}
        <ol
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-5 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex"
        >
          {CHAPTERS.map((label, i) => (
            <li
              key={label}
              ref={(el) => {
                chapterRefs.current[i] = el;
              }}
              data-active={i === 0}
              className="group flex items-center gap-3 text-[11px] tracking-[0.18em] text-white/45 uppercase transition-colors duration-500 data-[active=true]:text-white"
            >
              <span className="h-px w-5 bg-current transition-all duration-500 group-data-[active=true]:w-10" />
              {String(i + 1).padStart(2, "0")} · {label}
            </li>
          ))}
        </ol>

        {/* Progress rail */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-5 z-40 hidden h-40 w-px -translate-y-1/2 bg-white/20 sm:block"
        >
          <span
            ref={railRef}
            className="block h-full w-full origin-top scale-y-0 bg-accent"
          />
        </div>

        {/* ---- Act 1 ---- */}
        <div
          ref={(el) => {
            actsRef.current[0] = el;
          }}
          className="hero-copy pointer-events-none absolute inset-x-0 top-[16%] z-40 flex flex-col items-center px-5 text-center will-change-transform"
        >
          <h1 className="leading-[0.95] text-white">
            <span
              className="block font-display text-5xl font-normal italic sm:text-7xl md:text-8xl"
              style={{ letterSpacing: "-0.05em" }}
            >
              ΠΑΙΔΙΚΕΣ
            </span>
            <span
              className="-mt-1 block font-display text-5xl font-normal sm:text-7xl md:text-8xl"
              style={{ letterSpacing: "-0.08em" }}
            >
              ΣΤΟΛΕΣ
            </span>
          </h1>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/75">
            Κάθε στολή φτιαγμένη με μεράκι.
          </p>
        </div>

        {/* ---- Act 2 ---- */}
        <div
          ref={(el) => {
            actsRef.current[1] = el;
          }}
          style={{ opacity: 0 }}
          className="hero-copy pointer-events-none absolute inset-x-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center px-6 text-center will-change-transform"
        >
          <h2
            className="font-display text-4xl leading-[1.05] text-white sm:text-6xl md:text-7xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Κάθε στολή,
            <br />
            <span className="italic">μια ιστορία.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
            Από τον ιππότη μέχρι τον δεινόσαυρο — ραμμένες στο χέρι, μία‑μία,
            για να αντέχουν σε κάθε παρέλαση και κάθε πάρτι.
          </p>
        </div>

        {/* ---- Act 3 ---- */}
        <div
          ref={(el) => {
            actsRef.current[2] = el;
          }}
          style={reduced ? undefined : { opacity: 0 }}
          className="hero-copy absolute inset-x-0 bottom-[12%] z-40 flex flex-col items-center px-6 text-center will-change-transform"
        >
          <h2
            className="font-display text-4xl leading-[1.05] text-white sm:text-6xl md:text-7xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Ώρα για το <span className="italic">δικό σου</span> φως.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
            Ανακάλυψε μοναδικές στολές με χαρακτήρα και ποιότητα.
          </p>
          <Link
            href="/catalogue"
            className="mt-7 rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-accent/30 transition-all hover:scale-[1.03] hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/40 active:scale-95"
          >
            Βρες τη στολή σου.
          </Link>
        </div>

        {!reduced && (
          <div
            ref={hintRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-7 z-40 flex flex-col items-center gap-2 text-[11px] tracking-[0.22em] text-white/55 uppercase"
          >
            <span>{isCoarsePointer ? "Κύλησε" : "Φώτισε τη σκηνή"}</span>
            <span className="hero-scroll-cue block h-8 w-px bg-white/40" />
          </div>
        )}
      </div>
    </section>
  );
}
