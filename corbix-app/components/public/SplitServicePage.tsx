import { LeadCaptureForm } from "@/components/public/LeadCaptureForm";
import { ServiceSlider } from "@/components/public/ServiceSlider";
import type { ServicePageConfig } from "@/data/service-pages";

type SplitServicePageProps = {
  config: ServicePageConfig;
};

export function SplitServicePage({ config }: SplitServicePageProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <section className="grid gap-8 rounded-2xl border border-white/10 bg-surface/60 p-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Corbrix</p>
          <h1 className="mt-3 font-display text-4xl text-white md:text-5xl">
            {config.headline}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">{config.subheadline}</p>
        </div>
        <div className="md:col-span-2">
          <LeadCaptureForm
            serviceOptions={config.serviceOptions}
            submitLabel={config.submitLabel}
            sourcePage={`/services/${config.slug}`}
          />
        </div>
      </section>

      <section className="mt-8">
        <ServiceSlider slides={config.slides} />
      </section>
    </div>
  );
}
