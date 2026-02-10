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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user?.identities?.length === 0) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 400 },
    );
  }

  // If email confirmation is disabled, session will be available immediately
  if (data.session) {
    const cookieStore = await cookies();

    cookieStore.set({
      name: "sb-access-token",
      value: data.session.access_token,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set({
      name: "sb-refresh-token",
      value: data.session.refresh_token,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully!",
      user: data.user,
      autoLogin: true,
    });
  }

  return NextResponse.json({
    success: true,
    message: "Check your email to confirm your account!",
    user: data.user,
    autoLogin: false,
  });
}
