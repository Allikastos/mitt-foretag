"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSupabaseBrowserClient,
  hasSupabaseEnv,
} from "@/src/lib/supabase";

export function HubSignOutButton({
  compact = false,
  isCollapsed = false,
}: {
  compact?: boolean;
  isCollapsed?: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    try {
      if (hasSupabaseEnv()) {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      }

      router.replace("/hub/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className={
        compact
          ? isCollapsed
            ? "flex h-11 w-full items-center justify-center rounded-[1rem] text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            : "text-sm text-white/72 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          : "inline-flex min-h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#0B0B0C] shadow-[0_14px_32px_-28px_rgba(0,0,0,0.28)] transition duration-200 hover:border-black/15 hover:bg-[#F7F7F5] disabled:cursor-not-allowed disabled:opacity-60"
      }
      title={compact && isCollapsed ? "Logga ut" : undefined}
    >
      {isLoading ? "Loggar ut..." : compact && isCollapsed ? "UT" : "Logga ut"}
    </button>
  );
}
