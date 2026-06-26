import fallbackPrograms from "@/data/seed-programs.json";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/shared";
import type { Program } from "@/types/database";

export async function getPrograms(): Promise<Program[]> {
  const fallback = (fallbackPrograms as Program[]).sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("visible", true)
    .order("sort_order");

  if (error || !data?.length) {
    return fallback;
  }

  return data as Program[];
}
