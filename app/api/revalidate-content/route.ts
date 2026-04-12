import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/src/lib/supabase-server";

type RevalidateRequest = {
  slug?: string;
};

export async function POST(request: Request) {
  const user = await getLoggedInUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RevalidateRequest = {};

  try {
    body = (await request.json()) as RevalidateRequest;
  } catch {
    body = {};
  }

  revalidatePath("/blogg");
  revalidatePath("/blogg/[slug]", "page");
  revalidatePath("/sitemap.xml");

  if (body.slug) {
    revalidatePath(`/blogg/${body.slug}`);
  }

  return NextResponse.json({
    ok: true,
    slug: body.slug ?? null,
    revalidatedAt: new Date().toISOString(),
  });
}
