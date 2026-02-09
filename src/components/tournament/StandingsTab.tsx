import { useManagers } from "@/hooks/useManager";
import { useMatches } from "@/hooks/useMatches";
import { calculateStandings } from "@/utils/analytics";

export function StandingsTab({ tournamentId }: { tournamentId: string }) {
    const { data: managers } = useManagers(tournamentId)
    const { data: matches } = useMatches(tournamentId)
    const standings = managers && matches ? calculateStandings(managers, matches) : []

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-slate-800 rounded-lg">
                <thead>
                    <tr className="text-slate-400">
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2 text-left">Team</th>
                        <th className="px-2">P</th>
                        <th className="px-2">W</th>
                        <th className="px-2">D</th>
                        <th className="px-2">L</th>
                        <th className="px-2">GF</th>
                        <th className="px-2">GA</th>
                        <th className="px-2">GD</th>
                        <th className="px-2">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((entry, i) => (
                        <tr key={entry.managerId} className="text-white">
                            <td className="px-4 py-2 text-center">{i + 1}</td>
                            <td className="px-4 py-2">{entry.manager.team_name}</td>
                            <td className="px-2 text-center">{entry.played}</td>
                            <td className="px-2 text-center">{entry.won}</td>
                            <td className="px-2 text-center">{entry.drawn}</td>
                            <td className="px-2 text-center">{entry.lost}</td>
                            <td className="px-2 text-center">{entry.goalsFor}</td>
                            <td className="px-2 text-center">{entry.goalsAgainst}</td>
                            <td className="px-2 text-center">{entry.goalDifference}</td>
                            <td className="px-2 text-center font-bold">{entry.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
