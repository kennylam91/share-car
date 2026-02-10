import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user already has a role set
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // If user already has a role, redirect to their dashboard
  if (profile?.role) {
    redirect(profile.role === "driver" ? "/driver" : "/passenger");
  }

  return (
    <OnboardingClient
      userId={user.id}
      email={user.email!}
      name={user.user_metadata?.name || user.email!}
      avatarUrl={user.user_metadata?.avatar_url}
    />
  );
}
