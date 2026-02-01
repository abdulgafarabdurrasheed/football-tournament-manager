import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { queryKeys } from './queryClient'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type TableName = 'tournaments' | 'tournament_managers' | 'matches' | 'player_stats'

interface SubscriptionConfig {
  table: TableName
  filter?: string
  onInsert?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
}

export function createTournamentChannel(
  tournamentId: string,
  callbacks?: {
    onMatchUpdate?: () => void
    onManagerUpdate?: () => void
    onTournamentUpdate?: () => void
  }
): RealtimeChannel {
  const channel = supabase.channel(`tournament:${tournamentId}`)
  
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tournaments',
      filter: `id=eq.${tournamentId}`,
    },
    (payload) => {
      console.log('Tournament update:', payload)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tournaments.detail(tournamentId) 
      })
      callbacks?.onTournamentUpdate?.()
    }
  )
  
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'matches',
      filter: `tournament_id=eq.${tournamentId}`,
    },
    (payload) => {
      console.log('Match update:', payload)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.matches.list(tournamentId) 
      })
      if (payload.new && (payload.new as { status?: string }).status === 'COMPLETED') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.playerStats.tournament(tournamentId)
        })
      }
      callbacks?.onMatchUpdate?.()
    }
  )
  
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tournament_managers',
      filter: `tournament_id=eq.${tournamentId}`,
    },
    (payload) => {
      console.log('Manager update:', payload)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.managers.list(tournamentId) 
      })
      callbacks?.onManagerUpdate?.()
    }
  )
  
  return channel
}

export function subscribeToTournament(
  tournamentId: string,
  callbacks?: {
    onMatchUpdate?: () => void
    onManagerUpdate?: () => void
    onTournamentUpdate?: () => void
  }
): () => void {
  const channel = createTournamentChannel(tournamentId, callbacks)
  
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`Subscribed to tournament ${tournamentId}`)
    }
    if (status === 'CHANNEL_ERROR') {
      console.error(`Failed to subscribe to tournament ${tournamentId}`)
    }
  })
  
  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToTournamentList(
  userId: string,
  onUpdate: () => void
): () => void {
  const channel = supabase
    .channel('tournament-list')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tournaments',
      },
      () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.lists() })
        onUpdate()
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tournament_managers',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.lists() })
        onUpdate()
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}