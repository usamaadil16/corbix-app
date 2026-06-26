import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import { documentSchema } from "@/lib/validations/document";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ document: null, mocked: true });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ document: data });
}

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ document: { id, ...parsed.data }, mocked: true });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ document: data });
}
