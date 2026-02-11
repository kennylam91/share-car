import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import HomeClient from "./HomeClient";
import { createClient } from "@supabase/supabase-js";

const LABEL = {
  session_on_home_page: "Phiên trên trang chủ:",
  error_fetching_profile: "Lỗi khi lấy hồ sơ:",
  unexpected_error_fetching_profile: "Lỗi không mong muốn khi lấy hồ sơ:",
  user_profile: "Hồ sơ người dùng:",
  redirecting_to_passenger: "Đang chuyển hướng tới trang hành khách",
};

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log(LABEL.session_on_home_page, session);

  // If user is authenticated, redirect them to their dashboard
  if (session) {
    // Check if user has completed onboarding
    let profile = null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (error) {
        console.error(LABEL.error_fetching_profile, error);

        // If JWT expired or auth error, clear session and redirect to login
        if (error.code === "PGRST301" || error.code === "PGRST303") {
          await supabase.auth.signOut();
          // Continue to show public page
        } else {
          // For other errors, redirect to onboarding to be safe
          redirect("/onboarding");
        }
      } else {
        profile = data;
      }
    } catch (err) {
      console.error(LABEL.unexpected_error_fetching_profile, err);
    }

    console.log(LABEL.user_profile, profile);

    if (profile?.role) {
      // Redirect to appropriate dashboard based on role
      if (profile.role === "admin") {
        redirect("/admin");
      } else if (profile.role === "driver") {
        redirect("/driver");
      } else {
        console.log(LABEL.redirecting_to_passenger);
        redirect("/passenger");
      }
    } else if (session) {
      // Has session but no role, redirect to onboarding
      redirect("/onboarding");
    }
  }

  // Fetch public driver posts for unauthenticated users
  const publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: posts } = await publicSupabase
    .from("posts")
    .select("*, profile:profiles(*)")
    .eq("post_type", "offer")
    .order("created_at", { ascending: false });

  return <HomeClient initialPosts={posts || []} isAuthenticated={!!session} />;
}
