import { normalizeFacebookUrl } from "@/lib/url-utils";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { detectPostOwner } from "@/lib/post-owner-detector";

type FromApi = "facebook-scraper3" | "facebook-scraper-api4";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromApi = searchParams.get("from"); // facebook-scraper3 | facebook-scraper-api4
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

  const anonymousUserId = process.env.NEXT_ANONYMOUS_USER_ID;

  // const groups: string[] = [
  //   "142026696530246",
  //   "425656831260435",
  //   "1825313404533366",
  //   "280799584362930",
  // ];
  const groups: string[] = ["1825313404533366"];

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
      const res = await fetchFbPosts(fromApi as FromApi, group);

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

      const resData = await res.json();

      const fbPosts = extractPosts(fromApi as FromApi, resData);
      const postsCount = Array.isArray(fbPosts) ? fbPosts.length : 0;
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

      for (let j = 0; j < fbPosts.length; j++) {
        const fbPost = fbPosts[j];

        const newPost = buildPostEntity(
          fromApi as FromApi,
          fbPost,
          anonymousUserId!,
        );

        // Skip posts without message
        if (!newPost.details) {
          groupSkipped++;
          console.log(`  ⊘ Post ${j + 1}/${postsCount}: Skipped (no message)`);
          continue;
        }

        try {
          const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const NEXT_PUBLIC_SUPABASE_ANON_KEY =
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

          const supabase = createClient(
            SUPABASE_URL!,
            NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );
          const { error: insertError } = await supabase
            .from("posts")
            .insert(newPost);

          if (insertError) {
            // Check for unique violation (duplicate facebook_id)
            if (
              insertError.code === "23505" ||
              (insertError.message &&
                insertError.message.includes("idx_posts_facebook_id"))
            ) {
              groupSkipped++;
              console.log(
                `  ⊘ Post ${j + 1}/${postsCount}: Skipped (duplicate facebook_id)`,
              );
            } else {
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
            }
          } else {
            groupCreated++;
            console.log(
              `  ✓ Post ${j + 1}/${postsCount}: Created successfully`,
            );
          }
        } catch (err: any) {
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
      groupResults.push({ group, status: "error", error: String(err) });
    }
  }

  const totalDuration = Date.now() - startTime;
  reportCronJobResults(
    totalDuration,
    groups,
    totalFetchedPosts,
    totalCreatedPosts,
    totalSkippedPosts,
    totalFailedInserts,
    groupResults,
  );

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
function fetchFbPosts(fromApi: FromApi, groupId: string) {
  let url = "";
  let host = "";

  switch (fromApi) {
    case "facebook-scraper3":
      url = `https://facebook-scraper3.p.rapidapi.com/group/posts?group_id=${groupId}&sorting_order=CHRONOLOGICAL`;
      host = "facebook-scraper3.p.rapidapi.com";
      break;

    case "facebook-scraper-api4":
      url = `https://facebook-scraper-api4.p.rapidapi.com/get_facebook_group_posts_details_from_id?group_id=${groupId}`;
      host = "facebook-scraper-api4.p.rapidapi.com";
      break;
  }

  console.log(`📡 Fetching from: ${url}`);
  const apiKey = process.env.NEXT_RAPID_API_KEY;
  return fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-host": host!,
      "x-rapidapi-key": apiKey!,
    },
  });
}

function buildPostEntity(
  fromApi: FromApi,
  fbPost: any,
  anonymousUserId: string,
) {
  switch (fromApi) {
    case "facebook-scraper3":
      return {
        details: fbPost.message,
        contact_facebook_url: normalizeFacebookUrl(fbPost.author?.url) ?? null,
        post_type: detectPostOwner(fbPost.message),
        routes: null,
        user_id: anonymousUserId,
        facebook_url: fbPost.url ?? null,
        facebook_id: fbPost.post_id ?? null,
      };
    case "facebook-scraper-api4":
      return {
        details: fbPost.values?.text,
        contact_facebook_url: fbPost.user_details.profile_url,
        post_type: detectPostOwner(fbPost.values?.text),
        routes: null,
        user_id: anonymousUserId,
        facebook_url: fbPost.details.post_link,
        facebook_id: fbPost.details.post_id,
      };
  }
}

function reportCronJobResults(
  totalDuration: number,
  groups: string[],
  totalFetchedPosts: number,
  totalCreatedPosts: number,
  totalSkippedPosts: number,
  totalFailedInserts: number,
  groupResults: any[],
) {
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
}
function extractPosts(fromApi: FromApi, resData: any) {
  switch (fromApi) {
    case "facebook-scraper3":
      return resData.posts;
    case "facebook-scraper-api4":
      return resData.data.posts;
  }
}
