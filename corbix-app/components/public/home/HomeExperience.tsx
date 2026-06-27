"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MountainWorld } from "@/components/public/home/MountainWorld";
import { MountainHero } from "@/components/public/home/MountainHero";
import { getServiceHref } from "@/lib/cms/get-services";
import { smoothScrollTo } from "@/lib/scroll";
import type { Service } from "@/types/database";

type HomeExperienceProps = {
  heroHeadline: string;
  slogan: string;
  brandTitle: string;
  brandStory: string;
  vision: string;
  services: Service[];
};

const JOURNEY_SCREENS = 7;

export function HomeExperience({
  heroHeadline,
  slogan,
  brandTitle,
  brandStory,
  vision,
  services,
}: HomeExperienceProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const journeyRef = useRef<HTMLDivElement | null>(null);
  const servicesScrollRef = useRef<ScrollTrigger | null>(null);
  const [flight, setFlight] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setFlight(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (typeof window.matchMedia !== "function") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (flight && journeyRef.current) {
        const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
        if (!panels.length) return;

        gsap.set(panels[0], { autoAlpha: 1, y: 0 });
        gsap.set(panels.slice(1), { autoAlpha: 0, y: 70 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: journeyRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });

        let pos = 0;
        panels.forEach((panel, i) => {
          const isServices = panel.dataset.panel === "services";
          const isHero = panel.dataset.panel === "hero";
          // Hero lingers through the cube approach/entry; services dwells so all
          // cards reveal; the rest hand off as the camera flies the valley.
          const dwell = isServices ? 2.4 : isHero ? 1.6 : 1;

          if (i > 0) {
            tl.to(panel, { autoAlpha: 1, y: 0, duration: 0.4 }, pos);
          }

          if (isServices) {
            const cards = panel.querySelectorAll<HTMLElement>("[data-card]");
            tl.from(
              cards,
              { autoAlpha: 0, y: 40, scale: 0.96, stagger: 0.06, duration: 0.4 },
              pos + 0.1,
            );
            tl.addLabel("services", pos + 0.8);
          }

          if (i < panels.length - 1) {
            tl.to(
              panel,
              { autoAlpha: 0, y: -70, duration: 0.4 },
              pos + dwell - 0.2,
            );
          }

          pos += dwell;
        });

        servicesScrollRef.current = tl.scrollTrigger ?? null;
      } else {
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
          scrollTrigger: {
            trigger: "[data-section='services']",
            start: "top 80%",
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [flight]);

  const handleExploreServices = (event: React.MouseEvent) => {
    const st = servicesScrollRef.current;
    if (flight && st) {
      event.preventDefault();
      smoothScrollTo(st.labelToScroll("services"));
    }
  };

  const heroContent = (
    <div className="mx-auto w-full max-w-3xl px-4 text-center">
      <h1 className="font-display text-5xl leading-[1.05] text-white md:text-7xl">
        {heroHeadline}
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{slogan}</p>
      <Link
        href="#services"
        onClick={handleExploreServices}
        className="pointer-events-auto mt-8 inline-flex w-fit rounded-lg border border-white/60 px-5 py-2.5 text-sm text-white transition-colors hover:bg-white hover:text-background"
      >
        Explore Services
      </Link>
    </div>
  );

  const brandContent = (
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
  );

  const visionContent = (
    <div className="mx-auto w-full max-w-6xl px-4">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Vision</p>
      <h2 className="mt-4 font-display text-4xl text-white md:text-6xl">
        Where We Are Headed
      </h2>
      <p className="mt-6 max-w-3xl text-muted md:text-lg">{vision}</p>
    </div>
  );

  const servicesContent = (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-4xl text-white">Services Hub</h2>
        <p className="max-w-xl text-sm text-muted">
          Six flagship execution tracks and five specialist extensions under one
          strategic operating model.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {services.map((service) => (
          <div
            key={service.slug}
            data-card
            className="pointer-events-auto flex h-full flex-col justify-between rounded-xl border border-white/10 bg-surface/80 p-4 backdrop-blur transition-colors hover:border-accent/40"
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
  );

  const closingContent = (
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
              className="pointer-events-auto inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-background transition-colors hover:bg-accent/90"
            >
              Start a Conversation
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-white">Quick Links</p>
              <Link
                href="/about"
                className="pointer-events-auto block text-muted hover:text-white"
              >
                About
              </Link>
              <Link
                href="/case-studies"
                className="pointer-events-auto block text-muted hover:text-white"
              >
                Case Studies
              </Link>
              <Link
                href="/careers"
                className="pointer-events-auto block text-muted hover:text-white"
              >
                Careers
              </Link>
              <Link
                href="/contact"
                className="pointer-events-auto block text-muted hover:text-white"
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
  );

  if (flight) {
    return (
      <div ref={root}>
        <MountainWorld journeyScreens={JOURNEY_SCREENS} />

        <section
          ref={journeyRef}
          data-journey
          className="relative z-10"
          style={{ height: `${JOURNEY_SCREENS * 100}vh` }}
        >
          <div className="pointer-events-none sticky top-0 flex h-screen items-center overflow-hidden">
            <div
              data-panel="hero"
              className="absolute inset-0 flex items-end justify-center pb-40"
            >
              {heroContent}
            </div>
            <div
              data-panel="brand"
              className="absolute inset-0 flex items-center"
            >
              {brandContent}
            </div>
            <div
              data-panel="vision"
              className="absolute inset-0 flex items-center"
            >
              {visionContent}
            </div>
            <div
              data-panel="services"
              className="absolute inset-0 flex items-center"
            >
              {servicesContent}
            </div>
            <div
              data-panel="closing"
              className="absolute inset-0 flex items-center"
            >
              {closingContent}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-muted">
            <span className="animate-pulse">Scroll</span>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div ref={root} className="relative z-10">
      <MountainHero heroHeadline={heroHeadline} slogan={slogan} />

      <section data-section="brand" className="py-24">
        {brandContent}
      </section>
      <section data-section="vision" className="py-24">
        {visionContent}
      </section>
      <section data-section="services" id="services" className="py-24">
        {servicesContent}
      </section>
      <section data-section="closing" className="py-24">
        {closingContent}
      </section>
    </div>
  );
}
