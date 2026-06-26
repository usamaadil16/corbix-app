import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/shared";

export function createBrowserClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
}
