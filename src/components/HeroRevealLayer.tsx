"use client";

import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SPOTLIGHT_R = 260;
// Exponential time constant (ms) for how fast a painted area fades back to
// dark once the cursor moves on. Roughly: stays bright while fresh, is
// visibly dimmer after ~1 fade window, and is essentially gone after ~3.
const FADE_TAU_MS = 900;

// Where the stage lamp hangs in the artwork, as a fraction of the layer's
// box — the scroll-driven flood of light spreads outward from there rather
// than fading in flatly, so it reads as the spotlight opening up.
const BEAM_ORIGIN = { x: 0.435, y: 0.02 };

export interface HeroRevealLayerHandle {
  /** Paints a new reveal stamp at (x, y) — it fades on its own afterward. */
  paintAt: (x: number, y: number) => void;
  /**
   * A minimum reveal (0..1) re-applied every frame, so unlike `paintAt`
   * stamps it never fades back out. Drives the scroll-linked "lights
   * coming up" flood, which spreads from the lamp and, past ~0.8, covers
   * the whole frame.
   */
  setFloor: (value: number) => void;
  /** Opacity (0..1) of the whole reveal layer. */
  setLayerOpacity: (value: number) => void;
}

const HeroRevealLayer = forwardRef<HeroRevealLayerHandle, { image: string }>(
  function HeroRevealLayer({ image }, ref) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Offscreen — accumulates the spotlight alpha and continuously fades
    // it back out, never attached to the DOM. Kept separate from the
    // visible canvas so compositing the reveal image against it doesn't
    // require re-encoding anything (no toDataURL round trip), which is
    // what previously made the trail stutter instead of gliding.
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const floorRef = useRef(0);

    useEffect(() => {
      maskCanvasRef.current = document.createElement("canvas");
    }, []);

    const drawComposite = () => {
      const canvas = canvasRef.current;
      const mask = maskCanvasRef.current;
      const img = imgRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !mask || !img || !img.complete || !img.naturalWidth)
        return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Replicates object-fit: cover for the drawImage call.
      const scale = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      ctx.drawImage(
        img,
        (canvas.width - drawW) / 2,
        (canvas.height - drawH) / 2,
        drawW,
        drawH
      );

      // Keeps only the image pixels under wherever the mask has been
      // painted opaque — the accumulated spotlight trail.
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    };

    // Sized to this layer's own box (not the window) so the mask's coordinate
    // space always matches wherever this component ends up on the page.
    useEffect(() => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;

      const resize = () => {
        const mask = maskCanvasRef.current;
        const newWidth = wrapper.clientWidth;
        const newHeight = wrapper.clientHeight;

        // Resizing a canvas always wipes its pixels, and on mobile this
        // ResizeObserver fires constantly as the browser chrome (address
        // bar) hides/shows during scroll — since the hero is 100dvh, that
        // alone used to blank the accumulated spotlight trail on every
        // scroll tick, flashing the reveal image back to black. Snapshot
        // the mask first and stretch it back in so the trail survives.
        if (mask && mask.width > 0 && mask.height > 0) {
          const snapshot = document.createElement("canvas");
          snapshot.width = mask.width;
          snapshot.height = mask.height;
          snapshot.getContext("2d")?.drawImage(mask, 0, 0);

          mask.width = newWidth;
          mask.height = newHeight;
          mask.getContext("2d")?.drawImage(snapshot, 0, 0, newWidth, newHeight);
        } else if (mask) {
          mask.width = newWidth;
          mask.height = newHeight;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        drawComposite();
      };
      resize();

      const observer = new ResizeObserver(resize);
      observer.observe(wrapper);
      return () => observer.disconnect();
    }, []);

    // Runs for as long as the layer is mounted, independent of pointer
    // activity, so the mask keeps fading back to dark even after the
    // cursor stops moving (and the display canvas keeps repainting to
    // show that fade).
    useEffect(() => {
      let rafId: number;
      let last = performance.now();

      const tick = (now: number) => {
        // Capped so a backgrounded tab doesn't erase the whole mask in
        // one jump when it regains focus.
        const dt = Math.min(now - last, 100);
        last = now;

        const mask = maskCanvasRef.current;
        const maskCtx = mask?.getContext("2d");
        if (mask && maskCtx) {
          const eraseAlpha = 1 - Math.exp(-dt / FADE_TAU_MS);
          maskCtx.save();
          maskCtx.globalCompositeOperation = "destination-out";
          maskCtx.fillStyle = `rgba(0,0,0,${eraseAlpha})`;
          maskCtx.fillRect(0, 0, mask.width, mask.height);
          maskCtx.restore();

          // Re-stamped after the erase (never before it) so the floor is
          // immune to the fade while the cursor trail above it still
          // decays normally.
          const floor = floorRef.current;
          if (floor > 0) {
            const cx = mask.width * BEAM_ORIGIN.x;
            const cy = mask.height * BEAM_ORIGIN.y;
            const maxR = Math.hypot(mask.width, mask.height) * 1.5;
            // Eased so the light creeps out slowly at first and then
            // rushes over the frame, like a lamp being brought up.
            const radius = Math.max(1, floor * floor * maxR);
            const gradient = maskCtx.createRadialGradient(
              cx,
              cy,
              0,
              cx,
              cy,
              radius
            );
            gradient.addColorStop(0, "rgba(255,255,255,1)");
            gradient.addColorStop(0.65, "rgba(255,255,255,1)");
            gradient.addColorStop(0.85, "rgba(255,255,255,0.5)");
            gradient.addColorStop(1, "rgba(255,255,255,0)");
            maskCtx.fillStyle = gradient;
            maskCtx.fillRect(0, 0, mask.width, mask.height);

            // The flood alone leaves the far corners short of a full
            // reveal, so the tail of the scroll tops the whole frame up.
            const flat = Math.min(Math.max((floor - 0.75) / 0.25, 0), 1);
            if (flat > 0) {
              maskCtx.fillStyle = `rgba(255,255,255,${flat})`;
              maskCtx.fillRect(0, 0, mask.width, mask.height);
            }
          }
        }

        drawComposite();
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      return () => cancelAnimationFrame(rafId);
    }, []);

    useImperativeHandle(ref, () => ({
      // Adds a fresh stamp on top of whatever's already painted — the
      // fade loop above is what makes it recede again once the cursor
      // stops revisiting this spot.
      paintAt(x: number, y: number) {
        const mask = maskCanvasRef.current;
        const maskCtx = mask?.getContext("2d");
        if (!mask || !maskCtx) return;

        const gradient = maskCtx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          SPOTLIGHT_R
        );
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(0.4, "rgba(255,255,255,1)");
        gradient.addColorStop(0.6, "rgba(255,255,255,0.75)");
        gradient.addColorStop(0.75, "rgba(255,255,255,0.4)");
        gradient.addColorStop(0.88, "rgba(255,255,255,0.12)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        maskCtx.fillStyle = gradient;
        maskCtx.beginPath();
        maskCtx.arc(x, y, SPOTLIGHT_R, 0, Math.PI * 2);
        maskCtx.fill();
        // No immediate redraw needed — the fade loop above repaints every
        // frame anyway and will pick this stamp up on the next tick.
      },

      setFloor(value: number) {
        floorRef.current = Math.min(Math.max(value, 0), 1);
      },

      setLayerOpacity(value: number) {
        const wrapper = wrapperRef.current;
        if (wrapper) wrapper.style.opacity = String(value);
      },
    }));

    return (
      <div
        ref={wrapperRef}
        className="pointer-events-none absolute inset-0 z-30"
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <Image
          ref={imgRef}
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden"
          onLoad={drawComposite}
        />
      </div>
    );
  }
);

export default HeroRevealLayer;
