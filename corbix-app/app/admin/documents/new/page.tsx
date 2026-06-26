import { DocumentEditor } from "@/components/admin/DocumentEditor";
import { DocumentPreview } from "@/components/admin/DocumentPreview";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { Client, Document } from "@/types/database";

async function getClients(): Promise<Client[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase.from("clients").select("*").order("created_at");
  return (data as Client[]) ?? [];
}

const previewDoc: Pick<Document, "type" | "line_items" | "terms" | "notes"> = {
  type: "quotation",
  line_items: [{ description: "Sample line item", quantity: 1, unit_price: 0, total: 0 }],
  terms: "",
  notes: "",
};

export default async function NewDocumentPage() {
  const clients = await getClients();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 font-display text-4xl text-white">Create Document</h1>
        <DocumentEditor clients={clients} />
      </div>
      <div>
        <DocumentPreview document={previewDoc} client={clients[0] ?? null} />
      </div>
    </div>
  );
}
