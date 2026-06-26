import { ServicesCmsEditor } from "@/components/admin/ServicesCmsEditor";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { Service } from "@/types/database";

async function getServices(): Promise<Service[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase.from("services").select("*").order("sort_order");
  return (data as Service[]) ?? [];
}

export default async function CmsServicesPage() {
  const services = await getServices();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">CMS / Services</h1>
      <ServicesCmsEditor initialServices={services} />
    </div>
  );
}
