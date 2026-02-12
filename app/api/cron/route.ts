import { normalizeFacebookUrl } from "@/lib/url-utils";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { detectPostOwner } from "@/lib/post-owner-detector";
import { group } from "node:console";

const RAPIDAPI_HOST = "facebook-scraper3.p.rapidapi.com";
const getRapidApiUrl = (groupId: string) =>
  `https://facebook-scraper3.p.rapidapi.com/group/posts?group_id=${groupId}&sorting_order=CHRONOLOGICAL`;

export async function GET() {
  console.log("Start cron job to fetch Facebook group posts");
  const apiKey = process.env.NEXT_RAPID_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RAPIDAPI_KEY environment variable is not set" },
      { status: 500 },
    );
  }

  const groups: string[] = [
    "142026696530246",
    "425656831260435",
    "1825313404533366",
    "280799584362930",
  ];
  let createdPostsNo = 0;
  groups.forEach(async (group) => {
    const res = await fetch(getRapidApiUrl(group), {
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
      let anonymousUserId: string | null =
        process.env.NEXT_ANONYMOUS_USER_ID ?? null;

      if (!anonymousUserId) {
        console.error(
          "No anonymous user found and NEXT_ANONYMOUS_USER_ID not set. Skipping inserts.",
        );
      }

      for (const post of data.posts as any[]) {
        // bypass missing message post
        if (!post.message) {
          continue;
        }

        const newPost = {
          details: post.message ?? null,
          contact_facebook_url: normalizeFacebookUrl(post.author?.url) ?? null,
          // Populate nullable columns explicitly; user_id must be a valid admin id
          post_type: detectPostOwner(post.message),
          routes: null,
          user_id: anonymousUserId,
        };

        try {
          const { error: insertError } = await supabase
            .from("posts")
            .insert(newPost);
          if (insertError) {
            // Log and continue with next post
            console.error("Failed to insert post:", insertError);
          } else {
            createdPostsNo++;
          }
        } catch (err) {
          console.error("Unexpected error inserting post:", err);
        }
      }
    }
  });

  console.log(`Cron job completed. Created ${createdPostsNo} new posts.`);

  return NextResponse.json(null);
}
