import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function PublicSharePage({ params }: { params: { token: string } }) {
  const supabase = await createClient();

  // Fetch campaign by shareable token
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*, integrations(*)")
    .eq("shareable_token", params.token)
    .single();

  if (error || !campaign) {
    notFound();
  }

  // Fetch real-time metrics from Google Analytics Data API (to be implemented)
  // For now, show a placeholder

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-slate-400 mb-4">{campaign.description}</p>
        )}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-xs font-medium">
            Connected Platform: {campaign.integrations?.platform_name || "Google Analytics"}
          </span>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Live Analytics</h2>
          <div className="text-slate-400 mb-2">(Google Analytics data will appear here)</div>
          {/* TODO: Replace with real metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-900 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-emerald-400">--</span>
              <span className="text-xs text-slate-400 mt-1">Visitors (24h)</span>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-emerald-400">--</span>
              <span className="text-xs text-slate-400 mt-1">Avg. Session Duration</span>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-emerald-400">--</span>
              <span className="text-xs text-slate-400 mt-1">Bounce Rate</span>
            </div>
          </div>
        </div>
        <div className="text-center text-slate-500 text-xs mt-8">
          Powered by Web Analytics Verifier • Real-time data from Google Analytics
        </div>
      </div>
    </div>
  );
}
