import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type WebhookPayload = {
  _type?: string;
  _id?: string;
  slug?: string | { current?: string }; // we normalize this below
};

export async function POST(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get("secret");
    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as WebhookPayload;

    // Normalize slug to a string if provided
    const rawSlug = (typeof body.slug === "string" ? body.slug : body.slug?.current) || "";

    // Always revalidate these core pages
    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/sitemap.xml");

    // If we know the changed doc type/slug, revalidate its paths too
    if (body._type === "post" && rawSlug) {
      revalidatePath(`/posts/${rawSlug}`);
    }
    if (body._type === "pillar" && rawSlug) {
      revalidatePath(`/pillars/${rawSlug}`);
    }

    return NextResponse.json({ ok: true, type: body._type, slug: rawSlug });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Unknown error" }, { status: 500 });
  }
}
