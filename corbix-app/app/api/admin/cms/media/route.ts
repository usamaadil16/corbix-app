import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ media_assets: [] });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ media_assets: data ?? [] });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ ok: true, mocked: true });

  const formData = await request.formData();
  const file = formData.get("file");
  const category = String(formData.get("category") ?? "general");
  const altText = String(formData.get("alt_text") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const filename = `${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(filename);
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      filename,
      url: urlData.publicUrl,
      category,
      alt_text: altText,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/services/global-mobility");
  revalidatePath("/case-studies");
  revalidatePath("/careers");
  return NextResponse.json({ media_asset: data });
}
