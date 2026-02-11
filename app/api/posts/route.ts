import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'offer' or 'request'
    const route = searchParams.get("route");
    const isPublic = searchParams.get("public") === "true";

    // Create a public Supabase client for unauthenticated requests
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // If not public request, verify authentication
    if (!isPublic) {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("sb-access-token")?.value;
      const refreshToken = cookieStore.get("sb-refresh-token")?.value;

      if (!accessToken || !refreshToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    let query = supabase
      .from("posts")
      .select("*, profile:profiles(*)")
      .order("created_at", { ascending: false });

    if (type) {
      query = query.eq("post_type", type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    let posts = data || [];

    // Filter by route if specified
    if (route && route !== "all") {
      posts = posts.filter(
        (post: any) => post.routes && post.routes.includes(route),
      );
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const insertObj: any = {
      user_id: sessionData.session.user.id,
      post_type,
      routes,
      details: details.trim(),
    };

    if (contact_phone !== undefined) {
      insertObj.contact_phone = (contact_phone || "").trim() || null;
    }

    if (contact_facebook_url !== undefined) {
      const v = (contact_facebook_url || "").trim();
      if (v === "") {
        insertObj.contact_facebook_url = null;
      } else {
        if (!/^https?:\/\//i.test(v)) {
          return NextResponse.json(
            {
              error:
                "contact_facebook_url must be a full URL starting with http:// or https://",
            },
            { status: 400 },
          );
        }
        insertObj.contact_facebook_url = v;
      }
    }

    if (contact_zalo_url !== undefined) {
      const v = (contact_zalo_url || "").trim();
      if (v === "") {
        insertObj.contact_zalo_url = null;
      } else {
        if (!/^https?:\/\//i.test(v)) {
          return NextResponse.json(
            {
              error:
                "contact_zalo_url must be a full URL starting with http:// or https://",
            },
            { status: 400 },
          );
        }
        insertObj.contact_zalo_url = v;
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .insert(insertObj)
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
