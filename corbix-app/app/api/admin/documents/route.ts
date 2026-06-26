import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import { documentSchema } from "@/lib/validations/document";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ documents: [] });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ document: { id: "mock-document-id", ...parsed.data } });
  }

  const supabase = createAdminClient();
  const payload = {
    ...parsed.data,
    valid_until: parsed.data.valid_until || null,
    parent_document_id: parsed.data.parent_document_id || null,
  };
  const { data, error } = await supabase
    .from("documents")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ document: data });
}
