import { LeadCaptureForm } from "@/components/public/LeadCaptureForm";
import { ServiceSlider } from "@/components/public/ServiceSlider";
import { servicePages } from "@/data/service-pages";

export default function DigitalMarketingPage() {
  const config = servicePages["digital-marketing"];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <section className="rounded-2xl border border-white/10 bg-surface/60 p-7">
        <h1 className="font-display text-4xl text-white md:text-5xl">
          {config.headline}
        </h1>
        <p className="mt-4 max-w-3xl text-muted">{config.subheadline}</p>
        <div className="mt-6 max-w-xl">
          <LeadCaptureForm
            sourcePage="/services/digital-marketing"
            submitLabel={config.submitLabel}
            serviceOptions={config.serviceOptions}
          />
        </div>
      </section>

      <section className="mt-8">
        <ServiceSlider slides={config.slides} />
      </section>
    </div>
  );
}
