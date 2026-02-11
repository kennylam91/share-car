import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", sessionData.session.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const {
      post_type,
      routes,
      details,
      contact_phone,
      contact_facebook_url,
      contact_zalo_url,
    } = await request.json();

    if (!post_type || !routes || !details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Normalize incoming contact fields and coerce empty strings to null
    const phone =
      typeof contact_phone === "string" ? contact_phone.trim() || null : null;
    const facebook =
      typeof contact_facebook_url === "string"
        ? contact_facebook_url.trim() || null
        : null;
    const zalo =
      typeof contact_zalo_url === "string"
        ? contact_zalo_url.trim() || null
        : null;

    // Admin creates posts using their own user ID (will be displayed as anonymous)
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: sessionData.session.user.id,
        post_type,
        routes,
        details: details.trim(),
        contact_phone: phone,
        contact_facebook_url: facebook,
        contact_zalo_url: zalo,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ post: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
