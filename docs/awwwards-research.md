# Award-Winning Web Experiences: What Wins and How It's Built

Research compiled 2026-09-19. Sources: Awwwards (Sites of the Day / Month / Year listings and individual site pages), the winners' own case studies, Codrops, OFF+BRAND, webgpu.com, Utsubo and hontran.dev. Sources are linked at the bottom.

**How the data was gathered**

- I scraped 306 unique Awwwards winner pages: Sites of the Year, Sites of the Month, the three most recent pages of Sites of the Day, and the GSAP / Three.js / WebGL / Framer Motion / Scrolling tag listings.
- For each site I recorded the score, the tags the *authors themselves declared* (GSAP, Three.js, WebGL, Next.js and so on), and the description.
- I then fetched each live site's HTML and first scripts and pattern-matched the library names.
- **Caveat.** Author-declared tags and the fingerprint hits for GSAP, Lenis, Three.js, Nuxt, Next.js, Webflow, Barba and Swup are reliable. Fingerprint hits for WordPress, Contentful, Vite, React, Cloudflare and Vercel over-match (strings inside bundles), so I ignore them. Older winners (2013–2019, Flash and early WebGL) mostly no longer load, so the stack statistics use the ~93 most recent Sites of the Day only.

---

## 1. The big picture

### 1.1 What the judges score

| Criterion | Weight | What it means in practice |
|---|---|---|
| Design | 40% | Hierarchy, typography, colour, micro-detail, a consistent system |
| Usability | 30% | Navigation clarity, performance, responsive behaviour, accessibility, Core Web Vitals |
| Creativity | 20% | Custom interaction, 3D or immersive elements, sound, concept-driven execution |
| Content | 10% | Real copy, original imagery, content that fits the design |

- Scores of 6.5 and up earn an Honorable Mention. Site of the Day goes to the highest-scoring submissions.
- The recent SOTD scores in my sample land between 7.17 and 7.73.
- Reported benchmarks for winners are LCP under about 1.5s, CLS under about 0.05 and a steady 60fps.
- Usability, not creativity, is what most submissions fail on: slow loads, broken mobile, layout shift.
- Custom code is effectively required. Template-based sites are recognised and marked down.

### 1.2 The winning formula (three recurring points)

1. **Art direction with a point of view.** A concept, not a template.
2. **Directed motion.** Transitions and scroll choreography that carry meaning, and never block reading.
3. **Performance discipline.** Smooth 60fps even on mid-range mobile.

The juror commentary repeats one lesson: WebGL is used for atmosphere, not spectacle. The best sites commit to one idea and execute it well, instead of stacking effects.

---

## 2. What the recent winners are built with (measured)

Sample: 93 recent Sites of the Day.

| Technology | Share of sites | Role |
|---|---|---|
| **Lenis** (smooth scroll) | ~55% | Inertial scrolling; nearly always driven from GSAP's ticker |
| **GSAP** | ~52% (50 declare it in tags) | Timelines, easing, all DOM choreography |
| **ScrollTrigger** (GSAP plugin) | ~49% | Scroll-linked reveals, pinning, scrubbing |
| **SplitText / SplitType / Splitting** | ~48% | Per-line, per-word and per-char text reveals |
| **Webflow** | ~28% | Marketing/agency sites; GSAP layered on top |
| **Three.js** | ~23% (26 declare it; 40 declare WebGL) | 3D scenes, shaders, particles |
| **Next.js** | ~23% | App framework, often with GSAP |
| **Barba.js / Swup** | ~15% / ~9% | Page transitions |
| **Nuxt (Vue)** | ~12% | The second big framework family |
| **Draco / GLTF assets** | ~14% | Compressed 3D models |
| **Lottie** | ~13% | Vector micro-animation |
| Sanity, Prismic | ~6% / ~4% | Headless CMS |
| Astro, Svelte | ~6% / ~4% | Lightweight or content-heavy builds |
| Theatre.js, Rive, Howler (audio) | ~2% each | Choreography, interactive vector, sound |

Most common tags among these winners:

- Animation
- WebGL
- 3D
- Design Agencies
- Clean
- Typography
- Storytelling
- Microinteractions
- Transitions
- Scrolling
- Portfolio

### The de-facto "award stack"

```
Framework   Next.js (React) or Nuxt (Vue), or Webflow for marketing sites
Motion      GSAP + ScrollTrigger (+ SplitText)
Scroll      Lenis, driven by gsap.ticker
Transitions Barba.js / Swup / framework routing with a custom overlay
3D          Three.js (raw, or React Three Fiber), custom GLSL/TSL shaders
Assets      Blender → GLB + Draco, KTX2 textures, baked lighting
CMS         Sanity / Prismic / Contentful / Strapi
Design      Figma (declared on ~17 of 93 winners), then hand-built in code
```

**This repo already has the core of it:** `gsap`, `lenis`, `next` 16 and Tailwind 4. Three.js is the main missing piece if 3D is wanted.

---

## 3. Case studies: how the standouts were made

### 3.1 Igloo Inc (Awwwards Site of the Year; announced in early 2025)

- **Built by:** Abeto with Bureaux.
- **Stack:** Three.js (WebGL), Svelte, GSAP, Houdini, Blender, plus a lot of proprietary tooling.
- **Techniques:**
  - **Procedural crystal growth.** A custom algorithm grows crystals inside a container shape. The ice blocks encasing each project are generated, so new projects need no manual modelling.
  - **Shader-driven UI.** The entire UI is rendered in WebGL. Letter-scramble effects swap SDF texture offsets instead of making the browser re-lay-out DOM text every frame. This is both a performance choice and the aesthetic.
  - **Volume data compression.** A custom VDB-to-browser exporter makes the particle-footer volume data smaller than a typical web image.
- **Takeaway:** procedural generation plus GPU-side text gives a unique look while staying cheap. The team calls this "the boundary between game dev and web dev."

### 3.2 Bruno Simon's Portfolio (Site of the Month / Developer Award)

- **Concept:** a drivable car on a 3D island. Your interactions are the navigation.
- **Stack:**
  - Three.js with TSL (Three.js Shading Language) shaders, using WebGPU when available.
  - Rapier for physics. It was Cannon.js in the earlier version, driven by simplified primitive collision shapes.
  - Everything modelled in Blender.
- **Techniques:**
  - Blender naming conventions and Empties automatically control component behaviour.
  - Camera-facing planes with SDF textures for tree foliage.
  - 78,400 grass blades that loop seamlessly.
  - A "palette technique": colours come from a UV-mapped texture, so merged geometry still has colour variation without vertex colours.
- **Performance:** instancing, frustum culling, ETC1S/UASTC GPU-compressed textures, Draco compression, and mobile quality presets.
- **UX and audio:** the UI is entirely in 3D, with no HTML menu. Commissioned music and spatialised sound. Small shared features: message "whispers", a global cookie counter, a daily leaderboard, and achievements that unlock car skins.
- **His stated lesson:** "Performance is the real constraint on creativity."

### 3.3 Lando Norris (SOTD → SOTM → Site of the Year; by OFF+BRAND)

- **Stack:** Webflow as the platform, with custom GSAP, WebGL/3D and Rive for motion graphics. The awards page tags it WebGL, GSAP and Webflow.
- **Design:**
  - A motion-first system: "speed-inspired animations", sharp transitions, cinematic scrolling.
  - Bold type, vivid accent colours, and 3D used to signal F1 adrenaline while staying personal to the athlete.
  - Optimised asset delivery and lazy-loading.
- **Takeaway:** Webflow is not a ceiling. With custom code on top it can win the top prize. The concept and the motion language did the work.

### 3.4 Trionn (Codrops architecture write-up)

A clean reference for how the pieces fit together:

- **One clock.** `gsap.ticker` drives everything: Three.js rendering, Lenis and Web Audio. Lenis is fed from the ticker, so scroll and ScrollTrigger stay in sync.
- **Shared references, not a global store.** Values such as `scrollProgressRef`, `explodeAmt` and `clickBurst` are combined, for example `explode = max(scroll, hover, burst, intro)`.
- **Gated start.** A `transitionReady` flag holds animations until the page transition ends. Non-critical work goes through `requestIdleCallback`.
- **Raw Three.js instead of React Three Fiber**, for direct render-loop control.
- **Warm up early.** Compile shaders and upload textures before a section is visible, so the cost isn't paid on the first scroll.
- **Scroll-driven rendering.** Some scenes render only on ScrollTrigger updates, not in a continuous loop. Tickers subscribe only while a section is within about one viewport of the screen.
- **Texture-as-timeline.** A 371-frame WebP sequence is scrubbed by normalised scroll.
- **Raycasting** replaces DOM events for hover on 3D objects.
- **Procedural over tweened** for continuous motion such as a wave, so each element can damp independently.
- **Web Audio.** Notes are synthesised live, and an `AnalyserNode` drives visuals such as fog.

### 3.5 Other reference sites (2026, from the research)

| Site | Idea | Technique / lesson |
|---|---|---|
| **Oryzo** (SOTM Apr 2026 + Developer Award; Lusion) | A fictional cork coaster launch | One hero object with real material response, inertial easing and true Z-depth scroll. "Sell one object properly." |
| **IVRESS** | A brand film you scroll through | WebGPURenderer with WebGL fallback, using TSL as one shader codebase for both. |
| **Lacoste Ace Breaker** | Branded brick-breaker game | A micro-game with one core verb beats a hero video for engagement. |
| **Shopify Editions** | Scroll-driven changelog | Each section is a narrative beat. Particle-dispersing type, layered panels. |
| **Hubtown** | Real estate | One glowing 3D monolith with a mouse-reveal. 3D can elevate an unglamorous brand. |
| **Explore Primland** | Resort flythrough | Scroll-driven camera over real terrain with atmospheric fog. |
| **Cartier Watches & Wonders** | A digital pavilion | Six 3D "rooms" navigated by scroll. GLSL, GSAP, Lenis, a Web Audio layer. |
| **By-Kin** | Studio site (SOTD + Developer + FWA + CSSDA) | Next.js, GSAP, Strapi. Editorial type, weighted smooth scroll, transitions that don't call attention to themselves. |
| **Iventions** | Lighting-led 3D story | Three.js and GSAP. WebGL for atmosphere instead of spectacle. |
| **Mat Voyce** | Kinetic typography | GSAP timelines. Type animation that never blocks reading. |
| **Uncommon Studio** | Studio site | GSAP and Next.js. A rhythmic grid, camera-like transitions, and proof a studio site can be fast. |
| **Ponpon Mania** | Illustrated playful world | Nuxt, GSAP and WebGL. Panel-style unusual navigation with parallax and illustration. |

### 3.6 From the recent Awwwards SOTD sample

Sites that show a distinct approach, with the stack detected or declared:

| Site | Score | Stack | Notable |
|---|---|---|---|
| Why Zero | 7.73 | GSAP, ScrollTrigger, Three.js, Draco | Immersive single page with sound and gesture interaction |
| Léo Parpeix portfolio | 7.69 | GSAP, Lenis, Locomotive Scroll, Three.js, Webflow | Experimental designer portfolio, 3D and typography |
| ERA Residence | 7.61 | GSAP, Lenis, Barba, Webflow, Lottie | Luxury real estate, parallax and storytelling |
| The Watch (60fps) | 7.59 | GSAP, Three.js, Svelte | A real-time WebGL luxury watch that reacts to its environment |
| Illoca (Unseen) | 7.44 | GSAP, Lenis, Three.js, Nuxt, Theatre.js | AI design engine for architects, scroll choreographed with Theatre.js |
| Michael Gatt | 7.45 | GSAP, Three.js, Nuxt | Interactive composer portfolio, 404 page as a feature |
| MIU MIU: A House That We Shaped | 7.41 | WebGL, Three.js | Interactive house where you explore objects to see the bag collection |
| USAvionix | 7.41 | Three.js, Next.js, Draco | 3D product story for a technology startup |
| Cipher | 7.38 | GSAP, Lenis, Nuxt | Creative production portfolio built on gesture and interaction |
| Warm & Fuzzy | 7.26 | Lenis, Next.js | Colourful, playful agency identity |

Other patterns from the sample:

- **Mixed stacks are normal.** Webflow-based sites (Trevor Noah, NOTHIN', Paul Kalkbrenner) win with WebGL and GSAP on top.
- **Personality-driven copy and motion** wins (Aardvark Book Club, Decathlon Yestalgia, Warm & Fuzzy).

---

## 4. Techniques catalogue

### 4.1 Motion and scroll

- **Lenis + ScrollTrigger sync.** One ticker: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)`.
- **Text reveals.** Split into lines, words and chars (SplitText / SplitType) and stagger from a mask (`overflow:hidden` + `yPercent`).
- **Pinned storytelling.** ScrollTrigger `pin` + `scrub` for sequences, image-sequence scrubbing (canvas or WebP frames), and horizontal scroll sections.
- **Page transitions.** Barba.js or Swup, or framework routing with a clip-path or overlay wipe. Gate section animations until the transition is done.
- **Clip-path wipes and shader uniforms.** Reveals done in shaders or with `clip-path`, both driven by GSAP.
- **Micro-interactions.** Magnetic buttons, custom cursors, hover state morphs, and fancy 404 pages and footers (both tags appear often).

### 4.2 3D and WebGL

- Three.js, or OGL for a lighter footprint.
- Custom GLSL, or TSL for a WebGL/WebGPU-portable codebase.
- The typical asset pipeline: Blender → GLB → Draco/Meshopt → KTX2 textures, with lighting baked in.
- Particle systems, GPGPU and SDF text.
- DOM ↔ WebGL sync: map DOM elements to planes so images get shader hover and transition effects while the HTML stays accessible.
- Physics: Rapier or Cannon for playful worlds.
- Raycasting for interaction on 3D objects.
- Post-processing (bloom, chromatic aberration, grain) used sparingly.

### 4.3 Performance patterns from winners

- Instancing, frustum culling, baked lighting, and a strict byte budget.
- Shader compile and texture upload before reveal (warm-up).
- Render on demand (scroll-triggered) instead of continuously, and pause off-screen scenes.
- Mobile quality presets and reduced-motion fallbacks.
- Lazy-load heavy 3D chunks behind a lightweight, designed loader.

### 4.4 Design patterns

- Big, confident typography (kinetic type is very common).
- A restrained palette with one accent, or a bold colour-blocked one (the "Colorful" tag is common).
- Grid rhythm, oversized imagery, editorial layouts.
- Unusual navigation (panels, spatial, 3D) that stays usable.
- Sound as an optional layer, off by default with a visible toggle.
- One hero idea per page.

---

## 5. Implications for this project (sakis)

The repo already uses the dominant stack (Next 16, GSAP 3.15, Lenis, Tailwind 4), and recent commits reworked the hero and carousel motion and the dark purple-pink theme. Suggestions that follow from the research:

1. **Confirm Lenis and GSAP share one ticker** (see 4.1). It is the single most common integration mistake and the top source of scroll jank.
2. **Add SplitText-style line and word reveals** for headings. It is on about half of recent winners and cheap to add.
3. **Consider one scoped WebGL moment**, such as a shader on the hero image or a small particle field, instead of a full 3D site. Award sites use 3D for atmosphere. Keep it lazy-loaded so it doesn't hurt LCP.
4. **Add a page-transition layer**, either the view-transitions approach or a GSAP overlay, gated until the new page is ready.
5. **Polish the unglamorous parts**: 404 page, footer, focus states, `prefers-reduced-motion`. Judges reward these and users notice them.
6. **Measure**: aim for LCP under 1.5s, CLS under 0.05, and 60fps on a mid-range phone. Usability is 30% of the score.

Next.js 16 in this repo has breaking changes (see `AGENTS.md`), so check `node_modules/next/dist/docs/` before implementing any of the above.

---

## 6. Further sources to keep exploring

- Awwwards: [Sites of the Day](https://www.awwwards.com/websites/sites_of_the_day/), [Sites of the Month](https://www.awwwards.com/websites/sites_of_the_month/), [Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/), and the tag pages [GSAP](https://www.awwwards.com/websites/gsap-animation/), [Three.js](https://www.awwwards.com/websites/three-js/), [WebGL](https://www.awwwards.com/websites/webgl/), [Framer Motion](https://www.awwwards.com/websites/framer-motion/) and [Scrolling](https://www.awwwards.com/websites/scrolling/)
- Other galleries: [FWA](https://thefwa.com/), [CSS Design Awards](https://www.cssdesignawards.com/), [CSS Winner](https://www.csswinner.com/), [Web Design Awards](https://www.webdesignawards.io/)
- Learning: [Codrops case studies](https://tympanus.net/codrops/tag/case-study/), [Three.js Journey](https://threejs-journey.com/)
- Studios to study: Lusion, Active Theory, Immersive Garden, Locomotive, Unseen Studio, Abeto, OFF+BRAND, Resn, Makemepulse

## Sources

- [Awwwards: Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/) and individual site pages (scraped)
- [Igloo Inc: Crystal Growth Algorithms, Shader-Driven UI, Volume Data (webgpu.com)](https://www.webgpu.com/showcase/igloo-inc-procedural-crystals/)
- [Bruno's Portfolio Case Study (Awwwards)](https://www.awwwards.com/brunos-portfolio-case-study.html)
- [The Architecture Behind Trionn (Codrops, 2026)](https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/)
- [Lando Norris case study (OFF+BRAND)](https://www.itsoffbrand.com/our-work/lando-norris)
- [Award-Winning Web Design: Judging Criteria Decoded (Utsubo)](https://www.utsubo.com/blog/award-winning-website-design-guide)
- [Best Three.js Websites 2026 (Utsubo)](https://www.utsubo.com/blog/best-threejs-websites-2026)
- [10 Best Award-Winning Websites of 2026 (hontran.dev)](https://www.hontran.dev/blog/best-award-winning-websites-2026)
- [Codrops 2026 case studies](https://tympanus.net/codrops/tag/case-study/)
