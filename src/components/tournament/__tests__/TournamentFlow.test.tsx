import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
  },
}))

vi.mock('@/stores/authStore', () => ({
  useUser: vi.fn(() => ({ id: 'user-1', email: 'test@example.com' })),
  useAuthStore: vi.fn(() => ({
    user: { id: 'user-1', email: 'test@example.com' },
  })),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    )
  }
}

import { 
  generateRoundRobin, 
  generateKnockoutBracket, 
  generateHybridMultiGroup,
  getNextKnockoutMatch,
  getWinnerSlot,
} from '@/utils/scheduler'

describe('Scheduler', () => {
  describe('generateRoundRobin', () => {
    const teams = [
      { id: '1', teamName: 'Team A' },
      { id: '2', teamName: 'Team B' },
      { id: '3', teamName: 'Team C' },
      { id: '4', teamName: 'Team D' },
    ]
    
    it('generates correct number of fixtures (single leg)', () => {
      const fixtures = generateRoundRobin(teams, false)
      expect(fixtures).toHaveLength(6)
    })
    
    it('generates correct number of fixtures (double leg)', () => {
      const fixtures = generateRoundRobin(teams, true)
      expect(fixtures).toHaveLength(12)
    })
    
    it('every team plays every other team', () => {
      const fixtures = generateRoundRobin(teams, false)
      
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const matchExists = fixtures.some(f =>
            (f.home.id === teams[i].id && f.away.id === teams[j].id) ||
            (f.home.id === teams[j].id && f.away.id === teams[i].id)
          )
          expect(matchExists).toBe(true)
        }
      }
    })
    
    it('handles odd number of teams with BYE', () => {
      const oddTeams = teams.slice(0, 3)
      const fixtures = generateRoundRobin(oddTeams, false)
      expect(fixtures).toHaveLength(3)
      fixtures.forEach(f => {
        expect(f.home.id).not.toBe('BYE')
        expect(f.away.id).not.toBe('BYE')
      })
    })
    
    it('second leg reverses home/away', () => {
      const fixtures = generateRoundRobin(teams, true)
      const firstLeg = fixtures.filter(f => f.leg === 1)
      const secondLeg = fixtures.filter(f => f.leg === 2)
      
      expect(firstLeg.length).toBe(secondLeg.length)
      
      firstLeg.forEach(first => {
        const reverse = secondLeg.find(s => 
          s.home.id === first.away.id && s.away.id === first.home.id
        )
        expect(reverse).toBeDefined()
      })
    })
  })
  
  describe('generateKnockoutBracket', () => {
    const teams = Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      teamName: `Team ${i + 1}`,
      seed: i + 1,
    }))
    
    it('generates correct number of matches for 8 teams', () => {
      const matches = generateKnockoutBracket(teams, {
        tournamentId: 't1',
        hasThirdPlace: false,
      })
      expect(matches).toHaveLength(7)
    })
    
    it('generates 8 matches with third place', () => {
      const matches = generateKnockoutBracket(teams, {
        tournamentId: 't1',
        hasThirdPlace: true,
      })
      expect(matches).toHaveLength(8)
    })
    
    it('has one final match', () => {
      const matches = generateKnockoutBracket(teams, {
        tournamentId: 't1',
      })
      const finals = matches.filter(m => m.match_type === 'FINAL')
      expect(finals).toHaveLength(1)
    })
    
    it('handles non-power-of-2 with BYEs', () => {
      const sixTeams = teams.slice(0, 6)
      const matches = generateKnockoutBracket(sixTeams, {
        tournamentId: 't1',
      })
      const completedByes = matches.filter(m => 
        m.status === 'COMPLETED' && (m.home_manager_id === null || m.away_manager_id === null)
      )
      expect(completedByes.length).toBe(2)
    })
    
    it('seeding: top seed vs bottom seed in first round', () => {
      const matches = generateKnockoutBracket(teams, {
        tournamentId: 't1',
      })
      const firstRound = matches.filter(m => m.round === 1)
      
      const seed1Match = firstRound.find(m => 
        m.home_manager_id === '1' || m.away_manager_id === '1'
      )
      expect(seed1Match).toBeDefined()
      expect(
        seed1Match?.home_manager_id === '8' || seed1Match?.away_manager_id === '8'
      ).toBe(true)
    })
  })
  
  describe('getNextKnockoutMatch', () => {
    it('returns null for final', () => {
      const match = { match_type: 'FINAL', bracket_position: 1, round: 3 } as any
      expect(getNextKnockoutMatch([], match)).toBeNull()
    })
    
    it('returns correct next match', () => {
      const allMatches = [
        { id: '1', round: 1, bracket_position: 1, match_type: 'KNOCKOUT' },
        { id: '2', round: 1, bracket_position: 2, match_type: 'KNOCKOUT' },
        { id: '3', round: 2, bracket_position: 1, match_type: 'FINAL' },
      ] as any[]
      
      const result = getNextKnockoutMatch(allMatches, allMatches[0])
      expect(result?.id).toBe('3')
    })
  })
  
  describe('getWinnerSlot', () => {
    it('odd positions go home', () => {
      expect(getWinnerSlot(1)).toBe('home')
      expect(getWinnerSlot(3)).toBe('home')
    })
    
    it('even positions go away', () => {
      expect(getWinnerSlot(2)).toBe('away')
      expect(getWinnerSlot(4)).toBe('away')
    })
  })
})

import { calculateStandings, getFormGuide, getH2HStats, getTournamentStats } from '@/utils/analytics'

describe('Analytics', () => {
  const managers = [
    { id: 'm1', team_name: 'Team A', tournament_id: 't1', user_id: 'u1', role: 'PLAYER', status: 'ACTIVE' },
    { id: 'm2', team_name: 'Team B', tournament_id: 't1', user_id: 'u2', role: 'PLAYER', status: 'ACTIVE' },
    { id: 'm3', team_name: 'Team C', tournament_id: 't1', user_id: 'u3', role: 'PLAYER', status: 'ACTIVE' },
  ] as any[]
  
  const matches = [
    { id: '1', home_manager_id: 'm1', away_manager_id: 'm2', home_score: 3, away_score: 1, status: 'COMPLETED', match_type: 'GROUP', round: 1, played_at: '2026-01-01' },
    { id: '2', home_manager_id: 'm2', away_manager_id: 'm3', home_score: 2, away_score: 2, status: 'COMPLETED', match_type: 'GROUP', round: 1, played_at: '2026-01-02' },
    { id: '3', home_manager_id: 'm1', away_manager_id: 'm3', home_score: 1, away_score: 0, status: 'COMPLETED', match_type: 'GROUP', round: 2, played_at: '2026-01-03' },
    { id: '4', home_manager_id: 'm3', away_manager_id: 'm1', home_score: 0, away_score: 0, status: 'SCHEDULED', match_type: 'GROUP', round: 3 },
  ] as any[]
  
  describe('calculateStandings', () => {
    it('correctly calculates points', () => {
      const standings = calculateStandings(managers, matches, 3, 1)
      
      const teamA = standings.find(s => s.manager.id === 'm1')!
      expect(teamA.points).toBe(6)
      expect(teamA.won).toBe(2)
      expect(teamA.played).toBe(2)
      
      const teamB = standings.find(s => s.manager.id === 'm2')!
      expect(teamB.points).toBe(1)
      
      const teamC = standings.find(s => s.manager.id === 'm3')!
      expect(teamC.points).toBe(1)
    })
    
    it('sorts by points then goal difference', () => {
      const standings = calculateStandings(managers, matches, 3, 1)
      
      expect(standings[0].manager.id).toBe('m1')
      expect(standings[1].manager.id).toBe('m3')
      expect(standings[2].manager.id).toBe('m2')
    })
    
    it('calculates goal difference correctly', () => {
      const standings = calculateStandings(managers, matches, 3, 1)
      const teamA = standings.find(s => s.manager.id === 'm1')!
      
      expect(teamA.goalsFor).toBe(4)
      expect(teamA.goalsAgainst).toBe(1)
      expect(teamA.goalDifference).toBe(3)
    })
  })
  
  describe('getFormGuide', () => {
    it('returns correct form', () => {
      const form = getFormGuide('m1', matches, 5)
      expect(form).toEqual(['W', 'W'])
    })
    
    it('returns draws', () => {
      const form = getFormGuide('m2', matches, 5)
      expect(form).toEqual(['D', 'L'])
    })
    
    it('respects count limit', () => {
      const form = getFormGuide('m1', matches, 1)
      expect(form).toHaveLength(1)
    })
  })
  
  describe('getH2HStats', () => {
    it('returns correct h2h', () => {
      const h2h = getH2HStats('m1', 'm2', matches)
      
      expect(h2h.managerAWins).toBe(1)
      expect(h2h.managerBWins).toBe(0)
      expect(h2h.draws).toBe(0)
      expect(h2h.managerAGoals).toBe(3)
      expect(h2h.managerBGoals).toBe(1)
      expect(h2h.matches).toHaveLength(1)
    })
  })
  
  describe('getTournamentStats', () => {
    it('calculates aggregate stats', () => {
      const stats = getTournamentStats(matches, managers)
      
      expect(stats.completedMatches).toBe(3)
      expect(stats.pendingMatches).toBe(1)
      expect(stats.totalGoals).toBe(9)
      expect(stats.avgGoalsPerMatch).toBe(3)
    })
    
    it('finds highest scoring match', () => {
      const stats = getTournamentStats(matches, managers)
      expect(stats.highestScoringMatch?.id).toBe('2')
    })
  })
})