import { MediaUploader } from "@/components/admin/MediaUploader";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

async function getAssets() {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function CmsMediaPage() {
  const assets = await getAssets();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">CMS / Media</h1>
      <MediaUploader initialAssets={assets as any[]} />
    </div>
  );
}
