import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentEditor } from "@/components/admin/DocumentEditor";
import { DocumentPreview } from "@/components/admin/DocumentPreview";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { Client, Document } from "@/types/database";

type Props = {
  params: Promise<{ id: string }>;
};

async function getData(id: string) {
  if (!isSupabaseAdminConfigured()) {
    return {
      document: null as Document | null,
      clients: [] as Client[],
      client: null as Client | null,
    };
  }
  const supabase = createAdminClient();
  const [docRes, clientsRes] = await Promise.all([
    supabase.from("documents").select("*").eq("id", id).single(),
    supabase.from("clients").select("*").order("created_at"),
  ]);
  const document = (docRes.data as Document | null) ?? null;
  const clients = (clientsRes.data as Client[]) ?? [];
  const client = clients.find((entry) => entry.id === document?.client_id) ?? null;
  return { document, clients, client };
}

export default async function DocumentDetailPage(props: Props) {
  const { id } = await props.params;
  const { document, clients, client } = await getData(id);
  if (!document) return notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-white">Document {id.slice(0, 8)}</h1>
        <div className="flex gap-3">
          <Link
            href={`/api/admin/documents/${id}/pdf`}
            target="_blank"
            className="inline-flex h-11 items-center rounded-lg border border-accent px-5 text-sm font-semibold text-accent hover:bg-accent/10"
          >
            Download PDF
          </Link>
          <Link
            href={`/admin/documents/new?clone=${id}`}
            className="inline-flex h-11 items-center rounded-lg border border-accent px-5 text-sm font-semibold text-accent hover:bg-accent/10"
          >
            Clone as New
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentEditor clients={clients} initialValues={document} />
        <DocumentPreview document={document} client={client} />
      </div>
    </div>
  );
}
