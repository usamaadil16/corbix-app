"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { Lead } from "@/types/database";

type Props = {
  lead: Lead;
};

export function LeadDetailActions({ lead }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");

  const save = async () => {
    await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    router.refresh();
  };

  const convert = async () => {
    const response = await fetch(`/api/admin/leads/${lead.id}/convert`, {
      method: "POST",
    });
    const data = (await response.json()) as { client?: { id: string } };
    if (data.client?.id) {
      router.push(`/admin/clients/${data.client.id}`);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <Select value={status} onChange={(e) => setStatus(e.target.value as Lead["status"])}>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="lost">Lost</option>
      </Select>
      <Textarea
        placeholder="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <div className="flex gap-3">
        <Button onClick={save}>Save</Button>
        <Button variant="outline" onClick={convert}>
          Convert to Client
        </Button>
      </div>
    </div>
  );
}
