"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type SectionEntry = {
  id?: string;
  page_key: string;
  section_key: string;
  content: Record<string, unknown>;
  visible: boolean;
};

type Props = {
  sections: SectionEntry[];
};

export function PageSectionEditor({ sections }: Props) {
  const [selectedPage, setSelectedPage] = useState("home");
  const [state, setState] = useState<SectionEntry[]>(sections);

  const filtered = state.filter((section) => section.page_key === selectedPage);

  const save = async (section: SectionEntry) => {
    await fetch("/api/admin/cms/pages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(section),
    });
  };

  return (
    <div className="space-y-4">
      <Select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)}>
        <option value="home">Home</option>
        <option value="about">About</option>
        <option value="contact">Contact</option>
      </Select>
      {filtered.map((section, index) => (
        <div key={`${section.page_key}-${section.section_key}`} className="rounded-lg border border-white/10 p-4">
          <p className="text-sm font-semibold text-white">{section.section_key}</p>
          <div className="mt-3 space-y-2">
            {Object.entries(section.content).map(([key, value]) => (
              <Input
                key={key}
                value={String(value ?? "")}
                onChange={(event) => {
                  const next = [...state];
                  const original = filtered[index];
                  const targetIndex = next.findIndex(
                    (item) =>
                      item.page_key === original.page_key &&
                      item.section_key === original.section_key,
                  );
                  next[targetIndex] = {
                    ...next[targetIndex],
                    content: {
                      ...next[targetIndex].content,
                      [key]: event.target.value,
                    },
                  };
                  setState(next);
                }}
              />
            ))}
          </div>
          <Button className="mt-3" variant="outline" onClick={() => save(section)}>
            Save Section
          </Button>
        </div>
      ))}
    </div>
  );
}
