import { normalizeFacebookUrl } from "@/lib/url-utils";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { detectPostOwner } from "@/lib/post-owner-detector";

const RAPIDAPI_HOST = "facebook-scraper3.p.rapidapi.com";
const getRapidApiUrl = (groupId: string) =>
  `https://facebook-scraper3.p.rapidapi.com/group/posts?group_id=${groupId}&sorting_order=CHRONOLOGICAL`;

export async function GET() {
  const startTime = Date.now();
  console.log("=== Start cron job to fetch Facebook group posts ===");

  const apiKey = process.env.NEXT_RAPID_API_KEY;
  if (!apiKey) {
    console.error("❌ NEXT_RAPID_API_KEY environment variable is not set");
    return NextResponse.json(
      { error: "RAPIDAPI_KEY environment variable is not set" },
      { status: 500 },
    );
  }
  console.log("✓ API key found");

  // Check Supabase credentials early
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const NEXT_PUBLIC_SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const anonymousUserId = process.env.NEXT_ANONYMOUS_USER_ID ?? null;

  if (!SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error(
      "❌ Supabase credentials not configured. Cannot persist posts.",
    );
    return NextResponse.json(
      { error: "Supabase credentials missing" },
      { status: 500 },
    );
  }
  console.log("✓ Supabase credentials found");

  if (!anonymousUserId) {
    console.error("❌ NEXT_ANONYMOUS_USER_ID not set. Cannot create posts.");
    return NextResponse.json(
      { error: "NEXT_ANONYMOUS_USER_ID not set" },
      { status: 500 },
    );
  }
  console.log(`✓ Anonymous user ID: ${anonymousUserId}`);

  const supabase = createClient(SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const groups: string[] = [
    "142026696530246",
    "425656831260435",
    "1825313404533366",
    "280799584362930",
  ];

  console.log(`📋 Processing ${groups.length} Facebook groups`);

  let totalCreatedPosts = 0;
  let totalFetchedPosts = 0;
  let totalSkippedPosts = 0;
  let totalFailedInserts = 0;
  const groupResults: any[] = [];

  // Use for...of instead of forEach to properly await async operations
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const groupStartTime = Date.now();
    console.log(
      `\n--- Processing group ${i + 1}/${groups.length}: ${group} ---`,
    );

    try {
      const url = getRapidApiUrl(group);
      console.log(`📡 Fetching from: ${url}`);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": apiKey,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ API request failed for group ${group}:`, {
          status: res.status,
          statusText: res.statusText,
          body: text.substring(0, 500), // Limit log size
        });
        groupResults.push({
          group,
          status: "failed",
          error: `API returned ${res.status}`,
        });
        continue;
      }

      const data = await res.json();
      console.log(`📦 API response structure:`, {
        hasPosts: "posts" in data,
        dataType: typeof data,
        keys: data ? Object.keys(data) : [],
      });

      if (!data || typeof data !== "object" || !("posts" in data)) {
        console.warn(
          `⚠️ Unexpected response format for group ${group} - no 'posts' field`,
        );
        groupResults.push({
          group,
          status: "no_posts_field",
        });
        continue;
      }

      const posts = data.posts as any[];
      const postsCount = Array.isArray(posts) ? posts.length : 0;
      console.log(`📬 Received ${postsCount} posts from group ${group}`);
      totalFetchedPosts += postsCount;

      if (postsCount === 0) {
        console.log(`ℹ️ No posts to process for group ${group}`);
        groupResults.push({
          group,
          status: "success",
          fetched: 0,
          created: 0,
          skipped: 0,
          failed: 0,
        });
        continue;
      }

      let groupCreated = 0;
      let groupSkipped = 0;
      let groupFailed = 0;

      for (let j = 0; j < posts.length; j++) {
        const post = posts[j];

        // Skip posts without message
        if (!post.message) {
          groupSkipped++;
          console.log(`  ⊘ Post ${j + 1}/${postsCount}: Skipped (no message)`);
          continue;
        }

        const postType = detectPostOwner(post.message);
        const authorUrl = post.author?.url;

        console.log(
          `  📝 Post ${j + 1}/${postsCount}: type=${postType}, author=${authorUrl || "none"}, message_length=${post.message.length}`,
        );

        const newPost = {
          details: post.message,
          contact_facebook_url: normalizeFacebookUrl(authorUrl) ?? null,
          post_type: postType,
          routes: null,
          user_id: anonymousUserId,
        };

        try {
          const { error: insertError } = await supabase
            .from("posts")
            .insert(newPost);

          if (insertError) {
            groupFailed++;
            console.error(
              `  ❌ Failed to insert post ${j + 1}/${postsCount}:`,
              {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
              },
            );
          } else {
            groupCreated++;
            console.log(
              `  ✓ Post ${j + 1}/${postsCount}: Created successfully`,
            );
          }
        } catch (err) {
          groupFailed++;
          console.error(
            `  ❌ Unexpected error inserting post ${j + 1}/${postsCount}:`,
            err,
          );
        }
      }

      totalCreatedPosts += groupCreated;
      totalSkippedPosts += groupSkipped;
      totalFailedInserts += groupFailed;

      const groupDuration = Date.now() - groupStartTime;
      console.log(`✓ Group ${group} completed in ${groupDuration}ms:`, {
        fetched: postsCount,
        created: groupCreated,
        skipped: groupSkipped,
        failed: groupFailed,
      });

      groupResults.push({
        group,
        status: "success",
        fetched: postsCount,
        created: groupCreated,
        skipped: groupSkipped,
        failed: groupFailed,
        duration: groupDuration,
      });
    } catch (err) {
      console.error(`❌ Unexpected error processing group ${group}:`, err);
      groupResults.push({
        group,
        status: "error",
        error: String(err),
      });
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log("\n=== Cron job completed ===");
  console.log(`⏱️  Total duration: ${totalDuration}ms`);
  console.log(`📊 Summary:`, {
    groups_processed: groups.length,
    total_fetched: totalFetchedPosts,
    total_created: totalCreatedPosts,
    total_skipped: totalSkippedPosts,
    total_failed: totalFailedInserts,
  });
  console.log(`📋 Per-group results:`, groupResults);

  return NextResponse.json({
    success: true,
    stats: {
      groups_processed: groups.length,
      total_fetched: totalFetchedPosts,
      total_created: totalCreatedPosts,
      total_skipped: totalSkippedPosts,
      total_failed: totalFailedInserts,
      duration_ms: totalDuration,
    },
    groups: groupResults,
  });
}
