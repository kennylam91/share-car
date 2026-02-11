import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", sessionData.session.user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { display_name, phone, facebook_url, zalo_url } = body;

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (display_name !== undefined) {
      updateData.display_name = display_name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }

    if (facebook_url !== undefined) {
      const v = (facebook_url || "").trim();
      if (v === "") {
        updateData.facebook_url = null;
      } else {
        if (!/^https?:\/\//i.test(v)) {
          const facebookUrlInvalidMessage =
            "facebook_url phải là một URL đầy đủ bắt đầu với http:// hoặc https://";
          return NextResponse.json(
            {
              error: facebookUrlInvalidMessage,
            },
            { status: 400 },
          );
        }
        updateData.facebook_url = v;
      }
    }

    if (zalo_url !== undefined) {
      const v = (zalo_url || "").trim();
      if (v === "") {
        updateData.zalo_url = null;
      } else {
        if (!/^https?:\/\//i.test(v)) {
          return NextResponse.json(
            {
              error:
                "zalo_url phải là một URL đầy đủ bắt đầu với http:// hoặc https://",
            },
            { status: 400 },
          );
        }
        updateData.zalo_url = v;
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", sessionData.session.user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
