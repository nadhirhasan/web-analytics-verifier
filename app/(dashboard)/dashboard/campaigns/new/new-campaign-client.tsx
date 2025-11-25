"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Form data
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [gaProperties, setGaProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState(integrations[0]?.id || "");
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");

  // Check if user just connected an integration
  useEffect(() => {
    const justConnected = searchParams.get('connected');
    if (justConnected && integrations.length > 0) {
      // Auto-select the most recent integration (first in list)
      const recentIntegration = integrations[0];
      setSelectedPlatform(recentIntegration.platform_type);
      setSelectedIntegration(recentIntegration.id);
      
      // If it's GA, fetch properties
      if (recentIntegration.platform_type === 'google_analytics') {
        fetchGAProperties(recentIntegration.id);
      } else {
        setStep(3); // Skip to campaign details for non-GA
      }
    }
  }, [searchParams, integrations]);

  const fetchGAProperties = async (integrationId: string) => {
    setLoadingProperties(true);
    try {
      const response = await fetch(`/api/integrations/${integrationId}/properties`);
      if (response.ok) {
        const data = await response.json();
        setGaProperties(data.properties || []);
        setStep(2); // Go to property selection
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handlePlatformSelect = async (platformType: string, integrationId: string) => {
    setSelectedPlatform(platformType);
    setSelectedIntegration(integrationId);
    
    if (platformType === 'google_analytics') {
      // Fetch GA properties
      await fetchGAProperties(integrationId);
    } else {
      // Skip to campaign details for non-GA platforms
      setStep(3);
    }
  };

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
          property_id: selectedProperty, // Include selected GA property
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
              <span className={step >= 1 ? "text-emerald-400" : ""}>1. Platform</span>
              <span>→</span>
              <span className={step >= 2 ? "text-emerald-400" : ""}>2. Property</span>
              <span>→</span>
              <span className={step >= 3 ? "text-emerald-400" : ""}>3. Details</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Step 1: Select Platform */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Choose Platform</h2>
              <p className="text-slate-400">Select which platform to track for this campaign</p>
            </div>

            <div className="space-y-3">
              {integrations.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => handlePlatformSelect(integration.platform_type, integration.id)}
                  disabled={loadingProperties}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                    selectedPlatform === integration.platform_type
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedPlatform === integration.platform_type
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {platformIcons[integration.platform_type] || <Zap className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">{integration.platform_name}</div>
                      <div className="text-sm text-slate-400">
                        {integration.platform_type === 'google_analytics' ? 'Select property in next step' : 'Ready to create campaign'}
                      </div>
                    </div>
                  </div>
                  {loadingProperties && selectedPlatform === integration.platform_type ? (
                    <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  ) : selectedPlatform === integration.platform_type ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : null}
                </button>
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard/integrations/google/connect?from=campaign')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New Platform
            </button>
          </div>
        )}

        {/* Step 2: Select GA Property */}
        {step === 2 && selectedPlatform === 'google_analytics' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Select GA4 Property</h2>
              <p className="text-slate-400">Choose which property this campaign will track</p>
            </div>

            {loadingProperties ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading properties...</p>
              </div>
            ) : gaProperties.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">No properties found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gaProperties.map((property) => (
                  <button
                    key={property.propertyId}
                    onClick={() => setSelectedProperty(property.propertyId)}
                    className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                      selectedProperty === property.propertyId
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedProperty === property.propertyId
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white mb-1">{property.displayName}</div>
                        <div className="text-xs text-slate-500">Property ID: {property.propertyId}</div>
                      </div>
                    </div>
                    {selectedProperty === property.propertyId && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-6">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedProperty("");
                }}
                className="px-6 py-3 border border-slate-700 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedProperty}
                className="px-8 py-3 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Campaign Details */}
        {step === 3 && (
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
                onClick={() => setStep(selectedPlatform === 'google_analytics' ? 2 : 1)}
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
