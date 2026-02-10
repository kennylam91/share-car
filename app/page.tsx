import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { log } from "node:console";

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("Session on home page:", session);

  if (!session) {
    redirect("/auth/login");
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  console.log("User profile:", profile);

  if (!profile || !profile.role) {
    redirect("/onboarding");
  }

  // Redirect to appropriate dashboard based on role
  if (profile.role === "driver") {
    redirect("/driver");
  } else {
    console.log("Redirecting to passenger dashboard");
    redirect("/passenger");
  }
}
