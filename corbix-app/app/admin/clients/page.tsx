import Link from "next/link";
import { AdminTable } from "@/components/admin/AdminTable";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { Client } from "@/types/database";

async function getClients(): Promise<Client[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Client[]) ?? [];
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">Clients</h1>
      <AdminTable
        rows={clients}
        columns={[
          {
            key: "client_name",
            header: "Name",
            render: (client) => (
              <Link href={`/admin/clients/${client.id}`} className="text-accent">
                {client.client_name}
              </Link>
            ),
          },
          { key: "company_name", header: "Company" },
          { key: "email", header: "Email" },
          { key: "phone", header: "Phone" },
        ]}
      />
    </div>
  );
}
