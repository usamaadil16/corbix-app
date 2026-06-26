import fallbackServices from "@/data/seed-services.json";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/shared";
import type { Service } from "@/types/database";

export async function getServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) {
    return (fallbackServices as Service[]).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("visible", true)
    .order("sort_order");

  if (error || !data?.length) {
    return (fallbackServices as Service[]).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
  }

  return data as Service[];
}

export function getServiceHref(service: Pick<Service, "slug" | "has_page">) {
  if (service.has_page) {
    return `/services/${service.slug}`;
  }

  return `/services/coming-soon?service=${service.slug}`;
}
