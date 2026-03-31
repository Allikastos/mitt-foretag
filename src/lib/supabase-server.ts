import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  createPublicSupabaseClient,
  getSupabaseEnv,
  hasSupabaseEnv,
  type Database,
  type PostRow,
} from "./supabase";

function isPostPublic(post: PostRow) {
  if (post.status !== "published") {
    return false;
  }

  if (!post.publish_at) {
    return true;
  }

  return new Date(post.publish_at).getTime() <= Date.now();
}

export async function createSupabaseServerClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const { url, anonKey } = getSupabaseEnv();
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

export async function getSupabaseSession(): Promise<Session | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function getLoggedInUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function getAdminPosts(): Promise<PostRow[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin posts", error);
    return [];
  }

  return data ?? [];
}

export async function getPublishedPosts(): Promise<PostRow[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("publish_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch published posts", error);
    return [];
  }

  return (data ?? []).filter(isPostPublic);
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<PostRow | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(`Failed to fetch post for slug ${slug}`, error);
    }

    return null;
  }

  return isPostPublic(data) ? data : null;
}
