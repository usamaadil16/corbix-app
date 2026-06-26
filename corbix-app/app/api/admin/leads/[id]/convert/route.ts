import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authError = await requireAdmin();
  if (authError) return authError;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ client: { id: "mock-client-id" }, mocked: true });
  }

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      lead_id: lead.id,
      client_name: lead.client_name,
      company_name: lead.company_name,
      phone: lead.phone,
      email: lead.email,
    })
    .select("*")
    .single();

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  await supabase.from("leads").update({ status: "qualified" }).eq("id", id);
  return NextResponse.json({ client });
}
