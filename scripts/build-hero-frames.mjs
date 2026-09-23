#!/usr/bin/env node
/**
 * Slices the hero's cinematic clip into the scroll-scrubbed frame sequence
 * the homepage canvas plays back (public/hero/frames), plus the lit
 * still the carousel below it uses as its stage backdrop.
 *
 * The clip itself (content/hero-clips/stage-lights.mp4) was generated with
 * Higgsfield from public/hero/spotlight-base.jpg as the start frame and
 * public/hero/spotlight-reveal.jpg as the end frame, which is why the
 * sequence lands exactly on the two stills the torch reveal cross-fades
 * between — scrub and reveal stay in the same scene throughout.
 *
 * Re-run after replacing the clip:  node scripts/build-hero-frames.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLIP = path.join(ROOT, "content/hero-clips/stage-lights.mp4");
const FRAMES_DIR = path.join(ROOT, "public/hero/frames");

// Enough frames to read as motion under a slow scrub without shipping a
// video's worth of bytes: ~110 WebP stills at ~40 kB each.
const TARGET_FRAMES = 110;
const FRAME_WIDTH = 1400;
const QUALITY = 74;

const ffmpeg = (args) =>
  execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

if (!existsSync(CLIP)) {
  console.error(`✗ missing clip: ${path.relative(ROOT, CLIP)}`);
  process.exit(1);
}

const duration = Number(
  execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1",
    CLIP,
  ]).toString().trim()
);

rmSync(FRAMES_DIR, { recursive: true, force: true });
mkdirSync(FRAMES_DIR, { recursive: true });

// Resampling to an even rate rather than taking every source frame keeps
// the count predictable however long the clip is.
const fps = (TARGET_FRAMES / duration).toFixed(4);

ffmpeg([
  "-i", CLIP,
  "-vf", `fps=${fps},scale=${FRAME_WIDTH}:-2:flags=lanczos`,
  "-c:v", "libwebp",
  "-quality", String(QUALITY),
  "-compression_level", "6",
  // Without this the WebP muxer collects every frame into one animated
  // file instead of writing the numbered stills the canvas needs.
  "-f", "image2",
  path.join(FRAMES_DIR, "frame_%04d.webp"),
]);

// The final frame doubles as the carousel's backdrop, so the section below
// the hero opens on exactly the stage the hero scroll left behind.
ffmpeg([
  "-sseof", "-0.1",
  "-i", CLIP,
  "-frames:v", "1",
  "-vf", `scale=1920:-2:flags=lanczos`,
  "-quality", "80",
  path.join(ROOT, "public/bg/stage-lit.webp"),
]);

const count = readdirSync(FRAMES_DIR).filter((f) => f.endsWith(".webp")).length;
console.log(`✓ ${count} frames -> public/hero/frames (${duration.toFixed(2)}s clip)`);
console.log(`  update HERO_FRAME_COUNT in src/components/HeroCinematic.tsx to ${count}`);
