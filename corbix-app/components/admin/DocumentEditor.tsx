"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { calculateDocumentTotal } from "@/lib/documents/calculate-totals";
import type { Client, DocumentType, LineItem } from "@/types/database";
import { LineItemsEditor } from "@/components/admin/LineItemsEditor";

type DocumentEditorValues = {
  id?: string;
  client_id: string;
  type: DocumentType;
  status: "draft" | "sent" | "accepted" | "paid";
  line_items: LineItem[];
  terms: string;
  notes: string;
  valid_until: string | null;
  parent_document_id?: string | null;
};

type Props = {
  clients: Client[];
  initialValues?: Partial<DocumentEditorValues>;
  onSaved?: (documentId: string) => void;
};

export function DocumentEditor({ clients, initialValues, onSaved }: Props) {
  const [values, setValues] = useState<DocumentEditorValues>({
    id: initialValues?.id,
    client_id: initialValues?.client_id ?? clients[0]?.id ?? "",
    type: initialValues?.type ?? "quotation",
    status: initialValues?.status ?? "draft",
    line_items: initialValues?.line_items ?? [
      { description: "", quantity: 1, unit_price: 0, total: 0 },
    ],
    terms: initialValues?.terms ?? "",
    notes: initialValues?.notes ?? "",
    valid_until: initialValues?.valid_until ?? "",
    parent_document_id: initialValues?.parent_document_id ?? null,
  });
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () => calculateDocumentTotal(values.line_items),
    [values.line_items],
  );

  const save = async () => {
    setSaving(true);
    const method = values.id ? "PATCH" : "POST";
    const path = values.id
      ? `/api/admin/documents/${values.id}`
      : "/api/admin/documents";
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { document?: { id: string } };
    if (data.document?.id && onSaved) {
      onSaved(data.document.id);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-surface p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          value={values.client_id}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, client_id: event.target.value }))
          }
        >
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.client_name} - {client.company_name}
            </option>
          ))}
        </Select>
        <Select
          value={values.type}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              type: event.target.value as DocumentType,
            }))
          }
        >
          <option value="quotation">Quotation</option>
          <option value="proposal">Proposal</option>
          <option value="invoice">Invoice</option>
        </Select>
      </div>

      <LineItemsEditor
        lineItems={values.line_items}
        onChange={(line_items) => setValues((prev) => ({ ...prev, line_items }))}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          type="date"
          value={values.valid_until ?? ""}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, valid_until: event.target.value }))
          }
        />
        <Select
          value={values.status}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              status: event.target.value as DocumentEditorValues["status"],
            }))
          }
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="paid">Paid</option>
        </Select>
      </div>

      <Textarea
        placeholder="Terms"
        value={values.terms}
        onChange={(event) =>
          setValues((prev) => ({ ...prev, terms: event.target.value }))
        }
      />
      <Textarea
        placeholder="Notes"
        value={values.notes}
        onChange={(event) =>
          setValues((prev) => ({ ...prev, notes: event.target.value }))
        }
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Computed total: <span className="text-accent">{total.toFixed(2)}</span>
        </p>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Document"}
        </Button>
      </div>
    </div>
  );
}
