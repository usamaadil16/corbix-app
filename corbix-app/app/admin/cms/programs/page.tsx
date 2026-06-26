import { JsonCrudEditor } from "@/components/admin/JsonCrudEditor";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

async function getPrograms() {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase.from("programs").select("*").order("sort_order");
  return data ?? [];
}

export default async function CmsProgramsPage() {
  const programs = await getPrograms();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">CMS / Programs</h1>
      <JsonCrudEditor
        title="Programs"
        endpoint="/api/admin/cms/programs"
        listKey="programs"
        initialRows={programs}
        fields={[
          { key: "country", label: "Country" },
          { key: "region", label: "Region" },
          { key: "type", label: "Type" },
          { key: "minimum_capital", label: "Minimum Capital" },
          { key: "key_benefit", label: "Key Benefit", multiline: true },
          { key: "sort_order", label: "Sort Order" },
        ]}
      />
    </div>
  );
}
