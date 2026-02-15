import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryClient'
import type { 
  Tournament, 
  TournamentInsert, 
  TournamentWithManagers,
  TournamentSettings 
} from '@/types/tournament.types'
import { useUser } from '@/stores/authStores'

export function useTournaments(filters?: {
  status?: string[]
  format?: string[]
  visibility?: string[]
  search?: string
  userId?: string
}) {
  const user = useUser()
  
  return useQuery({
    queryKey: queryKeys.tournaments.list(filters || {}),
    queryFn: async () => {
      let query = supabase
        .from('tournaments')
        .select(`
          *,
          tournament_managers!inner (
            id,
            user_id,
            team_name,
            role
          )
        `)
        .order('created_at', { ascending: false })
      
      if (filters?.status?.length) {
        query = query.in('status', filters.status)
      }
      if (filters?.format?.length) {
        query = query.in('format', filters.format)
      }
      if (filters?.visibility?.length) {
        query = query.in('visibility', filters.visibility)
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
      
      if (filters?.userId) {
        query = query.eq('tournament_managers.user_id', filters.userId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as TournamentWithManagers[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useMyTournaments() {
  const user = useUser()
  
  return useQuery({
    queryKey: [...queryKeys.tournaments.lists(), 'my', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_managers!inner (
            id,
            user_id,
            team_name,
            role,
            stats
          )
        `)
        .eq('tournament_managers.user_id', user.id)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data as TournamentWithManagers[]
    },
    enabled: !!user,
    staleTime: 1000 * 60,
  })
}

export function usePublicTournaments(search?: string) {
  return useQuery({
    queryKey: [...queryKeys.tournaments.lists(), 'public', search],
    queryFn: async () => {
      let query = supabase
        .from('tournaments')
        .select(`
          *,
          tournament_managers (count)
        `)
        .eq('visibility', 'PUBLIC')
        .in('status', ['OPEN', 'IN_PROGRESS'])
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as (Tournament & { tournament_managers: { count: number }[] })[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useTournament(tournamentId: string | null) {
  return useQuery({
    queryKey: queryKeys.tournaments.detail(tournamentId || ''),
    queryFn: async () => {
      if (!tournamentId) throw new Error('Tournament ID required')
      
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_managers (
            *,
            profile:profiles (
              display_name,
              avatar_url
            )
          )
        `)
        .eq('id', tournamentId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!tournamentId,
    staleTime: 1000 * 60,
  })
}

export function useCreateTournament() {
  const queryClient = useQueryClient()
  const user = useUser()
  
  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      format: Tournament['format']
      visibility: Tournament['visibility']
      settings: TournamentSettings
      maxParticipants: number
    }) => {
      if (!user) throw new Error('Must be logged in')
      
      const { data: tournament, error } = await supabase
        .from('tournaments')
        .insert({
          name: data.name,
          description: data.description,
          format: data.format,
          visibility: data.visibility,
          settings: data.settings,
          max_participants: data.maxParticipants,
          creator_id: user.id,
          status: 'DRAFT',
        })
        .select()
        .single()
      
      if (error) throw error
      
      const { error: managerError } = await supabase
        .from('tournament_managers')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          team_name: user.displayName || 'Team ' + user.id.slice(0, 4),
          role: 'OWNER',
          status: 'ACTIVE',
        })
      
      if (managerError) throw managerError
      
      return tournament
    },
    onSuccess: (tournament) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.lists() })
      queryClient.setQueryData(
        queryKeys.tournaments.detail(tournament.id),
        tournament
      )
    },
  })
}

export function useUpdateTournament() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      tournamentId, 
      updates 
    }: { 
      tournamentId: string
      updates: Partial<Tournament>
    }) => {
      const { data, error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', tournamentId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tournaments.detail(data.id) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tournaments.lists() 
      })
    },
  })
}

export function useDeleteTournament() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId)
      
      if (error) throw error
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.lists() })
      queryClient.removeQueries({ 
        queryKey: queryKeys.tournaments.detail(tournamentId) 
      })
    },
  })
}

export function useStartTournament() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data: tournament, error: tErr } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single()
      if (tErr || !tournament) throw tErr ?? new Error('Tournament not found')
      
      const { data: managers, error: mErr } = await supabase
        .from('tournament_managers')
        .select('id, user_id, team_name')
        .eq('tournament_id', tournamentId)
        .eq('status', 'ACTIVE')
      if (mErr) throw mErr
      if (!managers || managers.length < 2) throw new Error('Need at least 2 participants')
      
      const settings = tournament.settings as TournamentSettings
      const participants = managers.map(m => ({ id: m.id, teamName: m.team_name ?? 'Unknown' }))
      const { generateFixtures } = await import('@/utils/scheduler')
      
      const matches = generateFixtures(
        tournament.format as 'LEAGUE' | 'KNOCKOUT' | 'HYBRID_MULTI_GROUP' | 'HYBRID_SINGLE_LEAGUE',
        participants,
        {
          tournamentId,
          doubleLeg: (settings?.legsPerMatch ?? 1) > 1,
          groupSize: settings?.groupSize ?? 4,
          teamsAdvancing: settings?.teamsAdvancing ?? 2,
          hasThirdPlace: settings?.hasThirdPlace ?? false,
        }
      )
      
      if (matches.length > 0) {
        const { error: insertErr } = await supabase
          .from('matches')
          .insert(matches)
        if (insertErr) throw insertErr
      }
      
      const { error: updateErr } = await supabase
        .from('tournaments')
        .update({ status: 'IN_PROGRESS' })
        .eq('id', tournamentId)
      if (updateErr) throw updateErr
      
      return { tournamentId, matchCount: matches.length }
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tournaments.detail(tournamentId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.matches.list(tournamentId) 
      })
    },
  })
}