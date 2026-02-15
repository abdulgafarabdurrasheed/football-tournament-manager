# Football Tournament Manager

A full-featured web application for creating, managing, and tracking football tournaments. Supports multiple formats: League, Knockout, and Hybrid, with real-time updates, detailed statistics, and a guided demo tour. Created for Flavortown.

---

## Features

### Tournament Management
- **4 Tournament Formats**
- **Multi-step Creation Wizard**
- **Flexible Settings**
- **Status Lifecycle**

### Match Scoring
- Full scoreline entry with support for:
  - Extra time and penalties
  - Two-leg aggregate scoring
  - Away goals rule
- Per-match **player statistics**

### Live Data
- **Real-time updates** via Supabase Realtime channels — scores, standings, and participant changes push instantly to all viewers
- **React Query** caching with automatic invalidation on real-time events

### Statistics & Standings
- League table with form guide (W/D/L indicators)
- Top scorers and assist leaders
- Clean sheet tracking
- Highest-scoring match highlights
- Per-match and per-round breakdowns

### Invite System
- Email-based invitations
- Shareable 6-character invite codes
- Auto-expiry after 7 days

### Interactive Demo Tour
- Guided walkthrough with pundit-style commentary
- Injects a fake Premier League season (Arsenal, Man City, Liverpool, Chelsea) — no real database calls
- 10-step tour covering Dashboard, Tournament List, Fixtures, Standings, Stats, and the Creation Wizard
- "Retake the tour" option persisted via localStorage

### Other
- Email/password and Google OAuth authentication
- User profiles with stats and preferences
- Tactical game plans (formations, player assignments)
- Sentry error monitoring in production
- Responsive design (mobile-friendly)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 · TypeScript 5.9 |
| **Build** | Vite 7 |
| **Routing** | React Router 7 |
| **Client State** | Zustand 5 |
| **Server State** | TanStack React Query 5 |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, RLS) |
| **Styling** | Tailwind CSS 3 · tailwindcss-animate |
| **UI Primitives** | Radix UI · shadcn/ui |
| **Forms** | React Hook Form 7 · Zod 4 |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Toasts** | Sonner |
| **Linting** | Biome |
| **Testing** | Vitest · Testing Library · Playwright |
| **Monitoring** | Sentry |
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/abdulgafarabdurrasheed/football-tournament-manager.git
cd football-tournament-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=your-sentry-dsn          # optional, production only
```

### 4. Set up the database

Run the migrations in your Supabase project (via the SQL editor or CLI):

```bash
npx supabase db push
```

Or manually run the SQL files in `supabase/migrations/` in order.

### 5. Start the dev server

```bash
npm run dev
```