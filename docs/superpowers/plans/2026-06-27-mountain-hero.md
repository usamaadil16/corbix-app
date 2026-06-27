# Mountain Parallax Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's 3D golden brick tunnel hero with a fullscreen, layered SVG mountain-ridge hero using GSAP parallax, and flatten the homepage into normal stacked scrolling sections.

**Architecture:** A new client component `MountainHero` renders a dark sky, a gold horizon glow, 5 absolutely-positioned SVG ridge layers, and centered CMS-driven hero text. GSAP ScrollTrigger scrubs each ridge layer's `y` at a different speed; a `gsap.from` plays the text entrance on mount. `HomeExperience` is rewritten to render the hero followed by Brand/Vision/Services/Closing as stacked sections with simple on-scroll reveals; `BrickWorld` is deleted.

**Tech Stack:** Next.js 16 (App Router), React 19, GSAP 3 + ScrollTrigger, Lenis (existing smooth-scroll), Tailwind CSS v4, Vitest + Testing Library.

## Global Constraints

- Smooth-scroll setup (`components/public/SmoothScroll.tsx`, Lenis + GSAP ticker, wrapping `(public)` layout) MUST remain unchanged.
- Hero copy stays CMS-editable via `getPageContent("home")`; fallback default headline is exactly `We build the future of real estate`.
- Accent atmosphere is **gold**; ridges are grayscale within the `#2a2a2a → #111` family.
- All `window`/GSAP access happens inside `useEffect`; components render valid static markup without JS.
- Reduced-motion (`prefers-reduced-motion: reduce`): no parallax, no text animation — final state rendered.
- Mobile keeps parallax with travel reduced ~50%.
- GSAP effects scoped with `gsap.context(el)` and torn down via `ctx.revert()`.

---

### Task 1: `MountainHero` component

**Files:**
- Create: `corbix-app/components/public/home/MountainHero.tsx`
- Modify: `corbix-app/vitest.config.ts` (include `.test.tsx`)
- Test: `corbix-app/__tests__/home/mountain-hero.test.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `MountainHero({ heroHeadline: string; slogan: string }): JSX.Element`. Renders `[data-testid="mountain-hero"]`, five ridges `[data-testid="ridge-1..5"]` each with `[data-layer="1..5"]`, and text nodes marked `[data-hero-text]`.

- [ ] **Step 1: Widen vitest include to allow component tests**

In `corbix-app/vitest.config.ts` change the include line:

```ts
    include: ["__tests__/**/*.test.{ts,tsx}"],
```

- [ ] **Step 2: Write the failing test**

Create `corbix-app/__tests__/home/mountain-hero.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MountainHero } from "@/components/public/home/MountainHero";

describe("MountainHero", () => {
  it("renders the headline and slogan", () => {
    render(
      <MountainHero
        heroHeadline="We build the future of real estate"
        slogan="Your single unified partner for local growth and global expansion."
      />,
    );
    expect(
      screen.getByText("We build the future of real estate"),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Your single unified partner for local growth and global expansion.",
      ),
    ).toBeTruthy();
  });

  it("renders five stacked ridge layers", () => {
    render(<MountainHero heroHeadline="x" slogan="y" />);
    for (let i = 1; i <= 5; i += 1) {
      expect(screen.getByTestId(`ridge-${i}`)).toBeTruthy();
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd corbix-app; npx vitest run __tests__/home/mountain-hero.test.tsx`
Expected: FAIL — cannot resolve `@/components/public/home/MountainHero`.

- [ ] **Step 4: Implement the component**

Create `corbix-app/components/public/home/MountainHero.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MountainHeroProps = {
  heroHeadline: string;
  slogan: string;
};

const LAYERS = [
  { id: 1, fill: "#2a2a2a", travel: -80, d: "M0,270 C240,250 480,265 720,245 C960,225 1200,255 1440,240 L1440,320 L0,320 Z" },
  { id: 2, fill: "#222222", travel: -140, d: "M0,255 C220,230 470,255 720,225 C970,200 1210,240 1440,225 L1440,320 L0,320 Z" },
  { id: 3, fill: "#1a1a1a", travel: -200, d: "M0,235 C260,205 520,245 760,205 C1000,170 1220,225 1440,205 L1440,320 L0,320 Z" },
  { id: 4, fill: "#161616", travel: -300, d: "M0,210 C230,175 470,225 720,180 C980,140 1240,205 1440,180 L1440,320 L0,320 Z" },
  { id: 5, fill: "#111111", travel: -360, d: "M0,185 C240,150 500,205 760,160 C1020,120 1260,185 1440,160 L1440,320 L0,320 Z" },
] as const;

export function MountainHero({ heroHeadline, slogan }: MountainHeroProps) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // jsdom has no matchMedia; bail so render tests stay animation-free.
    if (typeof window.matchMedia !== "function") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      const buildParallax = (scale: number) => {
        gsap.from("[data-hero-text]", {
          y: 60,
          opacity: 0,
          stagger: 0.15,
          ease: "power3.out",
          duration: 0.9,
        });
        LAYERS.forEach((layer) => {
          gsap.to(`[data-layer='${layer.id}']`, {
            y: layer.travel * scale,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      };

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => buildParallax(1),
      );
      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => buildParallax(0.5),
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-testid="mountain-hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#05050a] via-[#0a0a12] to-[#0d0d14]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[30%] h-72 bg-[radial-gradient(ellipse_55%_100%_at_50%_100%,rgba(255,184,77,0.20),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#0b0b10]" />

      {LAYERS.map((layer) => (
        <svg
          key={layer.id}
          data-layer={layer.id}
          data-testid={`ridge-${layer.id}`}
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[65vh] w-full"
          aria-hidden="true"
        >
          <path d={layer.d} fill={layer.fill} />
        </svg>
      ))}

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 text-center">
        <p
          data-hero-text
          className="text-xs uppercase tracking-[0.3em] text-muted"
        >
          Corbrix
        </p>
        <h1
          data-hero-text
          className="mt-4 font-display text-5xl leading-[1.05] text-white md:text-8xl"
        >
          {heroHeadline}
        </h1>
        <p
          data-hero-text
          className="mx-auto mt-6 max-w-2xl text-lg text-muted"
        >
          {slogan}
        </p>
        <div data-hero-text className="mt-10">
          <Link
            href="#services"
            className="inline-flex w-fit rounded-lg border border-accent/40 px-5 py-2.5 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd corbix-app; npx vitest run __tests__/home/mountain-hero.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add corbix-app/components/public/home/MountainHero.tsx corbix-app/__tests__/home/mountain-hero.test.tsx corbix-app/vitest.config.ts
git commit -m "feat: add layered SVG mountain parallax hero component"
```

---

### Task 2: Rewrite `HomeExperience` + retire `BrickWorld`

**Files:**
- Modify: `corbix-app/components/public/home/HomeExperience.tsx`
- Modify: `corbix-app/app/(public)/page.tsx`
- Delete: `corbix-app/components/public/home/BrickWorld.tsx`
- Test: `corbix-app/__tests__/home/home-experience.test.tsx`

**Interfaces:**
- Consumes: `MountainHero({ heroHeadline, slogan })` from Task 1; `getServiceHref(service)` from `lib/cms/get-services`.
- Produces: `HomeExperience({ heroHeadline, slogan, brandTitle, brandStory, vision, services }): JSX.Element` rendering the hero plus sections containing the texts `Services Hub` and each `service.title`.

- [ ] **Step 1: Write the failing test**

Create `corbix-app/__tests__/home/home-experience.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HomeExperience } from "@/components/public/home/HomeExperience";
import type { Service } from "@/types/database";

const services: Service[] = [
  {
    id: "1",
    slug: "market-entry",
    title: "Market Entry",
    description: "Land and expand in new markets.",
    visible: true,
    has_page: true,
    sort_order: 1,
  },
];

describe("HomeExperience", () => {
  it("renders the mountain hero headline and stacked sections", () => {
    render(
      <HomeExperience
        heroHeadline="We build the future of real estate"
        slogan="One partner."
        brandTitle="COR / BRIX"
        brandStory="Core trust and building blocks."
        vision="Where we are headed."
        services={services}
      />,
    );
    expect(
      screen.getByText("We build the future of real estate"),
    ).toBeTruthy();
    expect(screen.getByText("Services Hub")).toBeTruthy();
    expect(screen.getByText("Market Entry")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd corbix-app; npx vitest run __tests__/home/home-experience.test.tsx`
Expected: FAIL — `HomeExperience` still references `BrickWorld`/flight markup and does not render `MountainHero` (headline assertion fails or import error).

- [ ] **Step 3: Rewrite `HomeExperience`**

Replace the entire contents of `corbix-app/components/public/home/HomeExperience.tsx` with:

```tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MountainHero } from "@/components/public/home/MountainHero";
import { getServiceHref } from "@/lib/cms/get-services";
import type { Service } from "@/types/database";

type HomeExperienceProps = {
  heroHeadline: string;
  slogan: string;
  brandTitle: string;
  brandStory: string;
  vision: string;
  services: Service[];
};

export function HomeExperience({
  heroHeadline,
  slogan,
  brandTitle,
  brandStory,
  vision,
  services,
}: HomeExperienceProps) {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-section]").forEach((node) => {
        gsap.from(node, {
          y: 28,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: node, start: "top 85%" },
        });
      });
      gsap.from("[data-card]", {
        y: 50,
        opacity: 0,
        scale: 0.97,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: "[data-section='services']", start: "top 80%" },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative z-10">
      <MountainHero heroHeadline={heroHeadline} slogan={slogan} />

      <section data-section="brand" className="py-24">
        <div className="mx-auto w-full max-w-6xl px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">
            Our Blueprint
          </p>
          <h2 className="mt-4 font-display text-4xl text-white md:text-6xl">
            {brandTitle}
          </h2>
          <p className="mt-6 max-w-3xl text-base text-muted md:text-lg">
            {brandStory}
          </p>
        </div>
      </section>

      <section data-section="vision" className="py-24">
        <div className="mx-auto w-full max-w-6xl px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Vision</p>
          <h2 className="mt-4 font-display text-4xl text-white md:text-6xl">
            Where We Are Headed
          </h2>
          <p className="mt-6 max-w-3xl text-muted md:text-lg">{vision}</p>
        </div>
      </section>

      <section data-section="services" id="services" className="py-24">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-4xl text-white">Services Hub</h2>
            <p className="max-w-xl text-sm text-muted">
              Six flagship execution tracks and five specialist extensions under
              one strategic operating model.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.slug}
                data-card
                className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-surface/80 p-4 backdrop-blur transition-colors hover:border-accent/40"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {service.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-xs text-muted">
                    {service.description}
                  </p>
                </div>
                <Link
                  href={getServiceHref(service)}
                  className="mt-4 text-xs font-semibold text-accent hover:text-accent/80"
                >
                  Explore Service
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="closing" className="py-24">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="rounded-2xl border border-white/10 bg-surface/80 p-8 backdrop-blur md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="max-w-md space-y-4">
                <h2 className="font-display text-4xl text-white md:text-5xl">
                  Let&apos;s build your future together
                </h2>
                <p className="text-muted">
                  Corbrix unifies market strategy, trade execution, and global
                  mobility under one trusted team.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
                >
                  Start a Conversation
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-white">Quick Links</p>
                  <Link href="/about" className="block text-muted hover:text-white">
                    About
                  </Link>
                  <Link
                    href="/case-studies"
                    className="block text-muted hover:text-white"
                  >
                    Case Studies
                  </Link>
                  <Link
                    href="/careers"
                    className="block text-muted hover:text-white"
                  >
                    Careers
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-muted hover:text-white"
                  >
                    Contact
                  </Link>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-white">Contact</p>
                  <p className="text-muted">hello@corbrix.com</p>
                  <p className="text-muted">+971 00 000 0000</p>
                  <p className="text-muted">Dubai, UAE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Update the hero fallback default**

In `corbix-app/app/(public)/page.tsx`, change the `heroHeadline` fallback:

```tsx
  const heroHeadline = asText(
    content.hero_headline?.text,
    "We build the future of real estate",
  );
```

- [ ] **Step 5: Delete `BrickWorld`**

Delete `corbix-app/components/public/home/BrickWorld.tsx`. Confirm nothing else imports it:

Run: `cd corbix-app; npx tsc --noEmit`
Expected: no errors referencing `BrickWorld`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd corbix-app; npx vitest run`
Expected: PASS — all suites, including `home-experience.test.tsx` and `mountain-hero.test.tsx`.

- [ ] **Step 7: Commit**

```bash
git add corbix-app/components/public/home/HomeExperience.tsx corbix-app/app/(public)/page.tsx corbix-app/__tests__/home/home-experience.test.tsx
git rm corbix-app/components/public/home/BrickWorld.tsx
git commit -m "feat: flatten homepage to mountain hero + stacked sections, remove brick world"
```

---

### Task 3: Build verification

**Files:**
- None (verification only; fix-forward if needed).

**Interfaces:**
- Consumes: the full app from Tasks 1–2.
- Produces: a clean production build.

- [ ] **Step 1: Lint**

Run: `cd corbix-app; npx eslint .`
Expected: no errors.

- [ ] **Step 2: Production build**

Run: `cd corbix-app; npm run build`
Expected: build succeeds; `/` (home) compiles with no type errors and no unresolved `BrickWorld` import.

- [ ] **Step 3: Commit any fixes**

Only if Steps 1–2 surfaced fixes:

```bash
git add -A
git commit -m "fix: resolve lint/build issues for mountain hero"
```

---

## Self-Review

**Spec coverage:**
- Fullscreen layered SVG hero (4–5 layers) → Task 1 (5 layers). ✓
- Per-layer dark shades → Task 1 `LAYERS[].fill`. ✓
- Per-layer scrub parallax with given y travel → Task 1 `LAYERS[].travel` (-80/-140/-200/-300/-360) + ScrollTrigger scrub. ✓
- Organic bezier ridges → Task 1 `LAYERS[].d` cubic curves. ✓
- Text fade-in from below on load (`y:60, opacity:0, stagger:0.15`) → Task 1 `gsap.from`. ✓
- CMS copy + real-estate fallback → Task 2 Step 4. ✓
- Gold glow + dark sky → Task 1 markup. ✓
- Mobile reduced travel + reduced-motion static → Task 1 `gsap.matchMedia`. ✓
- Replace brick hero, keep stacked sections, delete BrickWorld → Task 2. ✓
- Smooth-scroll unchanged → not touched. ✓
- Tests + build → Tasks 1–3. ✓

**Placeholder scan:** No TBD/TODO; all steps contain concrete code/commands.

**Type consistency:** `MountainHeroProps` matches the props passed in Task 2; `HomeExperienceProps` matches `page.tsx`; `getServiceHref` used with a `Service` carrying `slug` + `has_page`. `[data-section]` (HomeExperience) and `[data-layer]`/`[data-hero-text]` (MountainHero) are internally consistent.
