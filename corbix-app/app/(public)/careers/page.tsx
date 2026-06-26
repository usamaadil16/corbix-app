import { Card } from "@/components/ui/Card";
import { getCareers } from "@/lib/cms/get-careers";

export default async function CareersPage() {
  const careers = await getCareers();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <h1 className="font-display text-5xl text-white">Careers</h1>
      <p className="mt-4 text-muted">
        Build with a team obsessed with execution quality and long-term client
        value.
      </p>

      <div className="mt-8 space-y-4">
        {careers.map((job) => (
          <Card key={job.id ?? job.title}>
            <h2 className="text-xl font-semibold text-white">{job.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {job.department} - {job.location}
            </p>
            <p className="mt-3 text-sm text-muted">{job.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
