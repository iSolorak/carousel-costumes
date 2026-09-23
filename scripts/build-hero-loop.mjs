#!/usr/bin/env node
/**
 * Turns the hero's confetti clip into a seamlessly looping background
 * video for the closing act of the homepage scroll.
 *
 * The clip (content/hero-clips/confetti-loop-src.mp4) was generated with
 * Higgsfield from public/hero/spotlight-reveal.jpg as the start frame with
 * a locked-off camera, so it opens on exactly the stage the frame scrub
 * ends on — only the confetti moves.
 *
 * A generated clip's last frame never matches its first, so playing it on
 * `loop` would visibly hitch once a cycle. This rebuilds it as a true loop:
 *
 *   out(t) = crossfade(src(L + t) -> src(t))   for t < C   (the seam)
 *   out(t) = src(t)                            for t >= C
 *
 * with L = D - C the output length. The wrap from out(L) back to out(0)
 * then lands on src(L), which is exactly where src(L⁻) was heading, and
 * the join at t = C is already pure src(C). Both seams are continuous, and
 * the crossfade itself is hidden by the fact that tumbling confetti has no
 * fixed shape to mismatch.
 *
 * Re-run after replacing the clip:  node scripts/build-hero-loop.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLIP = path.join(ROOT, "content/hero-clips/confetti-loop-src.mp4");
const OUT_MP4 = path.join(ROOT, "public/hero/confetti-loop.mp4");
const OUT_WEBM = path.join(ROOT, "public/hero/confetti-loop.webm");

// Length of the crossfade that hides the seam. The clip's confetti thins
// out over its run, so the blend has a density difference to cover as well
// as a position one — generous is better, and overlapping two fields of
// tumbling specks is invisible in a way that overlapping anything with a
// fixed silhouette would not be.
const CROSSFADE = 1.4;
const WIDTH = 1440;

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

const C = CROSSFADE;
const L = duration - C;
if (L <= C) {
  console.error(`✗ clip too short (${duration}s) for a ${C}s crossfade`);
  process.exit(1);
}

const filter = [
  `[0:v]scale=${WIDTH}:-2:flags=lanczos,fps=24,split=3[a][b][c]`,
  `[a]trim=${L}:${duration},setpts=PTS-STARTPTS[tail]`,
  `[b]trim=0:${C},setpts=PTS-STARTPTS[head]`,
  `[c]trim=${C}:${L},setpts=PTS-STARTPTS[rest]`,
  // A is the tail, B is the head: start on the tail, arrive on the head.
  `[tail][head]blend=all_expr='A*(1-(T/${C}))+B*(T/${C})'[seam]`,
  `[seam][rest]concat=n=2:v=1[out]`,
].join(";");

const encode = (args, out) =>
  execFileSync(
    "ffmpeg",
    ["-v", "error", "-y", "-i", CLIP, "-filter_complex", filter, "-map", "[out]", "-an", ...args, out],
    { stdio: "inherit" }
  );

encode(
  ["-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "25", "-preset", "slow", "-movflags", "+faststart"],
  OUT_MP4
);
encode(
  ["-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2"],
  OUT_WEBM
);

const kb = (p) => (statSync(p).size / 1024).toFixed(0) + " kB";
console.log(`✓ ${L.toFixed(2)}s seamless loop from a ${duration.toFixed(2)}s clip`);
console.log(`  mp4  ${kb(OUT_MP4)}`);
console.log(`  webm ${kb(OUT_WEBM)}`);
