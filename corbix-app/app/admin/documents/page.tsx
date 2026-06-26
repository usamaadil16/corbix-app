import Link from "next/link";
import { AdminTable } from "@/components/admin/AdminTable";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { Document } from "@/types/database";

async function getDocuments(): Promise<Document[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Document[]) ?? [];
}

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-white">Documents</h1>
        <Link
          href="/admin/documents/new"
          className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
        >
          New Document
        </Link>
      </div>
      <AdminTable
        rows={documents}
        columns={[
          {
            key: "id",
            header: "ID",
            render: (doc) => (
              <Link href={`/admin/documents/${doc.id}`} className="text-accent">
                {doc.id.slice(0, 8)}
              </Link>
            ),
          },
          { key: "type", header: "Type" },
          { key: "status", header: "Status" },
          {
            key: "created_at",
            header: "Created",
            render: (doc) => new Date(doc.created_at).toLocaleDateString(),
          },
        ]}
      />
    </div>
  );
}
