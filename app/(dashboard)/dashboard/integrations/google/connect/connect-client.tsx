"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Chrome,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Eye,
  TrendingUp,
  Globe,
} from "lucide-react";

interface GoogleConnectClientProps {
  userId: string;
  userEmail: string;
}

export default function GoogleConnectClient({
  userId,
  userEmail,
}: GoogleConnectClientProps) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Build real Google OAuth URL
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      redirect_uri: `${window.location.origin}/api/auth/google/callback`,
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/analytics.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      access_type: "offline",
      prompt: "consent",
      state: userId, // Pass user ID to identify after callback
    });

    // Redirect to Google OAuth consent screen
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-400" />
              <h1 className="text-xl font-bold text-white">Connect Google Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Chrome className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Connect Your Google Analytics
          </h2>
          <p className="text-slate-400 text-lg">
            Grant read-only access to verify traffic in real-time
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">What you'll authorize:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Read-only access to Analytics data</div>
                  <div className="text-sm text-slate-400">View your GA4 properties and real-time metrics</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Your email address</div>
                  <div className="text-sm text-slate-400">To verify your Google account identity</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Offline access</div>
                  <div className="text-sm text-slate-400">Keep fetching data even when you're not logged in</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-950/50">
            <h3 className="text-lg font-semibold text-white mb-4">Security & Privacy:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <strong>Read-only permissions:</strong> We can only view data, never modify or delete
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <strong>Encrypted storage:</strong> Your tokens are encrypted in our database
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <strong>Revoke anytime:</strong> Disconnect from your dashboard or Google Account settings
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Connecting as: <strong>{userEmail}</strong></span>
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full py-4 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Redirecting to Google...
            </>
          ) : (
            <>
              <Chrome className="w-6 h-6" />
              Continue with Google
              <ExternalLink className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Footer Note */}
        <p className="text-center text-sm text-slate-500 mt-6">
          By connecting, you agree to Google's{" "}
          <a href="https://policies.google.com/terms" target="_blank" className="text-blue-400 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="https://policies.google.com/privacy" target="_blank" className="text-blue-400 hover:underline">
            Privacy Policy
          </a>
        </p>
      </main>
    </div>
  );
}
