import { config } from "dotenv";
import ws from "ws";

config({ path: ".env.local" });
config();

if (!globalThis.WebSocket) {
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = ws;
}

import services from "../data/seed-services.json";
import programs from "../data/seed-programs.json";
import pageContent from "../data/seed-page-content.json";
import caseStudies from "../data/seed-case-studies.json";
import careers from "../data/seed-careers.json";
import { createAdminClient } from "../lib/supabase/admin";
import { isSupabaseAdminConfigured } from "../lib/supabase/shared";

async function run() {
  if (!isSupabaseAdminConfigured()) {
    console.log("Skipping seed: Supabase admin credentials are not configured.");
    return;
  }

  const supabase = createAdminClient();

  await supabase
    .from("services")
    .upsert(services, { onConflict: "slug", ignoreDuplicates: false });

  await supabase.from("programs").delete().gt("sort_order", -1);
  await supabase.from("programs").insert(programs);

  await supabase.from("page_content").upsert(pageContent, {
    onConflict: "page_key,section_key",
    ignoreDuplicates: false,
  });

  await supabase.from("case_studies").delete().gt("sort_order", -1);
  await supabase.from("case_studies").insert(caseStudies);

  await supabase.from("careers").delete().gt("sort_order", -1);
  await supabase.from("careers").insert(careers);
  console.log("Seed complete.");
}

run().catch((error: unknown) => {
  console.error("Seed failed", error);
  process.exit(1);
});
