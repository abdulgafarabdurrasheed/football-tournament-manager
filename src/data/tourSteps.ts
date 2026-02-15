import type { TourStep } from '@/stores/demoStore'

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to Football Tournament Manager!',
    content:
      "Don't know ball? Or just lazy? Either way, I'm here to give you the full stadium tour. I'll load up a fake Premier League with Arsenal, City, Liverpool, and Chelsea — so you can see what this app looks like with real data. No sign-ups needed, no forms to fill. Just sit back and click \"Next\".",
    route: '/dashboard',
    placement: 'center',
  },

  {
    id: 'dashboard-overview',
    title: '📊 This is Your Dashboard',
    content:
      "This is mission control. Your tournaments, your stats, your quick actions — all here. Right now it shows demo data. In the real app, these numbers update live as you play matches. Think of it as your manager's office... minus the coffee stains.",
    target: '[data-tour="dashboard-stats"]',
    route: '/dashboard',
    placement: 'bottom',
  },

  {
    id: 'quick-actions',
    title: '⚡ Quick Actions',
    content:
      "These are your shortcuts. \"Create Tournament\" is the big yellow button — that's where you set up a new competition. \"My Tournaments\" shows everything you're part of. \"My Profile\" is... well, you. We'll come back to creating a tournament later. First, let me show you an active one.",
    target: '[data-tour="quick-actions"]',
    route: '/dashboard',
    placement: 'bottom',
  },

  {
    id: 'tournament-list',
    title: '📋 Tournament List',
    content:
      'Here you can browse all tournaments. "My Tournaments" shows ones you\'re in. "Public Tournaments" lets you discover and join open competitions. You can search by name, filter by status and format. See that card below? That\'s our Demo Premier League. Let\'s click into it.',
    target: '[data-tour="tournament-list"]',
    route: '/tournaments',
    placement: 'bottom',
  },
  {
    id: 'tournament-header',
    title: '🏆 Tournament Overview',
    content:
      "This is the tournament page. Up top you see the name, status badge (\"In Progress\" — the season is live), how many players joined, when it was created, and the format. If you were the admin, you'd see buttons to manage things here. For now, let's explore the tabs below.",
    target: '[data-tour="tournament-header"]',
    route: '/tournament/demo-premier-league-2026',
    placement: 'bottom',
  },

  {
    id: 'fixtures-tab',
    title: '📅 Fixtures & Results',
    content:
      "The Fixtures tab shows every match, organized by round. Use the arrows to navigate between rounds, or click the dots. Green dots = completed rounds. Each match card shows the teams, the score, and when it was played. If you're an admin, you'd see a \"Log Score\" button to enter results.",
    target: '[data-tour="fixtures-content"]',
    route: '/tournament/demo-premier-league-2026',
    tab: 'fixtures',
    placement: 'top',
  },

  {
    id: 'standings-tab',
    title: '📊 League Table',
    content:
      "Now THIS is where it gets spicy. Man City top with 11 points, Liverpool and Arsenal level on 10 — separated only by goal difference. One slip and the whole table flips. See the form column on the right? Those colored circles show each team's last 5 results. Green = Win, Grey = Draw, Red = Loss. Classic Premier League drama.",
    target: '[data-tour="standings-content"]',
    route: '/tournament/demo-premier-league-2026',
    tab: 'standings',
    placement: 'top',
  },

  {
    id: 'stats-tab',
    title: '📈 Tournament Statistics',
    content:
      "Stats nerds, this one's for you. Total goals, average per match, highest-scoring match, top scorers, top assist providers, and clean sheets. Haaland leads the Golden Boot with 7 goals. Salah right behind with 6. De Bruyne pulling the strings in the assists chart. The numbers don't lie.",
    target: '[data-tour="stats-content"]',
    route: '/tournament/demo-premier-league-2026',
    tab: 'stats',
    placement: 'top',
  },

  {
    id: 'how-to-create',
    title: '🛠️ Creating Your Own Tournament',
    content:
      "Ready to run your own league? Hit \"Create Tournament\" from the Dashboard or Tournament List. You'll go through 4 quick steps: (1) Name & visibility, (2) Pick a format — League, Knockout, or Hybrid, (3) Set points and match format, (4) Review and confirm. That's it. Your tournament goes to \"Draft\" mode — then you open registration, invite mates, and start when ready.",
    route: '/tournament/demo-premier-league-2026',
    placement: 'center',
  },
#
  {
    id: 'tour-end',
    title: '🎉 Tour Complete!',
    content:
      "That's the full tour. You've seen fixtures, standings, stats, and how everything fits together. This was all running on fake demo data — no real database calls. Now go create your own tournament and fill it with real drama. And hey... I worked really hard on this, so rate well for me eh? 😘😉",
    placement: 'center',
  },
]
