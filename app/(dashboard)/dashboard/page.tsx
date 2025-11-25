import { getUser } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  const supabase = await createClient();

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch campaigns
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch integrations (GA, Shopify, etc.)
  const { data: integrations } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      user={user}
      profile={profile}
      campaigns={campaigns || []}
      integrations={integrations || []}
    />
  );
}
