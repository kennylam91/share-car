import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import DriverClient from "./DriverClient";

export default async function DriverPage() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Check if user has driver role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "driver") {
    redirect("/onboarding");
  }

  // Fetch initial posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profile:profiles(*)")
    .eq("post_type", "request")
    .order("created_at", { ascending: false });

  return <DriverClient initialPosts={posts || []} />;
}
