import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ programs: [] });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ programs: data ?? [] });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ ok: true, mocked: true });
  const payload = await request.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("programs")
    .insert(payload)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/services/global-mobility");
  return NextResponse.json({ program: data });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ ok: true, mocked: true });
  const payload = (await request.json()) as { id: string } & Record<string, unknown>;
  const { id, ...updates } = payload;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("programs")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/services/global-mobility");
  return NextResponse.json({ program: data });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ ok: true, mocked: true });
  const { id } = (await request.json()) as { id: string };
  const supabase = createAdminClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/services/global-mobility");
  return NextResponse.json({ ok: true });
}
