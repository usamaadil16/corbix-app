import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ careers: [] });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ careers: data ?? [] });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ ok: true, mocked: true });
  const payload = await request.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("careers")
    .insert(payload)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/careers");
  return NextResponse.json({ career: data });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ ok: true, mocked: true });
  const payload = (await request.json()) as { id: string } & Record<string, unknown>;
  const { id, ...updates } = payload;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("careers")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/careers");
  return NextResponse.json({ career: data });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ ok: true, mocked: true });
  const { id } = (await request.json()) as { id: string };
  const supabase = createAdminClient();
  const { error } = await supabase.from("careers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/careers");
  return NextResponse.json({ ok: true });
}
