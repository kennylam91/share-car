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

    // Get passenger count
    const { count: passengerCount, error: passengerError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "passenger");

    if (passengerError) {
      console.error("Error fetching passenger count:", passengerError);
    }

    // Get driver count
    const { count: driverCount, error: driverError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "driver");

    if (driverError) {
      console.error("Error fetching driver count:", driverError);
    }

    // Get total posts count
    const { count: postsCount, error: postsError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    if (postsError) {
      console.error("Error fetching posts count:", postsError);
    }

    return NextResponse.json({
      stats: {
        passengers: passengerCount || 0,
        drivers: driverCount || 0,
        totalPosts: postsCount || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
