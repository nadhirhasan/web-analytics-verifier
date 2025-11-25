# README.md

# 🔍 Web Analytics Verifier

**Stop paying for fake social media traffic. Verify every visitor with real-time Google Analytics integration.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)](https://www.prisma.io/)

## 🎯 Problem We Solve

Hiring freelancers for social media traffic? Getting fake screenshots, bot traffic, or manipulated analytics? 

**This platform eliminates fraud** by connecting directly to YOUR Google Analytics account. Freelancers can't fake the data because it comes straight from Google's servers to your dashboard.

## ✨ Key Features

- 🔗 **Direct GA4 Integration** - Connect your Google Analytics account in seconds
- 📊 **Real-time Dashboards** - See traffic as it happens, no delays
- 🌐 **Shareable Links** - Give freelancers a public dashboard link to prove their work
- 🎯 **Quality Scoring** - Automatic detection of low-quality or suspicious traffic
- 📈 **UTM Tracking** - Track exactly which social media source drives each visitor
- 🛡️ **Zero Manipulation** - Data comes directly from Google, impossible to fake
- 📱 **Mobile Responsive** - Monitor campaigns from anywhere

## 🚀 How It Works

### For Clients (Buyers)

1. **Connect Google Analytics** - One-click OAuth connection
2. **Create Campaign** - Set your target URL and define UTM parameters
3. **Share Dashboard** - Give the freelancer a link to the live dashboard
4. **Monitor Results** - Watch real-time traffic, verify quality, pay only for real results

### For Freelancers (Sellers)

1. **Receive Dashboard Link** - Client shares a verification dashboard
2. **Drive Traffic** - Send real social media traffic to the tracked URL
3. **Prove Your Work** - Client sees all metrics in real-time, directly from Google
4. **Build Trust** - Stand out from scammers with transparent, verifiable results

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Analytics API**: [Google Analytics Data API v1](https://developers.google.com/analytics/devguides/reporting/data/v1)
- **Deployment**: [Vercel](https://vercel.com/)

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud Project with Analytics API enabled
- Google OAuth 2.0 credentials

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/webanalytics-verifier.git
cd webanalytics-verifier
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/analytics_verifier"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Google OAuth & Analytics
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: For production
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Analytics Data API**
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to `.env.local`

### Database Schema

Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

View your database:
```bash
npx prisma studio
```

## 📚 Documentation

- [**Startup Plan**](./STARTUP_PLAN.md) - Business model, revenue strategy, go-to-market
- [**Technical Specification**](./TECHNICAL_SPEC.md) - Architecture, API design, database schema
- [**MVP Features**](./MVP_FEATURES.md) - Complete feature list and development roadmap

## 🗺️ Project Structure

```
webanalytics-verifier/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   └── dashboard/[token]/   # Public shareable dashboards
├── components/              # React components
│   ├── ui/                  # Shadcn/ui components
│   ├── analytics/           # Analytics-specific components
│   └── campaigns/           # Campaign management components
├── lib/                     # Utility functions
│   ├── analytics.ts         # GA API integration
│   ├── auth.ts              # NextAuth configuration
│   └── db.ts                # Prisma client
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
└── types/                   # TypeScript type definitions
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Roadmap

### ✅ MVP (Completed)
- [x] User authentication
- [x] Google Analytics integration
- [x] Campaign management
- [x] Real-time analytics dashboard
- [x] Shareable public dashboards
- [x] Quality scoring algorithm

### 🔄 Phase 2 (In Progress)
- [ ] Subscription plans with Stripe
- [ ] Email notifications
- [ ] Campaign templates
- [ ] Export reports (CSV, PDF)
- [ ] Enhanced bot detection

### 📋 Phase 3 (Planned)
- [ ] Team collaboration
- [ ] White-label options
- [ ] Mobile app
- [ ] Fiverr/Upwork integration
- [ ] Advanced analytics (predictive AI)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 💬 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/webanalytics-verifier/issues)
- **Email**: support@yourplatform.com
- **Discord**: [Join our community](https://discord.gg/yourserver)

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/webanalytics-verifier&type=Date)](https://star-history.com/#yourusername/webanalytics-verifier&Date)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting
- [Shadcn](https://ui.shadcn.com/) for beautiful UI components
- [Prisma](https://www.prisma.io/) for type-safe database access

---

**Built with ❤️ by [Your Name]**

*Stop fraud. Start verifying.*
