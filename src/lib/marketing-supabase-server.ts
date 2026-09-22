import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database, PostRow } from "./supabase";
import {
  createMarketingPublicSupabaseClient,
  getMarketingSupabaseEnv,
  hasMarketingSupabaseEnv,
} from "./marketing-supabase";

const publicPostStatuses: PostRow["status"][] = ["published", "scheduled"];
const publicMarketingPostScope = "altura_nova" as const;

function isPostPublic(post: PostRow) {
  if (!publicPostStatuses.includes(post.status)) {
    return false;
  }

  if (!post.publish_at) {
    return post.status === "published";
  }

  return new Date(post.publish_at).getTime() <= Date.now();
}

export async function createMarketingSupabaseServerClient() {
  if (!hasMarketingSupabaseEnv()) {
    return null;
  }

  const { url, anonKey } = getMarketingSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url!, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. Proxy handles refreshes.
        }
      },
    },
  });
}

export async function getMarketingLoggedInUser(): Promise<User | null> {
  const supabase = await createMarketingSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error ? null : user;
}

export async function getMarketingAdminPosts(): Promise<PostRow[]> {
  const supabase = await createMarketingSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("site_scope", publicMarketingPostScope)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch Altura Nova admin posts", error);
    return [];
  }

  return data ?? [];
}

export async function getPublishedMarketingPosts(): Promise<PostRow[]> {
  if (!hasMarketingSupabaseEnv()) {
    return [];
  }

  const supabase = createMarketingPublicSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("site_scope", publicMarketingPostScope)
    .in("status", [...publicPostStatuses])
    .order("publish_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch published Altura Nova posts", error);
    return [];
  }

  return (data ?? []).filter(isPostPublic);
}

export async function getPublishedMarketingPostBySlug(
  slug: string
): Promise<PostRow | null> {
  if (!hasMarketingSupabaseEnv()) {
    return null;
  }

  const supabase = createMarketingPublicSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("site_scope", publicMarketingPostScope)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(`Failed to fetch Altura Nova post for slug ${slug}`, error);
    }

    return null;
  }

  return isPostPublic(data) ? data : null;
}
