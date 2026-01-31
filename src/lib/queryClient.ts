import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            retry: 3,
            refetchOnWindowFocus: true,
            refetchOnMount: false,
        },
        mutations: {
            onError: (error) => {
                console.error('Mutation error:', error)
            },
        },
    },
})

export const queryKeys = {
    tournaments: {
        all: ['tournaments'] as const,
        lists: () => [...queryKeys.tournaments.all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.tournaments.lists(), filters] as const,
        details: () => [...queryKeys.tournaments.all, 'details'] as const,
        detail: (id: string) => [...queryKeys.tournaments.details(), id] as const,
    },

    matches: {
        all: ['matches'] as const,
        lists: () => [...queryKeys.matches.all, 'list'] as const,
        list: (tournamentId: string) => [...queryKeys.matches.lists(), tournamentId] as const,
        detail: (matchId: string) => [...queryKeys.matches.all, 'detail', matchId] as const,
    },

    managers: {
        all: ['managers'] as const,
        list: (tournamentId: string) => [...queryKeys.managers.all, tournamentId] as const,
    },

    playerStats: {
        all: ['playerStats'] as const,
        match: (matchId: string) => [...queryKeys.playerStats.all, 'match', matchId] as const,
        tournament: (tournamentId: string) => [...queryKeys.playerStats.all, 'tournament', tournamentId] as const,
        topScorers: (tournamentId: string) => [...queryKeys.playerStats.all, 'topScorers', tournamentId] as const,
    },

    invites: {
        all: ['invites'] as const,
        tournament: (tournamentId: string) => [...queryKeys.invites.all, tournamentId] as const,
        code: (code: string) => [...queryKeys.invites.all, 'code', code] as const,
    },
}