import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const authError = await requireAdmin();
  if (authError) return authError;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ ok: true, mocked: true });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as { status?: string; notes?: string };
  const updateData: Record<string, unknown> = {};
  if (typeof payload.status === "string") updateData.status = payload.status;
  if (typeof payload.notes === "string") updateData.notes = payload.notes;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead: data });
}
