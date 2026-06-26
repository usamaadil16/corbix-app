import Link from "next/link";
import { LeadCaptureForm } from "@/components/public/LeadCaptureForm";
import { getServices } from "@/lib/cms/get-services";

type ComingSoonProps = {
  searchParams: Promise<{ service?: string }>;
};

export default async function ComingSoonPage(props: ComingSoonProps) {
  const searchParams = await props.searchParams;
  const slug = searchParams.service ?? "";
  const services = await getServices();
  const service = services.find((entry) => entry.slug === slug);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-surface p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Service Update
        </p>
        <h1 className="mt-3 font-display text-4xl text-white">
          {service?.title ?? "Service"} is coming soon
        </h1>
        <p className="mt-4 text-muted">
          {service?.description ??
            "This service brief is currently being finalized. Share your needs and the team will follow up directly."}
        </p>

        <div className="mt-6">
          <LeadCaptureForm
            serviceOptions={[service?.title ?? "Specialized Consulting"]}
            sourcePage={`/services/coming-soon?service=${slug}`}
            submitLabel="Notify Me"
          />
        </div>

        <Link
          href="/contact"
          className="mt-6 inline-flex text-sm font-semibold text-accent hover:text-accent/80"
        >
          Prefer direct contact? Visit Contact Page
        </Link>
      </div>
    </div>
  );
}
