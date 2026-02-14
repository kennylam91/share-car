import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.session) {
    const cookieStore = await cookies();

    // Set the session cookies
    cookieStore.set({
      name: "sb-access-token",
      value: data.session.access_token,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour
    });

    cookieStore.set({
      name: "sb-refresh-token",
      value: data.session.refresh_token,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour
    });

    return NextResponse.json({ success: true, user: data.user });
  }

  return NextResponse.json({ error: "Login failed" }, { status: 400 });
}
