import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  // Clear the session cookies
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();

  // Clear the session cookies
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
