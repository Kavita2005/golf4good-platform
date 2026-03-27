# Golf4Good — Golf Charity Subscription Platform

A full-stack subscription-based golf platform combining performance tracking, monthly prize draws, and charitable giving.

**Built for: Digital Heroes Full-Stack Developer Selection Process**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (custom) + Supabase |
| Payments | Stripe (Subscriptions + Webhooks) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Project Structure

```
golf-charity-platform/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   ├── score/         # ScoreManager
│   │   │   ├── charity/       # CharitySelector
│   │   │   ├── dashboard/     # WinningsPanel, DrawHistory, SubscriptionStatus
│   │   │   └── admin/         # AdminUsers, AdminDraws, AdminCharities, AdminWinners, AdminAnalytics
│   │   ├── pages/             # All page components
│   │   ├── context/           # AuthContext
│   │   ├── lib/               # api.js, supabase.js
│   │   └── index.css          # Global styles + design system
│   ├── .env.example
│   └── vercel.json
│
├── backend/                   # Express API
│   ├── routes/
│   │   ├── auth.js            # Register, Login, Me
│   │   ├── scores.js          # CRUD + rolling 5-score logic
│   │   ├── subscriptions.js   # Stripe checkout, cancel, portal
│   │   ├── charities.js       # List, detail, select, donate
│   │   ├── draws.js           # Create, simulate, publish
│   │   ├── winners.js         # Winnings, proof upload, verify, pay
│   │   ├── admin.js           # Analytics, user management
│   │   └── webhooks.js        # Stripe webhook handler
│   ├── middleware/
│   │   └── auth.js            # JWT auth, admin guard, subscription guard
│   ├── services/
│   │   └── drawEngine.js      # Draw algorithm (random + weighted)
│   ├── utils/
│   │   └── supabase.js        # Supabase client
│   ├── .env.example
│   └── render.yaml
│
└── database/
    └── schema.sql             # Full Supabase schema + seed data
```

---

## Local Development Setup

### 1. Clone and install

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → Paste contents of `database/schema.sql` → Run
3. Go to **Settings → API** → Copy `URL` and `service_role` key

### 3. Set up Stripe

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create two products:
   - **Monthly Plan** — £12.99/month recurring → copy Price ID
   - **Yearly Plan** — £119.99/year recurring → copy Price ID
3. Go to **Developers → Webhooks** → Add endpoint:
   - URL: `https://your-backend.render.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 4. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, etc.

# Frontend
cp frontend/.env.example frontend/.env
# Fill in: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
```

### 5. Run locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## Deployment

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** (use a NEW account)
3. Import repository → Set **Root Directory** to `frontend`
4. Add environment variables:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_API_URL=https://your-backend.render.com/api
   ```
5. Deploy

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect repo → Set environment variables from `.env.example`
4. Build command: `npm install`
5. Start command: `node index.js`
6. Deploy

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| User | demo@golf4good.co | demo1234 |
| Admin | admin@golf4good.co | admin1234 |

---

## Feature Checklist

### User Features
- [x] Signup & login (JWT auth)
- [x] Monthly & yearly subscription via Stripe
- [x] Rolling 5-score Stableford entry (1–45)
- [x] Charity selection with adjustable contribution %
- [x] One-off donations
- [x] Dashboard: scores, charity, draws, winnings
- [x] Draw history & winnings overview

### Admin Features
- [x] Analytics dashboard (users, revenue, prizes, charity totals)
- [x] User management (view, edit, subscription control)
- [x] Draw creation & configuration
- [x] Draw simulation (random/weighted algorithms)
- [x] Draw publishing (triggers winner calculation)
- [x] Charity CRUD (add, edit, delete, feature)
- [x] Winner verification (approve/reject)
- [x] Payout tracking (mark as paid)

### System
- [x] Stripe webhook handling
- [x] Jackpot rollover logic
- [x] Prize pool distribution (40/35/25)
- [x] Mobile-first responsive design
- [x] Glass morphism dark UI
- [x] JWT authentication
- [x] Row-level security (Supabase)
- [x] Subscription access control

---

## Architecture Decisions

1. **JWT over Supabase Auth** — Full control over token payload and custom auth flows
2. **Express backend** — Stripe webhooks require raw body access (not possible with Supabase Edge Functions directly)
3. **Rolling score logic** — Enforced at API level, not just frontend
4. **Draw Engine service** — Isolated class makes algorithm swapping clean and testable
5. **Prize pool auto-calc** — Derived from active subscriber count at draw creation time

---



