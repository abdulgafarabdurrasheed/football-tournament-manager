import { useTournamentStore } from '@/stores/tournamentStore'
import type { MatchWithManagers } from '@/types/tournament.types'

export function MatchCard({ match }: { match: MatchWithManagers }) {
    const { openScoreModal } = useTournamentStore()
    return(
        <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
            <div>
                <div className="font-semibold text-white">
                    {match.home_manager?.team_name} vs {match.away_manager?.team_name}
                </div>
                <div className="text-slate-400 text-sm">
                    Round {match.round} {match.leg ? `Leg ${match.leg}` : ''}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-yellow-400">
                    {match.status === 'COMPLETED' ? `${match.home_score} - ${match.away_score}` : 'vs'}
                </span>
                {match.status !== 'COMPLETED' && (
                    <button className="px-3 py-1 rounded bg-yellow-500 text-slate-900 font-medium" onClick={() => openScoreModal(match.id)}>
                        Log Score
                    </button>
                )}
            </div>
        </div>
    )
}