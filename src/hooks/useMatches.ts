import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryClient'
import type { Match, MatchUpdate, MatchWithManagers } from '@/types/tournament.types'
import { toast } from 'sonner'

export function useMatches(tournamentId: string | null) {
    return useQuery({
        queryKey: queryKeys.matches.list(tournamentId || ''),
        queryFn: async () => {
            if (!tournamentId) throw new Error('Tournament ID required')

            const { data, error } = await supabase
                .from('matches')
                .select(`
                    *,
                    home_manager:tournament_managers!home_manager_id (
                        id,
                        team_name,
                        user_id,
                        profile:profiles (
                            display_name,
                            avatar_url
                        )
                    ),
                    away_manager:tournament_managers!away_manager_id (
                        id,
                        team_name,
                        user_id,
                        profile:profiles (
                            display_name,
                            avatar_url
                        )
                    )
                `)
                .eq('tournament_id', tournamentId)
                .order('round', { ascending: true })
                .order('bracket_position', { ascending: true })

            if (error) throw error
            return data as MatchWithManagers[]
        },
        enabled: !!tournamentId,
        staleTime: 1000 * 30
    })
}

export function useMatchesByRound(tournamentId: string | null, round: number) {
    const { data: allMatches, ...rest } = useMatches(tournamentId)

    const roundMatches = allMatches?.filter(m => m.round === round) ?? []

    return { data: roundMatches, ...rest }
}

export function useMatch(matchId: string | null) {
    return useQuery({
        queryKey: queryKeys.matches.detail(matchId || ''),
        queryFn: async () => {
            if (!matchId) throw new Error('Match ID required')

            const { data, error } = await supabase
                .from('matches')
                .select(`
                    *,
                    home_manager:tournament_managers!home_manager_id (
                        *,
                        profile:profiles (display_name, avatar_url),
                        gameplan:gameplans (*)
                    ),
                    away_manager:tournament_managers!away_manager_id (
                        *,
                        profile:profiles (display_name, avatar_url),
                        gameplan:gameplans (*)
                    ),
                    player_stats (*)
                `)
                .eq('id', matchId)
                .single()

            if (error) throw error
            return data
        },
        enabled: !!matchId,
    })
}

export function useLogScore() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            matchId,
            homeScore,
            awayScore,
            decidedBy = 'NORMAL',
        }: {
            matchId: string
            homeScore: number
            awayScore: number
            decidedBy?: 'NORMAL' | 'EXTRA_TIME' | 'PENALTIES'
        }) => {
            const { data, error } = await supabase
                .from('matches')
                .update({
                    home_score: homeScore,
                    away_score: awayScore,
                    status: 'COMPLETED',
                    decided_by: decidedBy,
                    played_at: new Date().toISOString(),
                })
                .eq('id', matchId)
                .select()
                .single()
            if (error) throw error
            return data
        },

        onMutate: async ({ matchId, homeScore, awayScore }) => {
            const match = queryClient.getQueryData<MatchWithManagers>(
                queryKeys.matches.detail(matchId)
            )

            if (!match) return { previousMatches: null }

            const tournamentId = match.tournament_id

            await queryClient.cancelQueries({ 
                    queryKey: queryKeys.matches.list(tournamentId) 
            })
            const previousMatches = queryClient.getQueryData<MatchWithManagers[]>(
                queryKeys.matches.list(tournamentId)
            )

            queryClient.setQueryData<MatchWithManagers[]>(
                queryKeys.matches.list(tournamentId),
                (old) => old?.map(m => 
                    m.id === matchId
                    ? { ...m, home_score: homeScore, away_score: awayScore, status: 'COMPLETED' }
                    : m
                )
            )

            return { previousMatches, tournamentId }
        },

        onError: (err, _, context) => {
            if (context?.previousMatches &&  context?.tournamentId) {
                queryClient.setQueryData(
                    queryKeys.matches.list(context.tournamentId),
                    context.previousMatches
                )
            }
            toast.error('Failed to log score')
        },

        onSettled: (data) => {
            if (data) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.matches.list(data.tournament_id)
                })

                queryClient.invalidateQueries({
                    queryKey: queryKeys.playerStats.tournament(data.tournament_id)
                })

                queryClient.invalidateQueries({
                    queryKey: queryKeys.managers.list(data.tournament_id)
                })
            }
        },
    })
}

export function useGenerateFixtures() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      tournamentId,
      matches,
    }: {
      tournamentId: string
      matches: Omit<Match, 'id' | 'created_at' | 'updated_at'>[]
    }) => {
      const { data, error } = await supabase
        .from('matches')
        .insert(matches)
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, { tournamentId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.matches.list(tournamentId) 
      })
    },
  })
}