import { JsonCrudEditor } from "@/components/admin/JsonCrudEditor";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

async function getCareers() {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase.from("careers").select("*").order("sort_order");
  return data ?? [];
}

export default async function CmsCareersPage() {
  const careers = await getCareers();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">CMS / Careers</h1>
      <JsonCrudEditor
        title="Careers"
        endpoint="/api/admin/cms/careers"
        listKey="careers"
        initialRows={careers}
        fields={[
          { key: "title", label: "Title" },
          { key: "department", label: "Department" },
          { key: "location", label: "Location" },
          { key: "description", label: "Description", multiline: true },
          { key: "sort_order", label: "Sort Order" },
        ]}
      />
    </div>
  );
}
