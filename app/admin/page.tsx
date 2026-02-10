import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/onboarding");
  }

  return <AdminClient />;
}
