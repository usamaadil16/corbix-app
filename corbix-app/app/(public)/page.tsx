import Link from "next/link";
import { PartnerMarquee } from "@/components/public/PartnerMarquee";
import { ParticleHero } from "@/components/public/ParticleHero";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { ServicesHub } from "@/components/public/ServicesHub";
import { getPageContent } from "@/lib/cms/get-page-content";
import { getServices } from "@/lib/cms/get-services";

function asText(value: unknown, fallback: string) {
  if (typeof value === "string") return value;
  return fallback;
}

export default async function HomePage() {
  const content = await getPageContent("home");
  const services = await getServices();

  const heroHeadline = asText(content.hero_headline?.text, "A Name You Trust.");
  const slogan = asText(
    content.slogan?.text,
    "Your single unified partner for local growth and global expansion.",
  );
  const brandTitle = asText(content.brand_story?.title, "COR / BRIX");
  const brandStory = asText(
    content.brand_story?.text,
    "COR stands for core trust and commitment. BRIX represents building blocks for durable growth.",
  );
  const vision = asText(
    content.vision?.text,
    "We combine strategic precision and operational execution to help businesses scale with confidence.",
  );

  return (
    <div>
      <section className="relative overflow-hidden">
        <ParticleHero />
        <div className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center px-4 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Corbrix</p>
          <h1 className="mt-4 font-display text-5xl text-white md:text-7xl">
            {heroHeadline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{slogan}</p>
          <Link
            href="#services"
            className="mt-10 inline-flex w-fit rounded-lg border border-accent/40 px-4 py-2 text-sm text-accent hover:bg-accent/10"
          >
            Explore Services
          </Link>
        </div>
      </section>

      <PartnerMarquee />

      <ScrollReveal className="mx-auto w-full max-w-6xl px-4 py-20">
        <h2 className="font-display text-4xl text-white">{brandTitle}</h2>
        <p className="mt-4 max-w-3xl text-base text-muted">{brandStory}</p>
      </ScrollReveal>

      <ScrollReveal className="mx-auto w-full max-w-6xl px-4 pb-8">
        <h2 className="font-display text-3xl text-white">Vision</h2>
        <p className="mt-4 max-w-3xl text-muted">{vision}</p>
      </ScrollReveal>

      <ServicesHub services={services} />

      <section className="mx-auto w-full max-w-6xl px-4 pb-6">
        <div className="rounded-2xl border border-white/10 bg-surface p-8 text-center">
          <h2 className="font-display text-4xl text-white">
            Let&apos;s build your future together
          </h2>
          <p className="mt-3 text-muted">
            Start with a focused conversation and a strategic action map.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            Contact Corbrix
          </Link>
        </div>
      </section>
    </div>
  );
}
