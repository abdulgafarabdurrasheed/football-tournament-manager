import { useMatches } from '@/hooks/useMatches'

export function BracketTab({ tournamentId }: { tournamentId: string }) {
    const { data: matches } = useMatches(tournamentId);

    if (!matches) return null;
    const knockoutMatches = matches.filter(m => m.match_type === 'KNOCKOUT' || m.match_type === 'FINAL' || m.match_type === 'THIRD_PLACE');
    const rounds = Array.from(new Set(knockoutMatches.map(m => m.round))).sort((a, b) => a - b);

    return (
        <div className="overflow-x-auto">
            {rounds.map(round => (
                <div key={round} className="mb-8">
                    <h3 className="tet-lg font-bold text-white mb-2">Round {round}</h3>
                    <div className="grid gap-4">
                        {knockoutMatches.filter(m => m.round === round).map(match => (
                            <div key={match.id} className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                                <span className="text-white font-semibold">{match.home_manager?.team_name || 'TBD'}</span>
                                <span className="text-yellow-400 font-bold text-lg">{match.status === 'COMPLETED' ? `${match.home_score} - ${match.away_score}` : 'vs'}</span>
                                <span className="text-white font-semibold">{match.away_manager?.team_name || 'TBD'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}