import { useEffect, useRef } from 'react'
import { subscribeToTournament, subscribeToTournamentList } from '@/lib/realtime'
import { useUser } from '@/stores/authStores'

export function useTournamentRealtime(
    tournamentId: string | null,
    callbacks?: {
        onMatchUpdate?: () => void
        onManagerUpdate?: () => void
        onTournamentUpdate?: () => void
    }
) {
    const unsubscribeRef = useRef<() => void | null>(null)

    useEffect(() => {
        if(!tournamentId) return;

        unsubscribeRef.current = subscribeToTournament(tournamentId, callbacks)

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
                unsubscribeRef.current = null
            }
        }
    }, [tournamentId, callbacks?.onMatchUpdate, callbacks?.onManagerUpdate, callbacks?.onTournamentUpdate])
}

export function useTournamentListRealtime(onUpdate?: () => void){
    const user = useUser()
    const unsubscribeRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        if (!user?.id) return;

        unsubscribeRef.current = subscribeToTournamentList(user.id, onUpdate ?? (() => {}))

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
                unsubscribeRef.current = null
            }
        }
    }, [user?.id, onUpdate])
}

export function useTournamentDetailRealtime(tournamentId: string | null) {
    useTournamentRealtime(tournamentId, {
        onMatchUpdate: () => {
            console.log('Match updated via realtime')
        },
        onManagerUpdate: () => {
            console.log('Manager updated via realtime')
        },
        onTournamentUpdate: () => {
            console.log('Tournament updated via realtime')
        },
    })
}