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
  {
    id: 1,
    fill: "#2a2a2a",
    travel: -80,
    d: "M0,270 C240,250 480,265 720,245 C960,225 1200,255 1440,240 L1440,320 L0,320 Z",
  },
  {
    id: 2,
    fill: "#222222",
    travel: -140,
    d: "M0,255 C220,230 470,255 720,225 C970,200 1210,240 1440,225 L1440,320 L0,320 Z",
  },
  {
    id: 3,
    fill: "#1a1a1a",
    travel: -200,
    d: "M0,235 C260,205 520,245 760,205 C1000,170 1220,225 1440,205 L1440,320 L0,320 Z",
  },
  {
    id: 4,
    fill: "#161616",
    travel: -300,
    d: "M0,210 C230,175 470,225 720,180 C980,140 1240,205 1440,180 L1440,320 L0,320 Z",
  },
  {
    id: 5,
    fill: "#111111",
    travel: -360,
    d: "M0,185 C240,150 500,205 760,160 C1020,120 1260,185 1440,160 L1440,320 L0,320 Z",
  },
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
        <p data-hero-text className="mx-auto mt-6 max-w-2xl text-lg text-muted">
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
