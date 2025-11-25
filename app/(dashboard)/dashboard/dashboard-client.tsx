"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Plus,
  TrendingUp,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  Link2,
  Calendar,
  ExternalLink,
  Copy,
  MoreVertical,
  Eye,
  Pause,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Chrome,
  ShoppingBag,
  Zap,
  Code,
  ArrowRight,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";

interface Campaign {
  id: string;
  name: string;
  target_url: string;
  status: "active" | "paused" | "completed" | "archived";
  shareable_link: string;
  created_at: string;
  quality_score: number | null;
}

interface Integration {
  id: string;
  platform_type: string;
  platform_name: string;
  status: "active" | "inactive" | "error";
  created_at: string;
}

interface DashboardClientProps {
  user: any;
  profile: any;
  campaigns: Campaign[];
  integrations: Integration[];
}

export default function DashboardClient({
  user,
  profile,
  campaigns,
  integrations,
}: DashboardClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const hasIntegrations = integrations.length > 0;
  const activeIntegrations = integrations.filter(i => i.status === "active");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-800">
            <Shield className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              VerifyTraffic
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItem
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
              active
            />
            <NavItem
              icon={<BarChart3 className="w-5 h-5" />}
              label="Campaigns"
              badge={campaigns.length}
            />
            <NavItem
              icon={<Link2 className="w-5 h-5" />}
              label="Integrations"
              badge={hasIntegrations ? activeIntegrations.length : "!"}
            />
            <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
          </nav>

          {/* Subscription Info */}
          <div className="px-4 pb-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-lg p-4">
              <div className="text-sm font-medium text-white mb-1">
                {profile?.subscription_tier.toUpperCase() || "FREE"} Plan
              </div>
              <div className="text-xs text-slate-400 mb-3">
                {campaigns.length} / {profile?.subscription_tier === "free" ? "1" : "∞"} campaigns
              </div>
              <button className="w-full px-3 py-2 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="w-64 pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative text-slate-400 hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-sm font-bold text-slate-900">
                    {profile?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium text-white">
                      {profile?.name || "User"}
                    </div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="text-slate-400">
              Here's what's happening with your campaigns today.
            </p>
          </div>

          {/* Integration Connection Alert */}
          {!hasIntegrations && (
            <div className="mb-6 bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Connect a Platform First
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Before creating campaigns, connect at least one platform (Google Analytics, Shopify, WooCommerce, or JavaScript Pixel).
                  </p>
                  <button 
                    onClick={() => setShowIntegrationModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Connect Your First Platform
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Integrations */}
          {hasIntegrations && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Connected Platforms</h2>
                <button 
                  onClick={() => setShowIntegrationModal(true)}
                  className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Integration
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Campaigns"
              value={campaigns.length.toString()}
              change="+0%"
              icon={<BarChart3 className="w-5 h-5" />}
            />
            <StatCard
              label="Active Campaigns"
              value={campaigns.filter((c) => c.status === "active").length.toString()}
              change="+0%"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              label="Total Visitors"
              value="0"
              change="+0%"
              icon={<Eye className="w-5 h-5" />}
            />
            <StatCard
              label="Avg Quality Score"
              value="-"
              change="+0%"
              icon={<CheckCircle2 className="w-5 h-5" />}
            />
          </div>

          {/* Campaigns Section */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Your Campaigns</h2>
              <button
                onClick={() => {
                  if (!hasIntegrations) {
                    setShowIntegrationModal(true);
                  } else {
                    router.push("/dashboard/campaigns/new");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </button>
            </div>

            {/* Empty State or Campaign List */}
            {campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No campaigns yet
                </h3>
                <p className="text-slate-400 mb-6">
                  {hasIntegrations 
                    ? "Create your first campaign to start verifying traffic"
                    : "Connect a platform first, then create your campaign"
                  }
                </p>
                <button
                  onClick={() => {
                    if (!hasIntegrations) {
                      setShowIntegrationModal(true);
                    } else {
                      router.push("/dashboard/campaigns/new");
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {hasIntegrations ? "Create Your First Campaign" : "Connect Platform First"}
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Integration Selection Modal */}
      {showIntegrationModal && (
        <IntegrationModal onClose={() => setShowIntegrationModal(false)} />
      )}
    </div>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const platformIcons: Record<string, React.ReactNode> = {
    google_analytics: <Chrome className="w-6 h-6 text-blue-400" />,
    shopify: <ShoppingBag className="w-6 h-6 text-green-400" />,
    woocommerce: <ShoppingBag className="w-6 h-6 text-purple-400" />,
    javascript_pixel: <Code className="w-6 h-6 text-cyan-400" />,
    plausible: <BarChart3 className="w-6 h-6 text-indigo-400" />,
  };

  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-emerald-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
          {platformIcons[integration.platform_type] || <Zap className="w-6 h-6" />}
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[integration.status]}`}>
          {integration.status}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{integration.platform_name}</h3>
      <p className="text-xs text-slate-400 mb-3">
        {integration.platform_type.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </p>
      <button className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-all">
        Configure
      </button>
    </div>
  );
}

function IntegrationModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  
  const integrationOptions = [
    {
      id: "google_analytics",
      type: "google_analytics",
      name: "Google Analytics",
      icon: <Chrome className="w-8 h-8 text-blue-400" />,
      description: "Connect your Google Analytics 4 property",
      popular: true,
      connectUrl: "/dashboard/integrations/google/connect",
    },
    {
      id: "shopify",
      type: "shopify",
      name: "Shopify",
      icon: <ShoppingBag className="w-8 h-8 text-green-400" />,
      description: "Connect your Shopify store analytics",
      popular: true,
      connectUrl: "/dashboard/integrations/shopify/connect",
    },
    {
      id: "woocommerce",
      type: "woocommerce",
      name: "WooCommerce",
      icon: <ShoppingBag className="w-8 h-8 text-purple-400" />,
      description: "Connect WordPress WooCommerce store",
      popular: true,
      connectUrl: "/dashboard/integrations/woocommerce/connect",
    },
    {
      id: "javascript_pixel",
      type: "javascript_pixel",
      name: "JavaScript Pixel",
      icon: <Code className="w-8 h-8 text-cyan-400" />,
      description: "Universal tracking code for any website",
      popular: false,
      connectUrl: "/dashboard/integrations/pixel/connect",
    },
    {
      id: "plausible",
      type: "plausible",
      name: "Plausible Analytics",
      icon: <BarChart3 className="w-8 h-8 text-indigo-400" />,
      description: "Privacy-focused analytics platform",
      popular: false,
      connectUrl: "/dashboard/integrations/plausible/connect",
    },
    {
      id: "custom_api",
      type: "custom_api",
      name: "Custom API",
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      description: "Connect via custom webhook or API",
      popular: false,
      connectUrl: "/dashboard/integrations/custom/connect",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Add Integration</h2>
            <p className="text-slate-400 text-sm">Connect your analytics or e-commerce platform</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onClose();
                  router.push(option.connectUrl);
                }}
                className="relative text-left bg-slate-950 border border-slate-800 rounded-lg p-6 hover:border-emerald-500/50 transition-all group"
              >
                {option.popular && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {option.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{option.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{option.description}</p>
                <div className="flex items-center text-emerald-400 text-sm font-medium">
                  Connect <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number | string;
}) {
  return (
    <button
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
        active
          ? "bg-emerald-500/10 text-emerald-400"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`px-2 py-0.5 text-xs font-bold rounded-full ${
            badge === "!"
              ? "bg-amber-500/20 text-amber-400"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">{label}</span>
        <div className="text-emerald-400">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-slate-500">{change} from last month</div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    archived: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 hover:border-emerald-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${
                statusColors[campaign.status]
              }`}
            >
              {campaign.status}
            </span>
          </div>
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            {campaign.target_url}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-2 z-10">
              <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-500 mb-1">Visitors</div>
          <div className="text-lg font-semibold text-white">0</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Quality Score</div>
          <div className="text-lg font-semibold text-white">
            {campaign.quality_score || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Created</div>
          <div className="text-sm text-slate-400">
            {new Date(campaign.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all text-sm font-medium">
          View Dashboard
        </button>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all">
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
