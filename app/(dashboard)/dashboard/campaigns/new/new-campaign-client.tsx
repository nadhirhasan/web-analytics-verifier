"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Chrome,
  ShoppingBag,
  Code,
  BarChart3,
  Zap,
  ChevronDown,
  Plus,
  Link2,
  Target,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Activity,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface Integration {
  id: string;
  platform_type: string;
  platform_name: string;
  status: string;
}

interface NewCampaignClientProps {
  integrations: Integration[];
  userId: string;
}

export default function NewCampaignClient({
  integrations,
  userId,
}: NewCampaignClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [selectedIntegration, setSelectedIntegration] = useState(integrations[0]?.id || "");
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");

  const platformIcons: Record<string, React.ReactNode> = {
    google_analytics: <Chrome className="w-5 h-5" />,
    shopify: <ShoppingBag className="w-5 h-5" />,
    woocommerce: <ShoppingBag className="w-5 h-5" />,
    javascript_pixel: <Code className="w-5 h-5" />,
    plausible: <BarChart3 className="w-5 h-5" />,
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integration_id: selectedIntegration,
          name: campaignName,
          description: campaignDescription,
        }),
      });
      if (!response.ok) throw new Error("Failed to create campaign");
      const data = await response.json();
      // Redirect to campaign dashboard or show shareable link
      router.push(`/dashboard/campaigns/${data.campaign.id}`);
    } catch (e) {
      alert("Failed to create campaign. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Create New Campaign</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className={step >= 1 ? "text-emerald-400" : ""}>1. Integration</span>
              <span>→</span>
              <span className={step >= 2 ? "text-emerald-400" : ""}>2. Details</span>
              <span>→</span>
              <span className={step >= 3 ? "text-emerald-400" : ""}>3. Goals</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Step 1: Select Integration */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Choose Integration</h2>
              <p className="text-slate-400">Select which platform to track for this campaign</p>
            </div>

            <div className="space-y-3">
              {integrations.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => setSelectedIntegration(integration.id)}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                    selectedIntegration === integration.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedIntegration === integration.id
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {platformIcons[integration.platform_type] || <Zap className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">{integration.platform_name}</div>
                      <div className="text-sm text-slate-400">
                        {integration.platform_type.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>
                    </div>
                  </div>
                  {selectedIntegration === integration.id && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New Integration
            </button>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedIntegration}
                className="px-8 py-3 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Campaign Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Campaign Details</h2>
              <p className="text-slate-400">Optionally add a description for this campaign. This will be visible on the public dashboard.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Instagram Promo Nov 2025"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              {/* Campaign Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  placeholder="Describe the campaign, e.g. 'Instagram influencer promo for Black Friday.'"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-20"
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-700 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!campaignName}
                className="px-8 py-3 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Campaign
              </button>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}
