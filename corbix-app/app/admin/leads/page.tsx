import Link from "next/link";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { Lead } from "@/types/database";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

async function getLeads(status?: string): Promise<Lead[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data } = await query;
  return (data as Lead[]) ?? [];
}

export default async function LeadsPage(props: Props) {
  const searchParams = await props.searchParams;
  const status = searchParams.status;
  const leads = await getLeads(status);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">Leads</h1>
      <form className="flex items-center gap-3">
        <Select name="status" defaultValue={status ?? ""} className="max-w-xs">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="lost">Lost</option>
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <AdminTable
        rows={leads}
        columns={[
          {
            key: "client_name",
            header: "Name",
            render: (lead) => (
              <Link href={`/admin/leads/${lead.id}`} className="text-accent">
                {lead.client_name}
              </Link>
            ),
          },
          { key: "company_name", header: "Company" },
          { key: "service_requested", header: "Service" },
          { key: "source_page", header: "Source" },
          { key: "status", header: "Status" },
          {
            key: "created_at",
            header: "Date",
            render: (lead) => new Date(lead.created_at).toLocaleDateString(),
          },
        ]}
      />
    </div>
  );
}
