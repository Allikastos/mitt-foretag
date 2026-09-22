import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";

/**
 * The public Altura Nova site intentionally uses its own Supabase project.
 * The Hub keeps using the existing Supabase environment and client helpers.
 */
export const BLOG_IMAGES_BUCKET = "blog-images";

type MarketingSupabaseClient = SupabaseClient<Database>;

let browserClient: MarketingSupabaseClient | null = null;

function getMarketingSupabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_MARKETING_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_MARKETING_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_MARKETING_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getMarketingSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_MARKETING_SUPABASE_URL,
    anonKey: getMarketingSupabasePublicKey(),
  };
}

export function hasMarketingSupabaseEnv() {
  const { url, anonKey } = getMarketingSupabaseEnv();
  return Boolean(url && anonKey);
}

function requireMarketingSupabaseEnv() {
  const { url, anonKey } = getMarketingSupabaseEnv();

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_MARKETING_SUPABASE_URL or a public marketing Supabase key."
    );
  }

  return { url, anonKey };
}

export function getMarketingSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = requireMarketingSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, anonKey);

  return browserClient;
}

export function createMarketingPublicSupabaseClient() {
  const { url, anonKey } = requireMarketingSupabaseEnv();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
