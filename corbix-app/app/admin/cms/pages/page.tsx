import { PageSectionEditor } from "@/components/admin/PageSectionEditor";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { PageContent } from "@/types/database";

async function getSections(): Promise<PageContent[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase.from("page_content").select("*");
  return (data as PageContent[]) ?? [];
}

export default async function CmsPagesPage() {
  const sections = await getSections();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">CMS / Pages</h1>
      <PageSectionEditor sections={sections} />
    </div>
  );
}
