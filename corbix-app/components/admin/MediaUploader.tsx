"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type MediaAsset = {
  id: string;
  filename: string;
  url: string;
  category: string;
  alt_text: string;
};

type Props = {
  initialAssets: MediaAsset[];
};

export function MediaUploader({ initialAssets }: Props) {
  const [assets, setAssets] = useState(initialAssets);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("general");
  const [altText, setAltText] = useState("");

  const refresh = async () => {
    const response = await fetch("/api/admin/cms/media");
    const data = (await response.json()) as { media_assets?: MediaAsset[] };
    setAssets(data.media_assets ?? []);
  };

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    form.set("category", category);
    form.set("alt_text", altText);
    await fetch("/api/admin/cms/media", { method: "POST", body: form });
    setFile(null);
    setAltText("");
    await refresh();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-surface p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="general">General</option>
            <option value="logo">Logo</option>
            <option value="partner">Partner</option>
            <option value="carousel">Carousel</option>
            <option value="hero">Hero</option>
          </Select>
          <Input
            placeholder="Alt text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
        </div>
        <Button className="mt-3" onClick={upload}>
          Upload
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-lg border border-white/10 p-3">
            <p className="text-sm font-semibold text-white">{asset.filename}</p>
            <p className="text-xs text-muted">{asset.category}</p>
            <a
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-accent"
            >
              Open Asset
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
