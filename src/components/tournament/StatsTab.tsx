import { useManagers } from '@/hooks/useManager'
import { useMatches } from '@/hooks/useMatches'
import { getTopScorers, getTopAssists, getTournamentStats } from '@/utils/analytics'

export function StatsTab({ tournamentId }: { tournamentId: string }) {
  const { data: managers } = useManagers(tournamentId)
  const { data: matches } = useMatches(tournamentId)
  if (!managers || !matches) return null
  const stats = getTournamentStats(matches, managers)
  const topScorers = getTopScorers([], managers)
  const topAssists = getTopAssists([], managers)

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Top Scorers</h3>
        <ul className="space-y-2">
          {topScorers.map((p, i) => (
            <li key={i} className="flex justify-between text-slate-300">
              <span>{p.playerName} ({p.teamName})</span>
              <span className="font-bold text-yellow-400">{p.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Top Assists</h3>
        <ul className="space-y-2">
          {topAssists.map((p, i) => (
            <li key={i} className="flex justify-between text-slate-300">
              <span>{p.playerName} ({p.teamName})</span>
              <span className="font-bold text-green-400">{p.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-lg font-bold text-white mb-2">Clean Sheets</h3>
        <ul className="space-y-2">
          {stats.cleanSheets.map((c, i) => (
            <li key={i} className="flex justify-between text-slate-300">
              <span>{managers.find(m => m.id === c.managerId)?.team_name || 'Unknown'}</span>
              <span className="font-bold text-blue-400">{c.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}