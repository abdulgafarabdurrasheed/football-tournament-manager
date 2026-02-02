import type { Database } from './database.types'

export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
export type TournamentUpdate = Database['public']['Tables']['tournaments']['Update']

export type TournamentManager = Database['public']['Tables']['tournament_managers']['Row']
export type TournamentManagerInsert = Database['public']['Tables']['tournament_managers']['Insert']

export type Match = Database['public']['Tables']['matches']['Row']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']

export type PlayerStat = Database['public']['Tables']['player_stats']['Row']
export type PlayerStatInsert = Database['public']['Tables']['player_stats']['Insert']

export type TournamentInvite = Database['public']['Tables']['tournament_invites']['Row']

export interface TournamentSettings {
    pointsForWin: number
    pointsForDraw: number
    pointsForLoss: number
    legsPerMatch: 1 | 2
    groupSize: number
    teamsAdvancing: number
    hasThirdPlace: boolean
    tiebreakers: ('goalDifference' | 'goalsScored' | 'headToHead')[]
}

export interface ManagerStats {
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    points: number
    form: ('W' | 'D' | 'L')[]
}

export const TOURNAMENT_FORMATS = {
    LEAGUE: 'LEAGUE',
    KNOCKOUT: 'KNOCKOUT',
    HYBRID_MULTI_GROUP: 'HYBRID_MULTI_GROUP',
    HYBRID_SINGLE_LEAGUE: 'HYBRID_SINGLE_LEAGUE',
} as const

export type TournamentFormat = keyof typeof TOURNAMENT_FORMATS

export const TOURNAMENT_STATUS = {
    DRAFT: 'DRAFT',
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    KNOCKOUT_STAGE: 'KNOCKOUT_STAGE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const

export type TournamentStatus = keyof typeof TOURNAMENT_STATUS

export const TOURNAMENT_VISIBILITY = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
    INVITE_ONLY: 'INVITE_ONLY',
} as const

export type TournamentVisibility = keyof typeof TOURNAMENT_VISIBILITY

export interface TournamentWithManagers extends Tournament {
  tournament_managers: TournamentManager[]
}

export interface TournamentWithDetails extends Tournament {
  tournament_managers: (TournamentManager & {
    profile?: {
      display_name: string
      avatar_url: string | null
    }
  })[]
  matches: Match[]
}

export interface MatchWithManagers extends Match {
  home_manager?: TournamentManager & {
    profile?: {
      display_name: string
      avatar_url: string | null
    }
  }
  away_manager?: TournamentManager & {
    profile?: {
      display_name: string
      avatar_url: string | null
    }
  }
  player_stats?: PlayerStat[]
}

export interface TournamentWizardData {
  name: string
  description: string
  visibility: TournamentVisibility
  
  format: TournamentFormat
  maxParticipants: number
  
  pointsForWin: number
  pointsForDraw: number
  legsPerMatch: 1 | 2
  groupSize: number
  teamsAdvancing: number
  hasThirdPlace: boolean
  
  inviteEmails: string[]
}