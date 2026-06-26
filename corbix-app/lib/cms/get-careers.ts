import fallbackCareers from "@/data/seed-careers.json";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/shared";
import type { Career } from "@/types/database";

export async function getCareers(): Promise<Career[]> {
  const fallback = (fallbackCareers as Career[]).sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .eq("visible", true)
    .order("sort_order");

  if (error || !data?.length) {
    return fallback;
  }

  return data as Career[];
}
