import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GooglePropertiesClient from "./properties-client";

export default async function GooglePropertiesPage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  const supabase = await createClient();

  // Fetch OAuth session data
  const { data: sessionData, error } = await supabase
    .from("oauth_temp_sessions")
    .select("session_data")
    .eq("user_id", user.id)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !sessionData) {
    console.error("No valid OAuth session found:", error);
    redirect("/dashboard/integrations/google/connect?error=session_expired");
  }

  const { properties, access_token, refresh_token, expires_in } = sessionData.session_data;

  if (!properties || properties.length === 0) {
    redirect("/dashboard?error=no_properties_found");
  }

  return (
    <GooglePropertiesClient 
      properties={properties} 
      userId={user.id}
      accessToken={access_token}
      refreshToken={refresh_token}
      expiresIn={expires_in}
    />
  );
}
