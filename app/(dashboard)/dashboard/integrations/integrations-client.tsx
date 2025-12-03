"use client";

import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Chrome,
  ShoppingBag,
  Code,
  BarChart3,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

interface Integration {
  id: string;
  platform_type: string;
  platform_name: string;
  status: "active" | "inactive" | "error";
  created_at: string;
}

interface IntegrationsClientProps {
  integrations: Integration[];
  userId: string;
}

const platformIcons: Record<string, React.ReactNode> = {
  google_analytics: <Chrome className="w-6 h-6" />,
  shopify: <ShoppingBag className="w-6 h-6" />,
  woocommerce: <ShoppingBag className="w-6 h-6" />,
  javascript_pixel: <Code className="w-6 h-6" />,
  plausible: <BarChart3 className="w-6 h-6" />,
};

const platformColors: Record<string, string> = {
  google_analytics: "from-blue-500 to-purple-600",
  shopify: "from-green-500 to-emerald-600",
  woocommerce: "from-purple-500 to-pink-600",
  javascript_pixel: "from-orange-500 to-red-600",
  plausible: "from-cyan-500 to-blue-600",
};

export default function IntegrationsClient({ integrations, userId }: IntegrationsClientProps) {
  const router = useRouter();
  const [localIntegrations, setLocalIntegrations] = useState(integrations);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this integration?")) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setLocalIntegrations(prev => prev.filter(i => i.id !== id));
      } else {
        alert("Failed to delete integration");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete integration");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
          <p className="text-slate-400">Manage your connected analytics and e-commerce platforms</p>
        </div>
        <button
          onClick={() => setShowPlatformSelector(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Main Content */}
        {localIntegrations.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Code className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Integrations Yet</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Connect Google Analytics, Shopify, or other platforms to start verifying traffic
            </p>
            <button
              onClick={() => setShowPlatformSelector(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Connect Your First Platform
            </button>
          </div>
        ) : (
          // Integrations Grid
          <div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">Connected Platforms</h2>
              <p className="text-slate-400">Manage your connected analytics and e-commerce platforms</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all"
                >
                  {/* Platform Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${platformColors[integration.platform_type] || "from-slate-600 to-slate-700"} rounded-xl flex items-center justify-center text-white mb-4`}>
                    {platformIcons[integration.platform_type] || <BarChart3 className="w-6 h-6" />}
                  </div>

                  {/* Platform Info */}
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {integration.platform_name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {integration.platform_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </p>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    {integration.status === "active" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400">Active</span>
                      </>
                    ) : integration.status === "error" ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">Error</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-amber-400">Inactive</span>
                      </>
                    )}
                  </div>

                  {/* Created Date */}
                  <p className="text-xs text-slate-500 mb-4">
                    Connected {new Date(integration.created_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {integration.platform_type === "google_analytics" && (
                      <button
                        onClick={() => router.push("/dashboard/integrations/google/properties")}
                        className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Properties
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(integration.id)}
                      disabled={deletingId === integration.id}
                      className="px-3 py-2 bg-red-950/30 border border-red-900/50 text-red-400 hover:bg-red-950/50 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === integration.id ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Platform Selector Modal */}
      {showPlatformSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Select Platform</h2>
                <p className="text-slate-400 mt-1">Choose a platform to integrate</p>
              </div>
              <button
                onClick={() => setShowPlatformSelector(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Google Analytics */}
              <button
                onClick={() => router.push("/dashboard/integrations/google/connect")}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/50 hover:bg-slate-800 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Chrome className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Google Analytics
                </h3>
                <p className="text-sm text-slate-400">
                  Connect your GA4 property to verify traffic
                </p>
              </button>

              {/* Shopify - Coming Soon */}
              <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Shopify
                </h3>
                <p className="text-sm text-slate-400">Coming soon</p>
              </div>

              {/* Plausible - Coming Soon */}
              <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Plausible
                </h3>
                <p className="text-sm text-slate-400">Coming soon</p>
              </div>

              {/* JavaScript Pixel - Coming Soon */}
              <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Custom Pixel
                </h3>
                <p className="text-sm text-slate-400">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
