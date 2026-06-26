import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ sections: [] });

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("page_content").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sections: data ?? [] });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ ok: true, mocked: true });

  const payload = (await request.json()) as {
    page_key: string;
    section_key: string;
    content: Record<string, unknown>;
    visible?: boolean;
  };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("page_content")
    .upsert(payload, { onConflict: "page_key,section_key" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  return NextResponse.json({ section: data });
}
