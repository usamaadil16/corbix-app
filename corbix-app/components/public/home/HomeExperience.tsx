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
        scrollTrigger: {
          trigger: "[data-section='services']",
          start: "top 80%",
        },
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
          <p className="text-xs uppercase tracking-[0.3em] text-accent">
            Vision
          </p>
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
                  <Link
                    href="/about"
                    className="block text-muted hover:text-white"
                  >
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
