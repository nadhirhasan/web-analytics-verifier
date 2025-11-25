import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SharePageClient from "./share-client";

export default async function PublicSharePage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Fetch campaign by shareable token
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*, integrations(*)")
    .eq("shareable_token", token)
    .single();

  if (error || !campaign) {
    notFound();
  }

  return <SharePageClient campaign={campaign} token={token} />;
}
