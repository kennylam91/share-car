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
  let profile = null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    if (error) {
      console.error("Error fetching profile:", error);

      // If JWT expired or auth error, clear session and redirect to login
      if (error.code === "PGRST301" || error.code === "PGRST303") {
        await supabase.auth.signOut();
        redirect("/auth/login");
      }

      // For other errors, redirect to onboarding to be safe
      redirect("/onboarding");
    }
    profile = data;
  } catch (err) {
    console.error("Unexpected error fetching profile:", err);
  }

  console.log("User profile:", profile);

  if (!profile || !profile.role) {
    redirect("/onboarding");
  }

  // Redirect to appropriate dashboard based on role
  if (profile.role === "admin") {
    redirect("/admin");
  } else if (profile.role === "driver") {
    redirect("/driver");
  } else {
    console.log("Redirecting to passenger dashboard");
    redirect("/passenger");
  }
}
