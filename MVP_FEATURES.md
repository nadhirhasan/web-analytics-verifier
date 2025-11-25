# MVP Feature Specification

## Core User Flows

### 1. Client Onboarding Flow
```
Sign Up → Connect Google Analytics → Select Property → Dashboard
```

### 2. Campaign Creation Flow
```
Create Campaign → Set Target URL → Add UTM Parameters → Generate Trackable Link → Share with Freelancer
```

### 3. Freelancer Verification Flow
```
Receive Shareable Link → View Real-time Dashboard → Drive Traffic → Client Sees Results
```

## MVP Feature Checklist

### 🔐 Authentication & User Management

#### Must Have (MVP)
- [x] Email/Password registration
- [x] Email/Password login
- [x] Google OAuth login
- [x] Password reset flow
- [x] Email verification (optional for MVP)
- [x] User profile page
- [x] Logout functionality

#### Nice to Have (Post-MVP)
- [ ] Two-factor authentication
- [ ] Social login (Facebook, GitHub)
- [ ] SSO for enterprise

### 🔗 Google Analytics Integration

#### Must Have (MVP)
- [x] Google OAuth 2.0 connection
- [x] Request analytics.readonly scope
- [x] Store access + refresh tokens securely
- [x] List user's GA4 properties
- [x] Select and save property
- [x] Display connection status
- [x] Disconnect GA account
- [x] Handle token refresh automatically

#### Nice to Have (Post-MVP)
- [ ] Multiple GA accounts per user
- [ ] GA4 + Universal Analytics support
- [ ] Custom event tracking setup
- [ ] Enhanced eCommerce tracking

### 📊 Campaign Management

#### Must Have (MVP)
- [x] Create new campaign
  - Campaign name
  - Target URL
  - UTM parameters (source, medium, campaign)
  - Optional: UTM content, term
- [x] List all campaigns (with filters: active/paused/completed)
- [x] View campaign details
- [x] Edit campaign settings
- [x] Pause/Resume campaign
- [x] Delete campaign
- [x] Generate trackable URL with UTM parameters
- [x] Copy trackable URL to clipboard
- [x] Generate shareable dashboard link
- [x] Set campaign goals (optional):
  - Target visitors
  - Target session duration
  - End date

#### Nice to Have (Post-MVP)
- [ ] Campaign templates
- [ ] Bulk campaign creation
- [ ] Campaign cloning
- [ ] Campaign scheduling (auto start/end)
- [ ] Campaign tags/categories
- [ ] Campaign notes/comments

### 📈 Analytics Dashboard (Private - User View)

#### Must Have (MVP)
- [x] List of all campaigns with key metrics
- [x] Campaign detail view with:
  - Total visitors
  - Total sessions
  - Bounce rate
  - Average session duration
  - Top 5 traffic sources
  - Top 5 countries
  - Device breakdown (desktop/mobile/tablet)
  - Daily traffic graph (last 7 days)
- [x] Last updated timestamp
- [x] Manual refresh button
- [x] Auto-refresh (every 5 minutes)
- [x] Date range selector (last 7/14/30 days, custom)

#### Nice to Have (Post-MVP)
- [ ] Real-time visitor counter
- [ ] Hour-by-hour traffic heatmap
- [ ] Funnel visualization
- [ ] Cohort analysis
- [ ] Export to CSV/PDF
- [ ] Scheduled email reports
- [ ] Comparison between campaigns

### 🌐 Public Shareable Dashboard

#### Must Have (MVP)
- [x] Public URL with unique token
- [x] No login required to view
- [x] Display key metrics:
  - Current visitors today
  - Total visitors (campaign lifetime)
  - Total sessions
  - Bounce rate
  - Average session duration
  - Traffic sources (top 5)
  - Geographic distribution (top 5 countries)
  - Daily traffic chart (last 7 days)
- [x] Quality score badge (0-100)
- [x] Last updated timestamp
- [x] Campaign name and target URL
- [x] Responsive design (mobile-friendly)
- [x] Share link copy button
- [x] Branded footer with link to platform

#### Nice to Have (Post-MVP)
- [ ] Embed widget (iframe)
- [ ] Custom branding (white-label)
- [ ] Password protection option
- [ ] Expiration date for links
- [ ] Download report button
- [ ] QR code generation

### 🎯 Traffic Quality Scoring

#### Must Have (MVP)
- [x] Calculate quality score (0-100) based on:
  - Bounce rate
  - Session duration
  - Traffic source diversity
  - Geographic diversity
  - Country concentration
- [x] Display score on dashboards
- [x] Visual indicator (color coded: red/yellow/green)
- [x] Basic score explanation tooltip

#### Nice to Have (Post-MVP)
- [ ] Bot traffic detection
- [ ] Engagement score
- [ ] Conversion tracking
- [ ] Anomaly detection
- [ ] Historical score tracking
- [ ] Score comparison vs. industry benchmarks

### 🔔 Notifications (Post-MVP)

#### Nice to Have
- [ ] Email notifications:
  - Campaign goal reached
  - Unusual traffic detected
  - GA connection expired
  - Weekly summary report
- [ ] In-app notifications
- [ ] Browser push notifications
- [ ] Slack/Discord webhooks

### 💳 Subscription & Billing (Post-MVP)

#### Nice to Have
- [ ] Subscription plans page
- [ ] Stripe integration
- [ ] Plan selection
- [ ] Payment processing
- [ ] Upgrade/downgrade flow
- [ ] Billing history
- [ ] Invoice generation
- [ ] Usage limits enforcement:
  - Free: 1 campaign
  - Pro: 10 campaigns
  - Business: Unlimited

### 🛠️ Settings & Configuration

#### Must Have (MVP)
- [x] User profile settings:
  - Name
  - Email (display only)
  - Change password
- [x] Google Analytics connection management
- [x] Account deletion

#### Nice to Have (Post-MVP)
- [ ] Notification preferences
- [ ] Default UTM parameters
- [ ] API key generation
- [ ] Webhook configuration
- [ ] Team management
- [ ] Brand customization

### 🎨 UI/UX Requirements

#### Must Have (MVP)
- [x] Clean, modern design
- [x] Responsive (mobile, tablet, desktop)
- [x] Dark mode support (optional)
- [x] Loading states for async operations
- [x] Error messages (user-friendly)
- [x] Success confirmations
- [x] Empty states with helpful CTAs
- [x] Tooltips for complex features
- [x] Consistent color scheme
- [x] Accessible (WCAG AA compliant basics)

#### Nice to Have (Post-MVP)
- [ ] Onboarding tour
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop functionality
- [ ] Advanced animations
- [ ] Customizable dashboard layout
- [ ] Multi-language support

## Pages & Routes

### Public Pages
- `/` - Landing page
- `/login` - Login page
- `/register` - Sign up page
- `/forgot-password` - Password reset
- `/dashboard/{token}` - Public shareable dashboard
- `/pricing` - Pricing plans (post-MVP)
- `/about` - About page
- `/contact` - Contact page

### Authenticated Pages
- `/dashboard` - User dashboard (campaign list)
- `/dashboard/campaigns/new` - Create campaign
- `/dashboard/campaigns/[id]` - Campaign detail view
- `/dashboard/campaigns/[id]/edit` - Edit campaign
- `/dashboard/settings` - User settings
- `/dashboard/analytics` - GA connection management
- `/dashboard/billing` - Subscription management (post-MVP)

### API Routes
- `/api/auth/*` - Authentication
- `/api/google-analytics/*` - GA integration
- `/api/campaigns/*` - Campaign CRUD
- `/api/metrics/*` - Fetch analytics data
- `/api/public/campaign/[token]` - Public dashboard data

## Data Fetching Strategy

### Server-Side Rendering (SSR)
- Public shareable dashboards (SEO + fresh data)
- Landing page (SEO)

### Client-Side Fetching (SWR/React Query)
- Campaign list
- Campaign metrics (with auto-refresh)
- User profile

### Static Generation (SSG)
- Marketing pages (pricing, about, etc.)

## Development Timeline (6 Weeks)

### Week 1: Foundation
- **Days 1-2**: Project setup, Next.js + TypeScript configuration
- **Days 3-4**: Database schema, Prisma setup
- **Days 5-7**: Authentication (NextAuth.js), user registration/login

### Week 2: Google Analytics Integration
- **Days 8-9**: Google OAuth flow implementation
- **Days 10-11**: GA property selection, token management
- **Days 12-14**: GA Data API integration, test data fetching

### Week 3: Campaign Management
- **Days 15-16**: Campaign CRUD operations
- **Days 17-18**: UTM parameter generation
- **Days 19-21**: Campaign list/detail views (UI)

### Week 4: Analytics Dashboard
- **Days 22-23**: Fetch and process GA data
- **Days 24-25**: Private dashboard with charts
- **Days 26-28**: Daily stats, date range filtering

### Week 5: Public Sharing
- **Days 29-30**: Public dashboard page
- **Days 31-32**: Quality score calculation
- **Days 33-35**: Responsive design, polish

### Week 6: Testing & Launch
- **Days 36-37**: Bug fixes, error handling
- **Days 38-39**: Performance optimization
- **Days 40-42**: Beta testing, final adjustments, deploy

## Success Criteria for MVP

### Functional Requirements
✅ User can sign up and log in
✅ User can connect Google Analytics account
✅ User can create a campaign with UTM parameters
✅ User can view real-time analytics from their GA account
✅ User can generate a shareable link
✅ Public dashboard displays accurate, live data
✅ Quality score is calculated and displayed

### Non-Functional Requirements
✅ Page load time < 3 seconds
✅ Dashboard data updates within 5 minutes
✅ Mobile responsive (works on phones/tablets)
✅ No breaking bugs in critical flows
✅ 99% uptime (Vercel reliability)

### User Acceptance Criteria
✅ 10 beta users successfully create campaigns
✅ Beta users confirm data accuracy (matches their GA)
✅ Freelancers can access public dashboards without issues
✅ Users report the platform as "easy to use"

## Post-MVP Roadmap

### Phase 2 (Months 2-3)
- Subscription plans + Stripe integration
- Email notifications
- Campaign templates
- Enhanced quality scoring (bot detection)
- Export reports (CSV, PDF)

### Phase 3 (Months 4-6)
- Team collaboration features
- API for third-party integrations
- White-label options
- Mobile app (React Native)
- Marketplace integrations (Fiverr, Upwork)

### Phase 4 (Months 7-12)
- Advanced analytics (predictive, cohort analysis)
- Machine learning for fraud detection
- Enterprise features (SSO, custom contracts)
- International expansion (multi-language)
- Partner program

---

**This MVP focuses on the core value proposition: verifiable, real-time social media traffic analytics through direct Google Analytics integration.**
