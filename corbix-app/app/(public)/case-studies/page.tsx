import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getCaseStudies } from "@/lib/cms/get-case-studies";

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <h1 className="font-display text-5xl text-white">Case Studies</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Selected engagements that show how strategy and execution combine to
        produce measurable outcomes.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {caseStudies.map((item) => (
          <Card key={item.id ?? item.title}>
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm text-muted">{item.description}</p>
            <Link
              href={item.link || "#"}
              className="mt-4 inline-flex text-sm font-semibold text-accent hover:text-accent/80"
            >
              View Story
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
