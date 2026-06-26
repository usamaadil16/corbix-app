import { Card } from "@/components/ui/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

async function getDashboardData() {
  if (!isSupabaseAdminConfigured()) {
    return { totalLeads: 0, newLeads: 0, totalClients: 0, recentLeads: [] as any[] };
  }

  const supabase = createAdminClient();
  const [leads, newLeads, clients, recentLeads] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    totalLeads: leads.count ?? 0,
    newLeads: newLeads.count ?? 0,
    totalClients: clients.count ?? 0,
    recentLeads: recentLeads.data ?? [],
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-white">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Total Leads</p>
          <p className="mt-2 text-3xl font-semibold text-white">{data.totalLeads}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">New Leads</p>
          <p className="mt-2 text-3xl font-semibold text-white">{data.newLeads}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Clients</p>
          <p className="mt-2 text-3xl font-semibold text-white">{data.totalClients}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-white">Recent Leads</h2>
        <div className="mt-4 space-y-3">
          {data.recentLeads.map((lead) => (
            <div key={lead.id} className="rounded-lg border border-white/10 p-3">
              <p className="font-medium text-white">{lead.client_name}</p>
              <p className="text-sm text-muted">
                {lead.company_name} - {lead.service_requested}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
