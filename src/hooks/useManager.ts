import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryClient'
import type { TournamentManager, TournamentManagerInsert } from '@/types/tournament.types'
import { useUser } from '@/stores/authStores'

export function useManagers(tournamentId: string | null) {
  return useQuery({
    queryKey: queryKeys.managers.list(tournamentId || ''),
    queryFn: async () => {
      if (!tournamentId) throw new Error('Tournament ID required')
      
      const { data, error } = await supabase
        .from('tournament_managers')
        .select(`
          *,
          profile:profiles (
            display_name,
            avatar_url
          ),
          gameplan:gameplans (
            id,
            name,
            tactics
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('joined_at', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!tournamentId,
    staleTime: 1000 * 30,
  })
}

export function useMyManager(tournamentId: string | null) {
  const user = useUser()
  const { data: managers } = useManagers(tournamentId)
  
  return managers?.find(m => m.user_id === user?.id) ?? null
}

export function useIsAdmin(tournamentId: string | null) {
  const myManager = useMyManager(tournamentId)
  return myManager?.role === 'OWNER' || myManager?.role === 'ADMIN'
}

export function useJoinTournament() {
    const queryClient = useQueryClient()
    const user = useUser()

    return useMutation({
        mutationFn: async ({
            tournamentId,
            teamName,
            gameplanId,
        }: {
            tournamentId: string
            teamName: string
            gameplanId: string
        }) => {
            if (!user) throw new Error('User must be logged in to join a tournament')
            const { data, error } = await supabase
                .from('tournament_managers')
                .insert({
                    tournament_id: tournamentId,
                    user_id: user.id,
                    team_name: teamName,
                    gameplan_id: gameplanId,
                    role: 'PLAYER',
                    status: 'ACTIVE',
                })
                .select()
                .single()
            if (error) {
                if (error.code === '23505') {
                    throw new Error('You have already joined this tournament')
                }
                throw error
            }
            return data
        },
        onSuccess: (_, { tournamentId }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.managers.list(tournamentId)
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.tournaments.detail(tournamentId)
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.tournaments.lists()
            })
        },
    })
}

export function useLeaveTournament() {
    const queryClient = useQueryClient()
    const user = useUser()

    return useMutation({
        mutationFn: async (tournamentId: string) => {
            if (!user) throw new Error('User must be logged in to leave a tournament')

            const { error } = await supabase
                .from('tournament_managers')
                .delete()
                .eq('tournament_id', tournamentId)
                .eq('user_id', user.id)

            if (error) throw error
        },
        onSuccess: (_, tournamentId) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.managers.list(tournamentId)
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.tournaments.lists()
            })
        },
    })
}

export function useUpdateManager() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            managerId,
            updates,
        }: {
            managerId: string
            updates: Partial<TournamentManager>
        }) => {
            const { data, error } = await supabase
                .from('tournament_managers')
                .update(updates)
                .eq('id', managerId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.managers.list(data.tournament_id)
            })
        },
    })
}

export function useKickPlayer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            managerId,
            tournamentId,
        }: {
            managerId: string
            tournamentId: string
        }) => {
            const { error } = await supabase
                .from('tournament_managers')
                .delete()
                .eq('id', managerId)

            if (error) throw error
        },
        onSuccess: (_, { tournamentId }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.managers.list(tournamentId)
            })
        },
    })
}