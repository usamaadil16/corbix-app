import fallbackPageContent from "@/data/seed-page-content.json";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/shared";

type PageSectionMap = Record<string, Record<string, unknown>>;

export async function getPageContent(pageKey: string): Promise<PageSectionMap> {
  const fallback = (fallbackPageContent as Array<{
    page_key: string;
    section_key: string;
    content: Record<string, unknown>;
    visible: boolean;
  }>)
    .filter((entry) => entry.page_key === pageKey && entry.visible)
    .reduce<PageSectionMap>((acc, entry) => {
      acc[entry.section_key] = entry.content;
      return acc;
    }, {});

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("page_content")
    .select("section_key,content,visible")
    .eq("page_key", pageKey)
    .eq("visible", true);

  if (error || !data) {
    return fallback;
  }

  const mapped = data.reduce<PageSectionMap>((acc, row) => {
    acc[row.section_key] = (row.content ?? {}) as Record<string, unknown>;
    return acc;
  }, {});

  return { ...fallback, ...mapped };
}
