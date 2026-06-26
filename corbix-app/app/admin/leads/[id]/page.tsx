import { notFound } from "next/navigation";
import { LeadDetailActions } from "@/components/admin/LeadDetailActions";
import { Card } from "@/components/ui/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { Lead } from "@/types/database";

type Props = {
  params: Promise<{ id: string }>;
};

async function getLead(id: string): Promise<Lead | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = createAdminClient();
  const { data } = await supabase.from("leads").select("*").eq("id", id).single();
  return (data as Lead | null) ?? null;
}

export default async function LeadDetailPage(props: Props) {
  const { id } = await props.params;
  const lead = await getLead(id);
  if (!lead) return notFound();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">Lead Detail</h1>
      <Card>
        <div className="grid gap-3 text-sm text-muted md:grid-cols-2">
          <p>Name: {lead.client_name}</p>
          <p>Company: {lead.company_name}</p>
          <p>Email: {lead.email}</p>
          <p>Phone: {lead.phone}</p>
          <p>Service: {lead.service_requested}</p>
          <p>Source: {lead.source_page}</p>
        </div>
      </Card>
      <Card>
        <LeadDetailActions lead={lead} />
      </Card>
    </div>
  );
}
