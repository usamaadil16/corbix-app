import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/shared";

export function createServerClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
}
