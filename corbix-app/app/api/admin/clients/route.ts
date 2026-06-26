import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ clients: [] });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ clients: data ?? [] });
}
