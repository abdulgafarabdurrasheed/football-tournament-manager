import type {
  Tournament,
  TournamentManager,
  MatchWithManagers,
  TournamentSettings,
  ManagerStats,
  PlayerStat,
} from '@/types/tournament.types'


const DEMO_TOURNAMENT_ID = 'demo-premier-league-2026'
const DEMO_CREATOR_ID = 'demo-user-000'

const MANAGER_IDS = {
  arsenal: 'demo-mgr-arsenal',
  city: 'demo-mgr-city',
  liverpool: 'demo-mgr-liverpool',
  chelsea: 'demo-mgr-chelsea',
} as const

const MATCH_IDS = {
  r1m1: 'demo-match-r1m1',
  r1m2: 'demo-match-r1m2',
  r2m1: 'demo-match-r2m1',
  r2m2: 'demo-match-r2m2',
  r3m1: 'demo-match-r3m1',
  r3m2: 'demo-match-r3m2',
  r4m1: 'demo-match-r4m1',
  r4m2: 'demo-match-r4m2',
  r5m1: 'demo-match-r5m1',
  r5m2: 'demo-match-r5m2',
  r6m1: 'demo-match-r6m1',
  r6m2: 'demo-match-r6m2',
} as const


const now = new Date().toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()

function makeStats(p: number, w: number, d: number, l: number, gf: number, ga: number, form: ('W' | 'D' | 'L')[]): ManagerStats {
  return { played: p, won: w, drawn: d, lost: l, goalsFor: gf, goalsAgainst: ga, points: w * 3 + d, form }
}


const demoSettings: TournamentSettings = {
  pointsForWin: 3,
  pointsForDraw: 1,
  pointsForLoss: 0,
  legsPerMatch: 1,
  groupSize: 4,
  teamsAdvancing: 2,
  hasThirdPlace: false,
  tiebreakers: ['goalDifference', 'goalsScored', 'headToHead'],
}

export const demoTournament: Tournament = {
  id: DEMO_TOURNAMENT_ID,
  name: 'Demo Premier League 2026',
  description: 'A simulated Premier League season to show you around. This data is not real — relax.',
  format: 'LEAGUE',
  status: 'IN_PROGRESS',
  visibility: 'PUBLIC',
  creator_id: DEMO_CREATOR_ID,
  settings: demoSettings,
  max_participants: 8,
  current_round: 6,
  start_date: daysAgo(30),
  end_date: null,
  created_at: daysAgo(35),
  updated_at: now,
}


export const demoManagers: TournamentManager[] = [
  {
    id: MANAGER_IDS.arsenal,
    tournament_id: DEMO_TOURNAMENT_ID,
    user_id: 'demo-user-arsenal',
    team_name: 'Arsenal',
    group_number: null,
    seed: 1,
    role: 'OWNER',
    stats: makeStats(6, 3, 1, 2, 9, 9, ['W', 'L', 'W', 'W', 'D', 'L']),
    gameplan_id: null,
    status: 'ACTIVE',
    joined_at: daysAgo(34),
  },
  {
    id: MANAGER_IDS.city,
    tournament_id: DEMO_TOURNAMENT_ID,
    user_id: 'demo-user-city',
    team_name: 'Man City',
    group_number: null,
    seed: 2,
    role: 'PLAYER',
    stats: makeStats(6, 3, 2, 1, 11, 7, ['D', 'W', 'W', 'L', 'D', 'W']),
    gameplan_id: null,
    status: 'ACTIVE',
    joined_at: daysAgo(33),
  },
  {
    id: MANAGER_IDS.liverpool,
    tournament_id: DEMO_TOURNAMENT_ID,
    user_id: 'demo-user-liverpool',
    team_name: 'Liverpool',
    group_number: null,
    seed: 3,
    role: 'PLAYER',
    stats: makeStats(6, 3, 1, 2, 11, 5, ['D', 'W', 'L', 'W', 'L', 'W']),
    gameplan_id: null,
    status: 'ACTIVE',
    joined_at: daysAgo(33),
  },
  {
    id: MANAGER_IDS.chelsea,
    tournament_id: DEMO_TOURNAMENT_ID,
    user_id: 'demo-user-chelsea',
    team_name: 'Chelsea',
    group_number: null,
    seed: 4,
    role: 'PLAYER',
    stats: makeStats(6, 1, 0, 5, 5, 15, ['L', 'L', 'L', 'L', 'W', 'L']),
    gameplan_id: null,
    status: 'ACTIVE',
    joined_at: daysAgo(32),
  },
]

function makeMatch(
  id: string,
  round: number,
  homeId: string,
  awayId: string,
  homeScore: number,
  awayScore: number,
  playedDaysAgo: number
): MatchWithManagers {
  const homeManager = demoManagers.find(m => m.id === homeId)!
  const awayManager = demoManagers.find(m => m.id === awayId)!
  const winnerId = homeScore > awayScore ? homeId : awayScore > homeScore ? awayId : null

  return {
    id,
    tournament_id: DEMO_TOURNAMENT_ID,
    home_manager_id: homeId,
    away_manager_id: awayId,
    match_type: 'GROUP',
    round,
    leg: 1,
    group_number: null,
    bracket_position: null,
    knockout_round: null,
    home_score: homeScore,
    away_score: awayScore,
    home_aggregate: null,
    away_aggregate: null,
    home_extra_time: null,
    away_extra_time: null,
    home_penalties: null,
    away_penalties: null,
    decided_by: 'NORMAL',
    status: 'COMPLETED',
    winner_id: winnerId,
    scheduled_at: daysAgo(playedDaysAgo + 1),
    played_at: daysAgo(playedDaysAgo),
    created_at: daysAgo(playedDaysAgo + 2),
    updated_at: daysAgo(playedDaysAgo),
    home_manager: {
      ...homeManager,
      profile: {
        display_name: homeManager.team_name,
        avatar_url: null,
      },
    },
    away_manager: {
      ...awayManager,
      profile: {
        display_name: awayManager.team_name,
        avatar_url: null,
      },
    },
    player_stats: [],
  }
}

export const demoMatches: MatchWithManagers[] = [
  makeMatch(MATCH_IDS.r1m1, 1, MANAGER_IDS.arsenal, MANAGER_IDS.chelsea, 3, 1, 25),
  makeMatch(MATCH_IDS.r1m2, 1, MANAGER_IDS.liverpool, MANAGER_IDS.city, 1, 1, 25),
  makeMatch(MATCH_IDS.r2m1, 2, MANAGER_IDS.city, MANAGER_IDS.arsenal, 2, 0, 20),
  makeMatch(MATCH_IDS.r2m2, 2, MANAGER_IDS.chelsea, MANAGER_IDS.liverpool, 0, 2, 20),
  makeMatch(MATCH_IDS.r3m1, 3, MANAGER_IDS.arsenal, MANAGER_IDS.liverpool, 2, 1, 15),
  makeMatch(MATCH_IDS.r3m2, 3, MANAGER_IDS.city, MANAGER_IDS.chelsea, 4, 1, 15),
  makeMatch(MATCH_IDS.r4m1, 4, MANAGER_IDS.chelsea, MANAGER_IDS.arsenal, 1, 2, 10),
  makeMatch(MATCH_IDS.r4m2, 4, MANAGER_IDS.liverpool, MANAGER_IDS.city, 3, 0, 10),
  makeMatch(MATCH_IDS.r5m1, 5, MANAGER_IDS.arsenal, MANAGER_IDS.city, 1, 1, 5),
  makeMatch(MATCH_IDS.r5m2, 5, MANAGER_IDS.chelsea, MANAGER_IDS.liverpool, 2, 1, 5),
  makeMatch(MATCH_IDS.r6m1, 6, MANAGER_IDS.liverpool, MANAGER_IDS.chelsea, 3, 0, 1),
  makeMatch(MATCH_IDS.r6m2, 6, MANAGER_IDS.city, MANAGER_IDS.arsenal, 3, 1, 1),
]


export const demoPlayerStats: PlayerStat[] = [
  { id: 'demo-ps-1', match_id: MATCH_IDS.r1m1, manager_id: MANAGER_IDS.arsenal, player_name: 'Bukayo Saka', player_position: 'RW', goals: 2, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 9.0, created_at: now },
  { id: 'demo-ps-2', match_id: MATCH_IDS.r1m1, manager_id: MANAGER_IDS.arsenal, player_name: 'Martin Ødegaard', player_position: 'CAM', goals: 1, assists: 2, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 8.5, created_at: now },
  { id: 'demo-ps-3', match_id: MATCH_IDS.r3m1, manager_id: MANAGER_IDS.arsenal, player_name: 'Bukayo Saka', player_position: 'RW', goals: 1, assists: 1, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 8.0, created_at: now },
  { id: 'demo-ps-4', match_id: MATCH_IDS.r4m1, manager_id: MANAGER_IDS.arsenal, player_name: 'Kai Havertz', player_position: 'CF', goals: 2, assists: 0, own_goals: 0, yellow_cards: 1, red_cards: 0, minutes_played: 90, rating: 8.2, created_at: now },
  { id: 'demo-ps-5', match_id: MATCH_IDS.r5m1, manager_id: MANAGER_IDS.arsenal, player_name: 'Martin Ødegaard', player_position: 'CAM', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 7.5, created_at: now },
  { id: 'demo-ps-26', match_id: MATCH_IDS.r6m2, manager_id: MANAGER_IDS.arsenal, player_name: 'Bukayo Saka', player_position: 'RW', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 7.0, created_at: now },

  { id: 'demo-ps-6', match_id: MATCH_IDS.r2m1, manager_id: MANAGER_IDS.city, player_name: 'Erling Haaland', player_position: 'ST', goals: 2, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 9.2, created_at: now },
  { id: 'demo-ps-7', match_id: MATCH_IDS.r3m2, manager_id: MANAGER_IDS.city, player_name: 'Erling Haaland', player_position: 'ST', goals: 2, assists: 1, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 9.5, created_at: now },
  { id: 'demo-ps-8', match_id: MATCH_IDS.r3m2, manager_id: MANAGER_IDS.city, player_name: 'Phil Foden', player_position: 'LW', goals: 1, assists: 1, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 8.0, created_at: now },
  { id: 'demo-ps-9', match_id: MATCH_IDS.r3m2, manager_id: MANAGER_IDS.city, player_name: 'Kevin De Bruyne', player_position: 'CM', goals: 1, assists: 2, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 85, rating: 8.8, created_at: now },
  { id: 'demo-ps-10', match_id: MATCH_IDS.r1m2, manager_id: MANAGER_IDS.city, player_name: 'Erling Haaland', player_position: 'ST', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 7.5, created_at: now },
  { id: 'demo-ps-11', match_id: MATCH_IDS.r5m1, manager_id: MANAGER_IDS.city, player_name: 'Phil Foden', player_position: 'LW', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 7.2, created_at: now },
  { id: 'demo-ps-27', match_id: MATCH_IDS.r6m2, manager_id: MANAGER_IDS.city, player_name: 'Erling Haaland', player_position: 'ST', goals: 2, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 9.0, created_at: now },
  { id: 'demo-ps-28', match_id: MATCH_IDS.r6m2, manager_id: MANAGER_IDS.city, player_name: 'Kevin De Bruyne', player_position: 'CM', goals: 1, assists: 1, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 8.0, created_at: now },

  { id: 'demo-ps-12', match_id: MATCH_IDS.r1m2, manager_id: MANAGER_IDS.liverpool, player_name: 'Mohamed Salah', player_position: 'RW', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 7.8, created_at: now },
  { id: 'demo-ps-13', match_id: MATCH_IDS.r2m2, manager_id: MANAGER_IDS.liverpool, player_name: 'Mohamed Salah', player_position: 'RW', goals: 1, assists: 1, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 8.5, created_at: now },
  { id: 'demo-ps-14', match_id: MATCH_IDS.r2m2, manager_id: MANAGER_IDS.liverpool, player_name: 'Diogo Jota', player_position: 'LW', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 75, rating: 7.8, created_at: now },
  { id: 'demo-ps-15', match_id: MATCH_IDS.r3m1, manager_id: MANAGER_IDS.liverpool, player_name: 'Mohamed Salah', player_position: 'RW', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 7.5, created_at: now },
  { id: 'demo-ps-16', match_id: MATCH_IDS.r4m2, manager_id: MANAGER_IDS.liverpool, player_name: 'Mohamed Salah', player_position: 'RW', goals: 2, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 9.0, created_at: now },
  { id: 'demo-ps-17', match_id: MATCH_IDS.r4m2, manager_id: MANAGER_IDS.liverpool, player_name: 'Diogo Jota', player_position: 'LW', goals: 1, assists: 1, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 8.0, created_at: now },
  { id: 'demo-ps-18', match_id: MATCH_IDS.r6m1, manager_id: MANAGER_IDS.liverpool, player_name: 'Mohamed Salah', player_position: 'RW', goals: 1, assists: 1, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 8.5, created_at: now },
  { id: 'demo-ps-19', match_id: MATCH_IDS.r6m1, manager_id: MANAGER_IDS.liverpool, player_name: 'Diogo Jota', player_position: 'LW', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 80, rating: 7.8, created_at: now },
  { id: 'demo-ps-20', match_id: MATCH_IDS.r6m1, manager_id: MANAGER_IDS.liverpool, player_name: 'Darwin Núñez', player_position: 'ST', goals: 1, assists: 1, own_goals: 0, yellow_cards: 1, red_cards: 0, minutes_played: 90, rating: 7.5, created_at: now },

  { id: 'demo-ps-21', match_id: MATCH_IDS.r1m1, manager_id: MANAGER_IDS.chelsea, player_name: 'Cole Palmer', player_position: 'RW', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 7.0, created_at: now },
  { id: 'demo-ps-22', match_id: MATCH_IDS.r3m2, manager_id: MANAGER_IDS.chelsea, player_name: 'Cole Palmer', player_position: 'RW', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 6.5, created_at: now },
  { id: 'demo-ps-23', match_id: MATCH_IDS.r4m1, manager_id: MANAGER_IDS.chelsea, player_name: 'Nicolas Jackson', player_position: 'ST', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 6.8, created_at: now },
  { id: 'demo-ps-24', match_id: MATCH_IDS.r5m2, manager_id: MANAGER_IDS.chelsea, player_name: 'Cole Palmer', player_position: 'RW', goals: 1, assists: 1, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 8.0, created_at: now },
  { id: 'demo-ps-25', match_id: MATCH_IDS.r5m2, manager_id: MANAGER_IDS.chelsea, player_name: 'Nicolas Jackson', player_position: 'ST', goals: 1, assists: 0, own_goals: 0, yellow_cards: 0, red_cards: 0, minutes_played: 90, rating: 7.5, created_at: now },
]


export const DEMO_TOURNAMENT_ID_CONST = DEMO_TOURNAMENT_ID
