import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import PassengerClient from "./PassengerClient";

export default async function PassengerPage() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Check if user has passenger role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "passenger") {
    redirect("/onboarding");
  }

  // Fetch initial posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profile:profiles(*)")
    .eq("post_type", "offer")
    .order("created_at", { ascending: false });

  return <PassengerClient initialPosts={posts || []} />;
}
