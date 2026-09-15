"use client";

import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SPOTLIGHT_R = 260;

export interface HeroRevealLayerHandle {
  /** Paints a new reveal stamp at (x, y) — additive, never erases earlier stamps. */
  paintAt: (x: number, y: number) => void;
}

const HeroRevealLayer = forwardRef<HeroRevealLayerHandle, { image: string }>(
  function HeroRevealLayer({ image }, ref) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Offscreen — accumulates the spotlight alpha, never cleared, never
    // attached to the DOM. Kept separate from the visible canvas so
    // compositing the reveal image against it doesn't require re-encoding
    // anything (no toDataURL round trip), which is what previously made
    // the trail stutter instead of gliding.
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

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
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
        if (mask) {
          mask.width = wrapper.clientWidth;
          mask.height = wrapper.clientHeight;
        }
        drawComposite();
      };
      resize();

      const observer = new ResizeObserver(resize);
      observer.observe(wrapper);
      return () => observer.disconnect();
    }, []);

    useImperativeHandle(ref, () => ({
      // Never clears the mask — each stamp adds to whatever's already
      // painted, so the reveal only ever grows: once an area is revealed it
      // stays revealed, like scratching a scratch card.
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

        drawComposite();
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
