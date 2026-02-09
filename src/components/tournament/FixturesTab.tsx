import { useMatches } from "@/hooks/useMatches";
import { useScoreModal, useTournamentStore } from "@/stores/tournamentStore";
import { MatchCard } from '@/components/tournament/MatchCard'
import Modal from '@/components/ui/Modal'
import { LogScoreForm } from '@/components/tournament/LogScoreForm'

export function FixturesTab({ tournamentId }: { tournamentId: string }) {
    const { data: matches, isLoading } = useMatches(tournamentId)
    const { isOpen, matchId, close } = useScoreModal()

    return (
        <div>
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    Loading.........
                </div>
            ) : (
               <div className="grid gap-4">
                    {matches?.map(match => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                    </div>
                )}

                <Modal isOpen={isOpen} onClose={close} title="Log Match Score">
                    {matchId && <LoogScoreForm matchId={matchId} onClose = {close} />}
                </Modal>
        </div>
    )
}