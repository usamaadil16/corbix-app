import { LeadCaptureForm } from "@/components/public/LeadCaptureForm";
import { ProgramExplorer } from "@/components/public/ProgramExplorer";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { servicePages } from "@/data/service-pages";
import { getPrograms } from "@/lib/cms/get-programs";

const regionOptions = [
  "Middle East",
  "Europe",
  "Caribbean",
  "North America",
  "Asia Pacific",
];

export default async function GlobalMobilityPage() {
  const programs = await getPrograms();
  const config = servicePages["global-mobility"];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10 bg-surface/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h1 className="font-display text-4xl text-white md:text-6xl">
            Your Global Plan B, Structured with Confidence.
          </h1>
          <p className="mt-4 max-w-3xl text-muted">
            Navigate residency and citizenship pathways with disciplined advisory,
            compliance-focused execution, and full process visibility.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <ProgramExplorer programs={programs} />
      </section>

      <ScrollReveal className="mx-auto w-full max-w-6xl px-4 py-8">
        <h2 className="font-display text-3xl text-white">Why Corbrix Mobility</h2>
        <ul className="mt-4 grid gap-3 text-muted md:grid-cols-2">
          <li>Discreet, founder-focused advisory with jurisdiction fit analysis.</li>
          <li>Structured document readiness and due-diligence preparation.</li>
          <li>Program comparison by timeline, capital exposure, and mobility utility.</li>
          <li>Long-term support beyond approval and relocation.</li>
        </ul>
      </ScrollReveal>

      <ScrollReveal className="mx-auto w-full max-w-6xl px-4 py-8">
        <h2 className="font-display text-3xl text-white">Our 3-Step Process</h2>
        <ol className="mt-4 space-y-3 text-muted">
          <li>1. Profile & Goal Mapping</li>
          <li>2. Program Structuring & File Preparation</li>
          <li>3. Submission Oversight & Post-Approval Execution</li>
        </ol>
      </ScrollReveal>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <LeadCaptureForm
          sourcePage="/services/global-mobility"
          submitLabel={config.submitLabel}
          serviceOptions={regionOptions}
        />
      </section>
    </div>
  );
}
