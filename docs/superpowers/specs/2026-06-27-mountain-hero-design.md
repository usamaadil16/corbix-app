# Mountain Parallax Hero — Design Spec

Date: 2026-06-27
Status: Superseded by the "3D Mountain World" revision below (see end of doc)

> **Revision note:** The flat layered-SVG parallax hero described in this document
> was built first, then replaced at the user's request with a 3D scroll-jacked
> mountain world. The original spec is kept for history; the authoritative current
> design is the **3D Mountain World Revision** section at the bottom.

## Summary

Replace the homepage's 3D golden brick tunnel hero with a fullscreen, layered
SVG mountain-ridge hero that uses CSS/GSAP parallax. The scroll-jacked "flight"
journey is retired; the homepage becomes a normal vertical scroll: mountain hero
at the top, then Brand → Vision → Services → Closing as stacked sections with
simple on-scroll reveals.

The Lenis + GSAP-ticker smooth-scroll setup (`components/public/SmoothScroll.tsx`,
wrapping the `(public)` layout) is unchanged.

## Goals

- Premium, depth-rich fullscreen hero built from layered SVG ridge silhouettes.
- Scroll-driven parallax: back layers move slowest, front layers fastest.
- Hero text animates in from below on initial load.
- Respect existing CMS-driven copy and the brand accent.
- Graceful mobile and reduced-motion behavior.

## Non-goals

- Redesigning the Brand/Vision/Services/Closing sections (kept as-is, restyled
  only as needed to flow as normal stacked sections).
- Changing the smooth-scroll/Lenis setup.
- Changing the admin panel or CMS schema.

## Decisions (from brainstorming)

- **Placement:** Mountain hero replaces the 3D brick hero on the homepage.
- **Scope:** Keep all existing content; hero on top, Brand/Vision/Services/Closing
  flow below as normal stacked scrolling sections.
- **Copy:** CMS-editable hero headline/slogan via `getPageContent("home")`. The
  fallback default headline becomes "We build the future of real estate".
- **Aesthetic:** Grayscale ridges + a subtle **gold** horizon glow and a dark sky
  gradient behind them.
- **Mobile/reduced-motion:** Mobile keeps parallax with reduced travel; users with
  `prefers-reduced-motion` get fully static ridges and no text animation.
- **BrickWorld:** `BrickWorld.tsx` and all 3D brick/flight code are deleted.

## Components

### `components/public/home/MountainHero.tsx` (new, client component)

Fullscreen hero (`min-h-screen`, `relative`, `overflow-hidden`). Layer stack,
back to front:

1. **Sky** — near-black vertical gradient background.
2. **Gold horizon glow** — a soft, low-opacity radial gold glow positioned just
   above the ridgeline (the brand accent atmosphere).
3. **5 SVG ridge layers** — absolutely positioned, full-width, anchored to the
   bottom; each a single organic bezier ridge (`<path>` with smooth `C` curves),
   increasing in height toward the front.
4. **Hero content** — eyebrow ("Corbrix"), headline, slogan, and CTA, vertically
   centered, above all ridges.

Props: `{ heroHeadline: string; slogan: string }` (passed from `HomeExperience`).

Animations are registered in a `useEffect` scoped with `gsap.context(el)` and torn
down via `ctx.revert()`.

#### Ridge shades (depth)

Distant ridges slightly lighter, nearer ridges darker, so depth reads against the
dark sky. Back → front: `#2a2a2a → #222 → #1a1a1a → #161616 → #111`. (Exact values
tuned during implementation; the family stays within the specified palette.)

#### Parallax (scrub)

A single `ScrollTrigger` on the hero root:

```
trigger: hero section
start: "top top"
end: "bottom top"
scrub: true
```

Each layer animates `y` from `0` to a different negative value (px), back→front,
fastest in front. Desktop targets:

| Layer | Position | y travel |
|-------|----------|----------|
| 1 | back     | -80  |
| 2 |          | -140 |
| 3 |          | -200 |
| 4 |          | -300 |
| 5 | front    | -360 |

#### Text entrance (on load)

`gsap.from` on the eyebrow, headline, slogan, and CTA:
`{ y: 60, opacity: 0, stagger: 0.15, ease: "power3.out", duration: 0.9 }`. Plays
once on mount.

#### Responsive / reduced-motion (`gsap.matchMedia`)

- `(min-width: 768px) and (prefers-reduced-motion: no-preference)`: full parallax
  travel + text entrance.
- `(max-width: 767px) and (prefers-reduced-motion: no-preference)`: parallax with
  travel distances reduced (~50%) + text entrance.
- `(prefers-reduced-motion: reduce)`: no parallax, no text animation; ridges and
  text render in their final state.

### `components/public/home/HomeExperience.tsx` (rewrite)

- Remove flight mode, `JOURNEY_SCREENS`, `journeyRef`/`stageRef`, the scrub panel
  timeline, and the `BrickWorld` import/usage.
- Render `<MountainHero heroHeadline=... slogan=... />` first.
- Render Brand, Vision, Services, Closing as stacked `<section>`s.
- Apply simple on-scroll reveals (reuse existing static-fallback logic):
  - Each section: `gsap.from(node, { y: 28, opacity: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: node, start: "top 85%" } })`.
  - Service cards: staggered reveal triggered by the services section.
- Keep `prefers-reduced-motion` guard so reveals are skipped when reduced.

### `components/public/home/BrickWorld.tsx` (delete)

Removed entirely along with its 3D brick/particle/flight logic.

### `app/(public)/page.tsx` (edit)

Update only the hero headline fallback default to
"We build the future of real estate". Data flow and props otherwise unchanged.
`HomeExperience` continues to receive `heroHeadline`, `slogan`, `brandTitle`,
`brandStory`, `vision`, `services`.

## Data flow

`HomePage` (server) → `getPageContent("home")` / `getServices()` →
`HomeExperience` (client) → `MountainHero` receives `heroHeadline` + `slogan`;
remaining sections receive their existing props.

## Error handling / edge cases

- Missing CMS values fall back to defaults (existing `asText` helper).
- SSR safety: all GSAP/window access inside `useEffect`; component renders valid
  static markup without JS (ridges + text visible), so no-JS users still see the
  hero.
- `ScrollTrigger.refresh()` is handled implicitly by context setup; layers use
  transforms only (no layout thrash).

## Testing & verification

- **Unit (Vitest + Testing Library):** `MountainHero` renders the provided
  headline and slogan, and renders all 5 ridge layers (via `data-testid`).
- **Build/lint:** `npm run build` and `eslint` pass.
- **Manual:** scroll check on desktop (parallax depth), mobile (reduced travel),
  and with reduced-motion enabled (static).

## Risks

- Parallax travel values may need visual tuning; treated as constants, easy to
  adjust.
- Removing `BrickWorld` is irreversible in-tree, but recoverable via git history.

---

# 3D Mountain World Revision (authoritative)

Date: 2026-06-27

The flat SVG hero was replaced with a 3D scroll-jacked journey themed as a
mountain canyon, conceptually identical to the retired brick tunnel but with new
art direction.

## Decisions

- **Structure:** Full scroll-jacked journey. The camera flies forward through the
  3D scene while Hero → Brand → Vision → Services → Closing panels fade in/out as
  HTML overlays (same mechanic as the old brick tunnel).
- **Camera path:** Fly forward down a canyon/valley between mountain ridges toward
  a large glowing **yellow cube** floating at the far center; the camera approaches
  it as scroll progresses.
- **Mountain style:** Stylized **low-poly faceted peaks** (dark grayscale,
  `#2a2c33`) with a warm **gold** key light for rim lighting; a cool blue fill rim.
- **Particles:** ~700 golden additive-blended points drifting through the canyon.
- **Atmosphere:** Scene fog (`#05060a`, near 24 / far 130) so the yellow cube
  emerges from the mist as the camera nears it.
- **Fallback:** On mobile (`<768px`) and `prefers-reduced-motion`, no WebGL — the
  page falls back to the flat `MountainHero` (SVG) + stacked Brand/Vision/Services/
  Closing sections.

## Components

- `components/public/home/MountainWorld.tsx` (new) — Three.js scene: ground plane,
  two canyon walls of low-poly `ConeGeometry` peaks, the emissive yellow
  `BoxGeometry` cube + a pulsing point light, a golden `Points` particle field,
  and a render loop. A `ScrollTrigger` on `[data-journey]` (`scrub`) drives a
  `progress` value; the camera `z` lerps from `60` → `-102` toward the cube at
  `z = -120`, always looking at the cube. Mounted only in flight mode; guards
  against missing WebGL so it no-ops in jsdom. Rendered as a `fixed inset-0 z-0`
  canvas behind the panels.
- `components/public/home/HomeExperience.tsx` (rewrite) — restores flight mode:
  when `flight` (desktop + motion-OK) renders `<MountainWorld/>` plus the sticky
  panel stage over a `JOURNEY_SCREENS * 100vh` (`7`) tall `[data-journey]` section,
  with the scrubbed panel timeline (services panel dwells longer, cards stagger,
  `services` label for the Explore-Services jump). Otherwise renders the static
  `MountainHero` + stacked sections.
- `components/public/home/MountainHero.tsx` — retained as the static/mobile/
  reduced-motion fallback hero.

## Tech stack delta

Re-introduces `three` for the homepage (it was already a dependency, still used by
`ParticleHero.tsx`). GSAP ScrollTrigger + Lenis unchanged.

## Verification

- `tsc --noEmit` clean; `npm run build` succeeds (home route `/` compiles).
- WebGL guard keeps the existing jsdom render tests valid (they exercise the static
  fallback, where `MountainWorld` is not mounted).
- Manual: desktop fly-through (camera approaches glowing cube, panels sequence,
  particles drift), mobile + reduced-motion fall back to the flat hero.

## Revision 2 — cube gateway + rounded valley + trail

- **Cube first:** the yellow cube sits in front of the valley (`z = 18`). The first
  `25%` of scroll approaches it; the cube **scales up** and the camera **flies
  through it** (emissive flash from inside). The remaining scroll travels the valley
  (`z = 10 → -210`) where the content panels appear (hero lingers through the cube
  entry, then brand/vision/services/closing sequence in the valley).
- **Rounded mountains:** pointy `ConeGeometry` peaks replaced with smooth-shaded
  `SphereGeometry` domes (half-buried) for rolling, rounded hills.
- **Guiding trail:** a glowing `CatmullRomCurve3` + `TubeGeometry` line winds down
  the valley floor, with ~140 gold particles flowing forward along it.
