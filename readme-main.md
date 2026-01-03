# 🏥 Hospital On-Call Scheduler (Gardes)

> A mobile-first web application for hospital interns to fairly schedule on-call duties with real-time collaborative group formation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)

---

## 📖 Table of Contents

- [What is This?](#what-is-this)
- [The Problem We Solve](#the-problem-we-solve)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Deterministic Next Steps](#deterministic-next-steps)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 What is This?

**On-Call Scheduler** (internally called "Gardes" - French for "shifts") is a Progressive Web App (PWA) designed specifically for hospital interns to create fair, transparent, and collaborative on-call duty schedules during their 3-month service rotations.

### The Problem We Solve

Hospital interns face several challenges when organizing on-call duties:

1. **Manual Scheduling is Time-Consuming**: Creating fair rotations manually for 20-30 interns across 90 days is tedious and error-prone
2. **Lack of Transparency**: Interns can't see how duties are distributed or verify fairness
3. **Group Formation Friction**: Coordinating who works together requires endless WhatsApp messages and coordination overhead
4. **No Real-Time Collaboration**: Traditional tools (Excel, Google Sheets) don't support live group formation and instant updates
5. **Mobile-Unfriendly**: Existing solutions require desktop computers, but interns primarily use smartphones

### Our Solution

We provide a **mobile-first, real-time collaborative platform** where:

- ✅ Interns form groups socially with request/approve flows (like joining a club)
- ✅ Schedule generation uses a **deterministic round-robin algorithm** ensuring maximum fairness (≤1 duty difference)
- ✅ Real-time updates keep everyone synchronized as groups form
- ✅ Progressive Web App works like a native mobile app (no app store needed)
- ✅ Works offline and syncs when reconnected
- ✅ Simple 6-character join codes make onboarding frictionless

---

## ✨ Key Features

### 1. **Social Group Formation** 🤝
- Create groups with fun emojis and custom names
- Request to join groups (founders approve/decline)
- Real-time notifications when requests are received or responded to
- See live updates as groups form across the service
- Smart validations prevent over-capacity and conflicts

### 2. **Fair Scheduling Algorithm** ⚖️
- Deterministic round-robin distribution
- Guarantees maximum 1 duty difference between groups
- Transparent calculation shown to all users
- Supports any number of groups and service duration
- Recalculation when groups change (before schedule locked)

### 3. **Mobile-First Design** 📱
- Optimized for smartphone use (primary device)
- Bottom navigation for thumb-friendly access
- No drag-and-drop (tap and select patterns)
- Swipe gestures for quick actions
- Large touch targets, readable typography

### 4. **Real-Time Collaboration** ⚡
- WebSocket-powered live updates
- See groups form in real-time
- Instant notifications for requests/approvals
- Activity feed showing recent actions
- Presence indicators (who's online)

### 5. **Progressive Web App** 🚀
- "Add to Home Screen" for app-like experience
- Works offline with service worker
- Push notifications (optional)
- Fast loading with optimistic UI updates
- Cross-platform (iOS, Android, Desktop)

### 6. **Today View** 📅
- Prominent display of current on-call group
- Quick access to "who's on duty today"
- Next duty preview for your group
- Calendar integration ready

---

## 🔄 How It Works

### Phase 1: Service Creation (Admin)
```
1. Admin creates service → enters name, start/end dates
2. System generates 6-character join code (e.g., "ABC123")
3. Admin shares code via WhatsApp, SMS, or QR code
4. Admin waits for interns to join and form groups
```

### Phase 2: Joining & Group Formation (Interns)
```
1. Intern receives join code → enters code and name
2. Intern browses existing groups (real-time list)
3. Intern either:
   a) Creates new group (becomes founder)
   b) Requests to join existing group
4. If creating group:
   - Choose emoji and name
   - Set max size (optional)
   - Wait for others to request
   - Approve/decline requests
5. If joining group:
   - Send request to founder
   - Wait for approval (real-time notification)
   - Automatically added when approved
```

### Phase 3: Schedule Generation (Admin)
```
1. Admin verifies all interns are in groups
2. Admin clicks "Generate Schedule"
3. System calculates fair round-robin distribution:
   - Total days: 90
   - Groups: 7
   - Each group gets 12 or 13 duties (90/7 = 12 remainder 6)
   - First 6 groups: 13 duties
   - Last group: 12 duties
   - Max variance: 1 duty
4. Schedule displayed in calendar and list views
5. Admin can lock schedule (prevents further changes)
```

### Phase 4: Daily Usage (All Users)
```
1. Open app → see "Today" dashboard
2. View current on-call group prominently displayed
3. Check your group's next duty
4. Browse full calendar
5. Receive notifications for your group's duties (optional)
```

---

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript - Component library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Accessible UI components
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Socket.io Client** - Real-time WebSocket connections
- **Lucide React** - Icon library
- **Workbox** - Service worker for PWA

### Backend
- **Node.js 20+** - Runtime
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **Prisma** - ORM and database toolkit
- **PostgreSQL 15** - Primary database
- **Redis** - Session storage and WebSocket scaling
- **TypeScript** - Type safety

### Infrastructure
- **Vercel** - Frontend hosting and CDN
- **Railway** - Backend hosting and deployment
- **Supabase** - Managed PostgreSQL database
- **Upstash** - Managed Redis
- **Sentry** - Error monitoring
- **PostHog** - Product analytics

### Testing
- **Vitest** - Unit and integration tests
- **Playwright** - E2E testing
- **k6** - Load testing (HTTP)
- **Artillery** - WebSocket stress testing
- **Locust** - Complex scenario testing

---

## 🚀 Quick Start

### Prerequisites
```bash
node --version  # v20.0.0 or higher
npm --version   # v9.0.0 or higher
docker --version  # v24.0.0 or higher (for local database)
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/oncall-scheduler.git
cd oncall-scheduler

# Install dependencies
npm install

# Start local database (PostgreSQL + Redis)
docker-compose up -d

# Setup backend
cd apps/api
npm install
cp .env.example .env
# Edit .env with your database URL
npx prisma migrate dev
npx prisma generate
npm run dev

# Setup frontend (new terminal)
cd apps/web
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: postgresql://localhost:5432/oncall_scheduler

---

## 📋 Deterministic Next Steps

Follow these steps **in exact order** to get the app running in production:

### ✅ **STEP 1: Set Up Development Environment** (30 minutes)

```bash
# 1.1 Install required tools
brew install node          # macOS
brew install docker        # macOS
# Or use Windows equivalents

# 1.2 Verify installations
node --version  # Should be v20+
docker --version

# 1.3 Clone repository
git clone https://github.com/yourusername/oncall-scheduler.git
cd oncall-scheduler

# 1.4 Install all dependencies
npm install
cd apps/api && npm install
cd ../web && npm install
cd ../..
```

**Expected Output**: No errors, all packages installed successfully

---

### ✅ **STEP 2: Set Up Local Database** (15 minutes)

```bash
# 2.1 Start PostgreSQL and Redis with Docker
docker-compose up -d

# 2.2 Verify containers are running
docker ps  # Should see postgres and redis

# 2.3 Configure backend environment
cd apps/api
cp .env.example .env

# 2.4 Edit .env file (use your text editor)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oncall_scheduler"
# REDIS_URL="redis://localhost:6379"

# 2.5 Run database migrations
npx prisma migrate dev --name init

# 2.6 Generate Prisma client
npx prisma generate

# 2.7 (Optional) Seed database with test data
npx prisma db seed
```

**Expected Output**: 
```
✔ Generated Prisma Client
✔ Migrations applied successfully
```

---

### ✅ **STEP 3: Start Development Servers** (5 minutes)

```bash
# 3.1 Terminal 1: Start backend
cd apps/api
npm run dev

# 3.2 Terminal 2: Start frontend
cd apps/web
npm run dev

# 3.3 Open browser
# Navigate to http://localhost:5173
```

**Expected Output**: 
- Backend: `Server running on port 3000`
- Frontend: `Local: http://localhost:5173`

**Test It**: 
1. Click "Create New Service"
2. Fill in form and submit
3. See join code generated
4. Success! ✅

---

### ✅ **STEP 4: Create Production Database** (20 minutes)

```bash
# 4.1 Go to https://supabase.com
# 4.2 Sign up / Log in
# 4.3 Click "New Project"
# 4.4 Fill in:
#     - Name: oncall-scheduler-prod
#     - Database Password: (generate strong password)
#     - Region: (closest to your users)
# 4.5 Wait for project to be created (2-3 minutes)
# 4.6 Go to Settings > Database
# 4.7 Copy "Connection string" (URI mode)
# 4.8 Save this URL securely - you'll need it next

# Example URL format:
# postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

**Expected Output**: A working PostgreSQL connection string

---

### ✅ **STEP 5: Deploy Backend to Railway** (25 minutes)

```bash
# 5.1 Install Railway CLI
npm install -g @railway/cli

# 5.2 Login to Railway
railway login
# Browser opens → Click "Authorize"

# 5.3 Initialize Railway project
cd apps/api
railway init
# Choose: "Create new project"
# Name: oncall-scheduler-api

# 5.4 Link to Supabase database
railway variables set DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# 5.5 Add other environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set FRONTEND_URL=https://your-app.vercel.app

# 5.6 Deploy backend
railway up

# 5.7 Get your backend URL
railway domain
# Copy the URL (e.g., https://oncall-scheduler-api.railway.app)
```

**Expected Output**: 
```
✓ Deployment successful
→ https://oncall-scheduler-api.railway.app
```

**Test It**: 
```bash
curl https://oncall-scheduler-api.railway.app/health
# Should return: {"status":"ok"}
```

---

### ✅ **STEP 6: Deploy Frontend to Vercel** (20 minutes)

```bash
# 6.1 Install Vercel CLI
npm install -g vercel

# 6.2 Navigate to frontend
cd apps/web

# 6.3 Create .env.production file
echo "VITE_API_URL=https://oncall-scheduler-api.railway.app" > .env.production

# 6.4 Login to Vercel
vercel login
# Follow prompts

# 6.5 Deploy to production
vercel --prod

# 6.6 Follow prompts:
# Set up and deploy: Y
# Which scope: (your account)
# Link to existing project: N
# Project name: oncall-scheduler
# Directory: ./
# Override settings: N

# 6.7 Copy your deployment URL
# Example: https://oncall-scheduler.vercel.app
```

**Expected Output**: 
```
✓ Production: https://oncall-scheduler.vercel.app
```

---

### ✅ **STEP 7: Update Backend CORS** (5 minutes)

```bash
# 7.1 Go back to Railway
cd apps/api

# 7.2 Update FRONTEND_URL with your Vercel URL
railway variables set FRONTEND_URL=https://oncall-scheduler.vercel.app

# 7.3 Redeploy backend
railway up

# 7.4 Wait for deployment (1-2 minutes)
```

**Expected Output**: Backend redeploys successfully

---

### ✅ **STEP 8: Run Database Migrations on Production** (10 minutes)

```bash
# 8.1 Connect to production database
cd apps/api

# 8.2 Set environment variable temporarily
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# 8.3 Run migrations
npx prisma migrate deploy

# 8.4 Verify tables created
npx prisma studio
# Opens GUI - verify tables exist: Service, Intern, Group, etc.
```

**Expected Output**: 
```
✔ Applied 1 migration
```

---

### ✅ **STEP 9: Test Production Application** (15 minutes)

```bash
# 9.1 Open your Vercel URL in browser
open https://oncall-scheduler.vercel.app

# 9.2 Test complete flow:
# a) Click "Create New Service"
# b) Enter: Name="Test Hospital", Start=today, End=+90 days
# c) Submit → See join code
# d) Open incognito window
# e) Click "Join Existing Service"
# f) Enter join code and name "Dr. Smith"
# g) Create a group called "Night Shift" with 🌙 emoji
# h) Go back to first window
# i) Join "Night Shift" group
# j) Generate schedule
# k) View calendar

# If all steps work → SUCCESS! 🎉
```

**Expected Result**: Full workflow completes without errors

---

### ✅ **STEP 10: Set Up Monitoring** (30 minutes)

```bash
# 10.1 Sign up for Sentry
# Go to https://sentry.io → Sign up → Create project

# 10.2 Copy DSN (looks like https://xxx@xxx.ingest.sentry.io/xxx)

# 10.3 Add to Railway
railway variables set SENTRY_DSN="your-dsn-here"

# 10.4 Add to Vercel
vercel env add VITE_SENTRY_DSN
# Paste DSN when prompted
# Select: Production

# 10.5 Redeploy both
cd apps/api && railway up
cd apps/web && vercel --prod

# 10.6 Trigger test error
# In your app, cause an error
# Check Sentry dashboard - should see error logged
```

**Expected Output**: Errors appear in Sentry dashboard within 1 minute

---

### ✅ **STEP 11: Set Up Custom Domain** (Optional, 20 minutes)

```bash
# 11.1 In Vercel dashboard:
# Go to your project → Settings → Domains
# Add domain: oncall.yourhospital.com
# Copy DNS records

# 11.2 In your DNS provider (Cloudflare, GoDaddy, etc):
# Add CNAME record pointing to cname.vercel-dns.com

# 11.3 Wait for DNS propagation (5-30 minutes)

# 11.4 Update Railway FRONTEND_URL
railway variables set FRONTEND_URL=https://oncall.yourhospital.com

# 11.5 Update Vercel environment variable
vercel env add VITE_API_URL
# Enter: https://oncall-scheduler-api.railway.app
# Select: Production
```

**Expected Output**: Your app is live on custom domain!

---

### ✅ **STEP 12: Load Testing** (Optional but Recommended, 30 minutes)

```bash
# 12.1 Install k6
brew install k6  # macOS
# Or download from https://k6.io/

# 12.2 Run basic load test
cd tests
k6 run k6-test.js --vus 10 --duration 1m

# 12.3 Analyze results
# Look for:
# - http_req_duration p(95) < 500ms ✓
# - http_req_failed < 1% ✓

# 12.4 Run stress test
k6 run k6-test.js --vus 100 --duration 5m

# 12.5 Monitor in Railway dashboard
# Watch: CPU, Memory, Response times
```

**Expected Output**: 
```
✓ http_req_duration..............: avg=245ms p(95)=412ms
✓ http_req_failed................: 0.03%
```

---

## 🎓 Post-Deployment Checklist

After completing all 12 steps, verify:

- [ ] Production app loads at your URL
- [ ] Can create service and get join code
- [ ] Can join service with code
- [ ] Can create and join groups
- [ ] Real-time updates work (open 2 browsers)
- [ ] Schedule generation works
- [ ] Calendar displays correctly
- [ ] Mobile responsive (test on phone)
- [ ] PWA installable ("Add to Home Screen")
- [ ] Errors logged in Sentry
- [ ] Database backup configured in Supabase
- [ ] SSL certificate active (https://)

---

## 📁 Project Structure

```
oncall-scheduler/
├── apps/
│   ├── api/                          # Backend Node.js API
│   │   ├── src/
│   │   │   ├── routes/              # API endpoints
│   │   │   │   ├── services.ts      # Service CRUD
│   │   │   │   ├── groups.ts        # Group management
│   │   │   │   ├── requests.ts      # Join requests
│   │   │   │   └── schedule.ts      # Schedule generation
│   │   │   ├── socket/              # WebSocket handlers
│   │   │   │   ├── groups.ts        # Real-time group events
│   │   │   │   └── notifications.ts # Push notifications
│   │   │   ├── middleware/          # Express middleware
│   │   │   │   ├── auth.ts          # Authentication
│   │   │   │   ├── rateLimit.ts     # Rate limiting
│   │   │   │   └── errorHandler.ts  # Error handling
│   │   │   ├── services/            # Business logic
│   │   │   │   ├── scheduler.ts     # Round-robin algorithm
│   │   │   │   └── notifications.ts # Notification service
│   │   │   ├── utils/               # Helper functions
│   │   │   └── server.ts            # Express app setup
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Database schema
│   │   │   ├── migrations/          # DB migrations
│   │   │   └── seed.ts              # Seed data
│   │   ├── tests/                   # Backend tests
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Frontend React PWA
│       ├── src/
│       │   ├── components/          # React components
│       │   │   ├── ui/              # shadcn/ui components
│       │   │   ├── GroupCard.tsx    # Group display card
│       │   │   ├── Calendar.tsx     # Calendar view
│       │   │   ├── JoinRequest.tsx  # Request component
│       │   │   └── ...
│       │   ├── pages/               # Page components
│       │   │   ├── Welcome.tsx
│       │   │   ├── CreateService.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── GroupSelection.tsx
│       │   │   └── Calendar.tsx
│       │   ├── hooks/               # Custom React hooks
│       │   │   ├── useService.ts
│       │   │   ├── useGroups.ts
│       │   │   ├── useSocket.ts
│       │   │   └── useNotifications.ts
│       │   ├── lib/                 # Utilities
│       │   │   ├── api.ts           # API client
│       │   │   ├── socket.ts        # WebSocket client
│       │   │   └── storage.ts       # Local storage
│       │   ├── stores/              # Zustand stores
│       │   │   ├── userStore.ts
│       │   │   └── serviceStore.ts
│       │   ├── types/               # TypeScript types
│       │   ├── App.tsx              # Main app component
│       │   └── main.tsx             # Entry point
│       ├── public/
│       │   ├── manifest.json        # PWA manifest
│       │   ├── sw.js                # Service worker
│       │   ├── robots.txt
│       │   └── icons/               # App icons
│       ├── tests/                   # Frontend tests
│       ├── .env.example
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.js
│
├── packages/
│   └── types/                        # Shared TypeScript types
│       ├── service.ts
│       ├── intern.ts
│       ├── group.ts
│       └── index.ts
│
├── docs/
│   ├── INFRASTRUCTURE.md            # Infrastructure guide
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── CONTRIBUTING.md              # Contribution guide
│
├── tests/
│   ├── k6-test.js                   # Load tests
│   ├── artillery-ws.yml             # WebSocket tests
│   └── locustfile.py                # Scenario tests
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # CI pipeline
│       ├── deploy-staging.yml       # Staging deployment
│       └── deploy-production.yml    # Production deployment
│
├── docker-compose.yml               # Local development
├── .gitignore
├── package.json                     # Root package.json
├── tsconfig.json                    # Root TypeScript config
└── README.md                        # This file
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details.

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes and test
npm run test

# 3. Commit with conventional commits
git commit -m "feat: add group chat feature"

# 4. Push and create PR
git push origin feature/your-feature
```

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

- Hospital interns who provided feedback during development
- Open source community for amazing tools
- Anthropic's Claude for development assistance

---

## 📞 Support

- **Documentation**: [docs.oncallscheduler.com](https://docs.oncallscheduler.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/oncall-scheduler/issues)
- **Email**: support@oncallscheduler.com
- **Discord**: [Join our community](https://discord.gg/oncallscheduler)

---

**Built with ❤️ for hospital interns worldwide**