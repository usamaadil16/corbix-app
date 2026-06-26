import fallbackCaseStudies from "@/data/seed-case-studies.json";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/shared";
import type { CaseStudy } from "@/types/database";

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const fallback = (fallbackCaseStudies as CaseStudy[]).sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("visible", true)
    .order("sort_order");

  if (error || !data?.length) {
    return fallback;
  }

  return data as CaseStudy[];
}
