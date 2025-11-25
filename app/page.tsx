import Link from "next/link";
import { ArrowRight, Shield, BarChart3, Zap, Globe, CheckCircle2, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-emerald-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                VerifyTraffic
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/auth/signin" className="text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Real-time Traffic Verification</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Stop Paying for
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Fake Traffic
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
              Verify social media traffic in real-time through your Google Analytics. 
              No more fake screenshots, no more bots, just authentic data you can trust.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/signup"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all flex items-center gap-2"
              >
                Start Verifying Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#demo"
                className="px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-lg font-semibold text-lg hover:bg-slate-800 transition-all"
              >
                See How It Works
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl"></div>
            <div className="relative rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-2 shadow-2xl">
              <div className="bg-slate-950 rounded-lg p-8 border border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                    <div className="text-emerald-400 text-sm mb-1">Real Visitors</div>
                    <div className="text-3xl font-bold text-white">2,847</div>
                    <div className="text-emerald-400 text-xs mt-1">+12.5% today</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
                    <div className="text-cyan-400 text-sm mb-1">Avg. Duration</div>
                    <div className="text-3xl font-bold text-white">3:42</div>
                    <div className="text-cyan-400 text-xs mt-1">Quality score: 94</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-blue-400 text-sm mb-1">Bounce Rate</div>
                    <div className="text-3xl font-bold text-white">32%</div>
                    <div className="text-blue-400 text-xs mt-1">Below target</div>
                  </div>
                </div>
                <div className="h-32 bg-slate-900 rounded-lg border border-slate-800 flex items-end justify-around p-4 gap-2">
                  {[40, 65, 55, 80, 70, 90, 75, 95, 85, 100, 92, 88].map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-emerald-500 to-cyan-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                The Problem with Traffic Services
              </span>
            </h2>
            <p className="text-slate-400 text-lg">Screenshots can be faked. Bots can be disguised. Trust can be broken.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-8">
              <div className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">❌</span> Before VerifyTraffic
              </div>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Fake screenshots from photo editors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Bot traffic that doesn't convert</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>No way to verify traffic quality</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Money wasted on fraudulent services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Disputes with no evidence</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-8">
              <div className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">✓</span> With VerifyTraffic
              </div>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Direct connection to your Google Analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Real-time traffic verification, impossible to fake</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Quality scoring with bot detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Pay only for verified, quality traffic</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Clear evidence protects both parties</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Simple Setup, Powerful Results
              </span>
            </h2>
            <p className="text-slate-400 text-lg">Get started in under 2 minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 hover:border-emerald-500/50 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Connect Google Analytics</h3>
                <p className="text-slate-400">
                  One-click OAuth connection to your Google Analytics account. Your data stays in your control.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 hover:border-cyan-500/50 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Generate Tracking Link</h3>
                <p className="text-slate-400">
                  Create a unique trackable URL with UTM parameters. Set your quality goals and expectations.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 hover:border-blue-500/50 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Share & Verify</h3>
                <p className="text-slate-400">
                  Share the dashboard with your freelancer. Watch real-time traffic, quality metrics, and verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Everything You Need to Verify Traffic
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Zero Fraud"
              description="Direct GA API connection makes it impossible to manipulate or fake data"
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Real-time Tracking"
              description="See traffic as it happens, no delays or batch processing"
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Quality Scoring"
              description="Advanced metrics: bounce rate, session duration, engagement levels"
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6" />}
              title="Geographic Validation"
              description="Verify traffic comes from your target countries and regions"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Source Verification"
              description="Confirm traffic originates from claimed social media platforms"
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="Bot Detection"
              description="Automatic filtering of bot traffic and suspicious patterns"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Ready to Stop Traffic Fraud?
              </span>
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join hundreds of businesses protecting their marketing budget with verified traffic data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
              >
                Start Your First Campaign Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-slate-500 text-sm mt-4">No credit card required • Setup in 2 minutes • Free forever plan</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-white">VerifyTraffic</span>
              </div>
              <p className="text-slate-400 text-sm">
                Real-time traffic verification through Google Analytics. Stop fraud, verify quality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
            © 2025 VerifyTraffic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all group">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
