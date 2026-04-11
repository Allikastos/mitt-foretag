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
import { LOCAL_SEO_POSTS } from "./local-posts";

const publicPostStatuses = ["published", "scheduled"] as const;

function isPostPublic(post: PostRow) {
  if (!publicPostStatuses.includes(post.status)) {
    return false;
  }

  if (!post.publish_at) {
    return post.status === "published";
  }

  return new Date(post.publish_at).getTime() <= Date.now();
}

function mergePosts(primary: PostRow[], secondary: PostRow[]) {
  const bySlug = new Map<string, PostRow>();

  for (const post of secondary) {
    bySlug.set(post.slug, post);
  }

  for (const post of primary) {
    bySlug.set(post.slug, post);
  }

  return Array.from(bySlug.values()).sort((a, b) => {
    const aDate = new Date(a.publish_at ?? a.created_at).getTime();
    const bDate = new Date(b.publish_at ?? b.created_at).getTime();
    return bDate - aDate;
  });
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
    return LOCAL_SEO_POSTS;
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .in("status", [...publicPostStatuses])
    .order("publish_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch published posts", error);
    return LOCAL_SEO_POSTS;
  }

  const remotePosts = (data ?? []).filter(isPostPublic);
  return mergePosts(remotePosts, LOCAL_SEO_POSTS);
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<PostRow | null> {
  const localPost = LOCAL_SEO_POSTS.find((post) => post.slug === slug) ?? null;

  if (!hasSupabaseEnv()) {
    return localPost;
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

    return localPost;
  }

  if (isPostPublic(data)) {
    return data;
  }

  return localPost;
}
