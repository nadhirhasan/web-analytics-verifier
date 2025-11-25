"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Chrome,
  CheckCircle2,
  Globe,
  TrendingUp,
  BarChart3,
  Search,
} from "lucide-react";

interface Property {
  id: string;
  displayName: string;
  propertyId: string;
  websiteUrl: string;
}

interface GooglePropertiesClientProps {
  properties: Property[];
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export default function GooglePropertiesClient({
  properties,
  userId,
  accessToken,
  refreshToken,
  expiresIn,
}: GooglePropertiesClientProps) {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const filteredProperties = properties.filter(
    (property) =>
      property.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = async () => {
    if (!selectedProperty) return;
    
    setIsConnecting(true);

    const selectedPropertyData = properties.find((p) => p.id === selectedProperty);

    try {
      // Save integration to database
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform_type: "google_analytics",
          platform_name: selectedPropertyData?.displayName || "Google Analytics",
          credentials: {
            property_id: selectedPropertyData?.propertyId,
            property_name: selectedPropertyData?.displayName,
            access_token: accessToken,
            refresh_token: refreshToken,
            expiry: new Date(Date.now() + expiresIn * 1000).toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save integration");
      }

      // Clean up temp session
      await fetch("/api/integrations/cleanup-session", {
        method: "POST",
      });

      router.push("/dashboard?connected=google_analytics");
    } catch (error) {
      console.error("Error saving integration:", error);
      alert("Failed to connect. Please try again.");
      setIsConnecting(false);
    }
  };

  const selectedPropertyData = properties.find((p) => p.id === selectedProperty);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/integrations/google/connect")}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Chrome className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Select GA4 Property</h1>
                <p className="text-sm text-slate-400">Choose which property to track</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-3 mb-8">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No properties found matching your search</p>
            </div>
          ) : (
            filteredProperties.map((property) => (
              <button
                key={property.id}
                onClick={() => setSelectedProperty(property.id)}
                className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                  selectedProperty === property.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedProperty === property.id
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white mb-1">{property.displayName}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Globe className="w-4 h-4" />
                      {property.websiteUrl}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Property ID: {property.propertyId}</div>
                  </div>
                </div>
                {selectedProperty === property.id && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Selected Property Info */}
        {selectedPropertyData && (
          <div className="bg-blue-950/20 border border-blue-900/50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Selected Property</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-white font-medium">{selectedPropertyData.displayName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Website:</span>
                <span className="text-white font-medium">{selectedPropertyData.websiteUrl}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Property ID:</span>
                <span className="text-emerald-400 font-mono">{selectedPropertyData.propertyId}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard/integrations/google/connect")}
            className="px-6 py-3 border border-slate-700 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-all"
          >
            Back
          </button>
          <button
            onClick={handleConnect}
            disabled={!selectedProperty || isConnecting}
            className="px-8 py-3 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Connect Property
              </>
            )}
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-4">
          <p className="text-sm text-emerald-400">
            💡 <strong>Tip:</strong> You can connect multiple properties later from your dashboard. This property will be available when creating campaigns.
          </p>
        </div>
      </main>
    </div>
  );
}
