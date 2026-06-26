import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "@/lib/supabase/shared";

export function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceKey());
}
