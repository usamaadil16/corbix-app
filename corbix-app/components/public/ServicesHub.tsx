import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getServiceHref } from "@/lib/cms/get-services";
import type { Service } from "@/types/database";

type ServicesHubProps = {
  services: Service[];
};

export function ServicesHub({ services }: ServicesHubProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20" id="services">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="font-display text-4xl text-white">Services Hub</h2>
        <p className="max-w-xl text-sm text-muted">
          Six flagship execution tracks and five specialist extensions under one
          strategic operating model.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.slug} className="flex h-full flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{service.title}</h3>
              <p className="mt-3 text-sm text-muted">{service.description}</p>
            </div>
            <Link
              href={getServiceHref(service)}
              className="mt-5 text-sm font-semibold text-accent hover:text-accent/80"
            >
              Explore Service
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
