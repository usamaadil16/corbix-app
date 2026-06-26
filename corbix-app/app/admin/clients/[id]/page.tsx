import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { Client, Document } from "@/types/database";

type Props = {
  params: Promise<{ id: string }>;
};

async function getClientWithDocuments(id: string) {
  if (!isSupabaseAdminConfigured()) {
    return { client: null as Client | null, documents: [] as Document[] };
  }
  const supabase = createAdminClient();
  const [clientRes, docsRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("documents")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);
  return {
    client: (clientRes.data as Client | null) ?? null,
    documents: (docsRes.data as Document[]) ?? [],
  };
}

export default async function ClientDetailPage(props: Props) {
  const { id } = await props.params;
  const { client, documents } = await getClientWithDocuments(id);
  if (!client) return notFound();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">{client.client_name}</h1>
      <Card>
        <p className="text-sm text-muted">{client.company_name}</p>
        <p className="mt-1 text-sm text-muted">{client.email}</p>
        <p className="mt-1 text-sm text-muted">{client.phone}</p>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Documents</h2>
          <Link
            href="/admin/documents/new"
            className="text-sm font-semibold text-accent hover:text-accent/80"
          >
            New Document
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/admin/documents/${doc.id}`}
              className="block rounded-lg border border-white/10 p-3 text-sm text-muted hover:bg-white/5 hover:text-white"
            >
              {doc.type.toUpperCase()} - {doc.status}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
