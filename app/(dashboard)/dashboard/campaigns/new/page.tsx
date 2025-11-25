import { getUser } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewCampaignClient from "./new-campaign-client";

export default async function NewCampaignPage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  const supabase = await createClient();

  // Fetch user's integrations
  const { data: integrations } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // If no integrations, redirect to dashboard
  if (!integrations || integrations.length === 0) {
    redirect("/dashboard?connect=true");
  }

  return <NewCampaignClient integrations={integrations} userId={user.id} />;
}
