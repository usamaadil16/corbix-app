"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type Row = Record<string, unknown> & { id?: string };

type Props = {
  title: string;
  endpoint: string;
  listKey: string;
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
  initialRows: Row[];
};

export function JsonCrudEditor({
  title,
  endpoint,
  listKey,
  fields,
  initialRows,
}: Props) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [draft, setDraft] = useState<Row>(
    fields.reduce<Row>((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {}),
  );

  const refresh = async () => {
    const response = await fetch(endpoint);
    const data = (await response.json()) as Record<string, Row[]>;
    setRows(data[listKey] ?? []);
  };

  const create = async () => {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    await refresh();
  };

  const update = async (row: Row) => {
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    await refresh();
  };

  const remove = async (id: string) => {
    await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await refresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="rounded-xl border border-white/10 bg-surface p-4">
        <p className="mb-3 text-sm text-muted">Create new entry</p>
        <div className="grid gap-2">
          {fields.map((field) =>
            field.multiline ? (
              <Textarea
                key={field.key}
                placeholder={field.label}
                value={String(draft[field.key] ?? "")}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                }
              />
            ) : (
              <Input
                key={field.key}
                placeholder={field.label}
                value={String(draft[field.key] ?? "")}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                }
              />
            ),
          )}
          <Button onClick={create}>Create</Button>
        </div>
      </div>

      {rows.map((row, index) => (
        <div key={row.id ?? index} className="rounded-xl border border-white/10 bg-surface p-4">
          <div className="grid gap-2">
            {fields.map((field) =>
              field.multiline ? (
                <Textarea
                  key={field.key}
                  value={String(rows[index][field.key] ?? "")}
                  onChange={(event) => {
                    const next = [...rows];
                    next[index] = { ...next[index], [field.key]: event.target.value };
                    setRows(next);
                  }}
                />
              ) : (
                <Input
                  key={field.key}
                  value={String(rows[index][field.key] ?? "")}
                  onChange={(event) => {
                    const next = [...rows];
                    next[index] = { ...next[index], [field.key]: event.target.value };
                    setRows(next);
                  }}
                />
              ),
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => update(rows[index])}>
                Save
              </Button>
              {row.id ? (
                <Button variant="outline" onClick={() => remove(row.id!)}>
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
