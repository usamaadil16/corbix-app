import { JsonCrudEditor } from "@/components/admin/JsonCrudEditor";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";

async function getCaseStudies() {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("case_studies")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export default async function CmsCaseStudiesPage() {
  const caseStudies = await getCaseStudies();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-white">CMS / Case Studies</h1>
      <JsonCrudEditor
        title="Case Studies"
        endpoint="/api/admin/cms/case-studies"
        listKey="case_studies"
        initialRows={caseStudies}
        fields={[
          { key: "title", label: "Title" },
          { key: "description", label: "Description", multiline: true },
          { key: "link", label: "Link" },
          { key: "sort_order", label: "Sort Order" },
        ]}
      />
    </div>
  );
}
