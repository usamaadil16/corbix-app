import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ leads: [] });
  }

  const status = request.nextUrl.searchParams.get("status");
  const supabase = createAdminClient();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data ?? [] });
}
