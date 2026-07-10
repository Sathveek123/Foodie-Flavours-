import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Validate that url is a valid supabase url before creating
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.includes("supabase.co") || url.includes("localhost");
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  supabaseUrl !== "your_supabase_project_url" && 
  isValidUrl(supabaseUrl) &&
  !!supabaseAnonKey && 
  supabaseAnonKey !== "your_supabase_anon_public_key";

// Use fallback placeholder url to prevent crash on initialization if not configured
const activeUrl = isSupabaseConfigured ? supabaseUrl : "https://placeholder-project.supabase.co";
const activeKey = isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key";

export const supabase = createClient(activeUrl, activeKey);
