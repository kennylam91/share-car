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
    const time = searchParams.get("time") || "today"; // 'today' or 'last_2_days'

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

    let now = new Date();
    let fromTime;
    if (time === "last_2_days") {
      fromTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else {
      fromTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    let query = supabase
      .from("posts")
      .select("*, profile:profiles(*)")
      .gte("created_at", fromTime.toISOString())
      .order("created_at", { ascending: false });

    if (type) {
      // include posts that have the requested type OR have no post_type (NULL or empty string)
      query = query.or(`post_type.eq.${type},post_type.is.null`);
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    let userId: string | null = null;

    if (accessToken && refreshToken) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (sessionError || !sessionData.session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      userId = sessionData.session.user.id;
    } else {
      userId = process.env.NEXT_ANONYMOUS_USER_ID || null;
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
      user_id: userId,
      post_type,
      routes,
      details: details.trim(),
    };

    let hasContactInfo = false;

    if (contact_phone !== undefined) {
      const trimmed = (contact_phone || "").trim();
      if (trimmed) {
        hasContactInfo = true;
        insertObj.contact_phone = trimmed;
      } else {
        insertObj.contact_phone = null;
      }
    }

    const validateUrlField = (
      value: string | undefined,
      fieldName: string,
      targetKey: string,
    ) => {
      const trimmed = (value || "").trim();
      if (value === undefined) {
        return null;
      }
      if (trimmed === "") {
        insertObj[targetKey] = null;
        return null;
      }
      if (!/^https?:\/\//i.test(trimmed)) {
        throw new Error(
          `${fieldName} must be a full URL starting with http:// or https://`,
        );
      }
      hasContactInfo = true;
      insertObj[targetKey] = trimmed;
      return null;
    };

    try {
      validateUrlField(
        contact_facebook_url,
        "contact_facebook_url",
        "contact_facebook_url",
      );
      validateUrlField(
        contact_zalo_url,
        "contact_zalo_url",
        "contact_zalo_url",
      );
    } catch (validationError: any) {
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 },
      );
    }

    if (userId === null && !hasContactInfo) {
      return NextResponse.json(
        { error: "Anonymous posts must include at least one contact method" },
        { status: 400 },
      );
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
