import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isStaleRefreshTokenError,
  isSupabaseAuthCookieName,
} from "@/src/lib/supabase-auth-cookies";

const hubSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const hubSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const marketingSupabaseUrl = process.env.NEXT_PUBLIC_MARKETING_SUPABASE_URL;
const marketingSupabaseAnonKey =
  process.env.NEXT_PUBLIC_MARKETING_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_MARKETING_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_MARKETING_SUPABASE_PUBLISHABLE_KEY;

function getSupabaseProjectRef(url: string) {
  return new URL(url).hostname.split(".")[0];
}

function clearStaleAuthCookies(
  request: NextRequest,
  response: NextResponse,
  projectRef: string
) {
  for (const { name } of request.cookies.getAll()) {
    if (!isSupabaseAuthCookieName(name) || !name.startsWith(`sb-${projectRef}-`)) {
      continue;
    }

    request.cookies.delete(name);
    response.cookies.set(name, "", {
      expires: new Date(0),
      maxAge: 0,
      path: "/",
    });
  }

  response.headers.set("Cache-Control", "private, no-store");
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const isMarketingAdmin = request.nextUrl.pathname.startsWith("/admin");
  const supabaseUrl = isMarketingAdmin ? marketingSupabaseUrl : hubSupabaseUrl;
  const supabaseAnonKey = isMarketingAdmin
    ? marketingSupabaseAnonKey
    : hubSupabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const projectRef = getSupabaseProjectRef(supabaseUrl);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(cacheHeaders).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  try {
    const { error } = await supabase.auth.getUser();
    if (isStaleRefreshTokenError(error)) {
      clearStaleAuthCookies(request, response, projectRef);
    }
  } catch (error) {
    if (!isStaleRefreshTokenError(error)) throw error;
    clearStaleAuthCookies(request, response, projectRef);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/hub/:path*"],
};
