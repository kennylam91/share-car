import { normalizeFacebookUrl } from "@/lib/url-utils";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const RAPIDAPI_HOST = "facebook-scraper3.p.rapidapi.com";
const RAPIDAPI_URL =
  "https://facebook-scraper3.p.rapidapi.com/group/posts?group_id=142026696530246&sorting_order=CHRONOLOGICAL";

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RAPIDAPI_KEY environment variable is not set" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(RAPIDAPI_URL, {
      method: "GET",
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Upstream request failed", status: res.status, body: text },
        { status: 502 },
      );
    }

    const data = await res.json();

    // Ensure we always return an object containing `posts` as requested by the caller.
    // If the upstream response already contains posts, return it directly.
    if (data && typeof data === "object" && "posts" in data) {
      // If service role credentials are present, persist posts using service client.
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const NEXT_PUBLIC_SUPABASE_ANON_KEY =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // If no service role key, skip persistence and return the data.
      if (!SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return NextResponse.json(null);
      }

      const supabase = createClient(
        SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
      // Find an admin user to own the inserted posts. Fallback to env var SUPABASE_CRAWLER_USER_ID.
      let adminUserId: string | null = null;
      try {
        const { data: admins, error: adminErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .limit(1);

        if (adminErr) {
          console.error("Error querying admin profile:", adminErr);
        } else if (Array.isArray(admins) && admins.length > 0) {
          // @ts-ignore - admins[0].id is expected
          adminUserId = admins[0].id;
        }
      } catch (err) {
        console.error("Unexpected error fetching admin user:", err);
      }

      if (!adminUserId) {
        // Allow overriding with an explicit env var (useful for CI / deployments)
        adminUserId = process.env.SUPABASE_CRAWLER_USER_ID || null;
      }

      if (!adminUserId) {
        console.error(
          "No admin user found and SUPABASE_CRAWLER_USER_ID not set. Skipping inserts.",
        );
        return NextResponse.json(
          {
            error:
              "No admin user available to own posts. Set SUPABASE_CRAWLER_USER_ID or create an admin.",
          },
          { status: 500 },
        );
      }

      for (const post of data.posts as any[]) {
        const newPost = {
          details: post.message ?? null,
          contact_facebook_url: normalizeFacebookUrl(post.author?.url) ?? null,
          // Populate nullable columns explicitly; user_id must be a valid admin id
          post_type: null,
          routes: null,
          user_id: adminUserId,
        };

        try {
          const { error: insertError } = await supabase
            .from("posts")
            .insert(newPost);
          if (insertError) {
            // Log and continue with next post
            console.error("Failed to insert post:", insertError);
          }
        } catch (err) {
          console.error("Unexpected error inserting post:", err);
        }
      }

      return NextResponse.json(null);
    }

    // Fallback: wrap the response in a posts array if shape differs.
    return NextResponse.json({ posts: Array.isArray(data) ? data : [data] });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Request failed", message: String(err) },
      { status: 500 },
    );
  }
}
