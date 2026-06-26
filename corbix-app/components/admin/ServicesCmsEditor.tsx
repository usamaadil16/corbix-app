"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Service } from "@/types/database";

type Props = {
  initialServices: Service[];
};

export function ServicesCmsEditor({ initialServices }: Props) {
  const [services, setServices] = useState(initialServices);
  const [draft, setDraft] = useState({
    slug: "",
    title: "",
    description: "",
    sort_order: services.length + 1,
  });

  const refresh = async () => {
    const response = await fetch("/api/admin/cms/services");
    const data = (await response.json()) as { services?: Service[] };
    setServices(data.services ?? []);
  };

  const create = async () => {
    await fetch("/api/admin/cms/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, visible: true, has_page: false }),
    });
    setDraft({ slug: "", title: "", description: "", sort_order: services.length + 2 });
    await refresh();
  };

  const patch = async (service: Service) => {
    await fetch("/api/admin/cms/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    await refresh();
  };

  const remove = async (id: string) => {
    await fetch("/api/admin/cms/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await refresh();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-surface p-4">
        <p className="mb-3 text-sm text-muted">Add service</p>
        <div className="grid gap-2">
          <Input
            placeholder="Slug"
            value={draft.slug}
            onChange={(e) => setDraft((s) => ({ ...s, slug: e.target.value }))}
          />
          <Input
            placeholder="Title"
            value={draft.title}
            onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))}
          />
          <Textarea
            placeholder="Description"
            value={draft.description}
            onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
          />
          <Button onClick={create}>Create Service</Button>
        </div>
      </div>

      {services.map((service, index) => (
        <div key={service.id ?? service.slug} className="rounded-xl border border-white/10 bg-surface p-4">
          <div className="grid gap-2">
            <Input
              value={service.title}
              onChange={(e) => {
                const next = [...services];
                next[index] = { ...next[index], title: e.target.value };
                setServices(next);
              }}
            />
            <Textarea
              value={service.description}
              onChange={(e) => {
                const next = [...services];
                next[index] = { ...next[index], description: e.target.value };
                setServices(next);
              }}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => patch(services[index])}>
                Save
              </Button>
              {service.id ? (
                <Button variant="outline" onClick={() => remove(service.id)}>
                  Delete
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
