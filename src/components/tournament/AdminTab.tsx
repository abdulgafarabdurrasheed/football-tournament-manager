import { useManagers, useKickPlayer } from '@/hooks/useManager'
import { useUpdateTournament, useDeleteTournament } from '@/hooks/useTournament'

export function AdminTab({ tournamentId }: { tournamentId: string }) {
  const { data: managers } = useManagers(tournamentId)
  const kickPlayer = useKickPlayer()
  const updateTournament = useUpdateTournament()
  const deleteTournament = useDeleteTournament()

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white">Manage Players</h3>
      <ul className="space-y-2">
        {managers?.map(m => (
          <li key={m.id} className="flex items-center gap-4">
            <span className="text-slate-300">{m.team_name}</span>
            <button
              className="px-2 py-1 rounded bg-red-500 text-white"
              onClick={() => kickPlayer.mutate({ managerId: m.id, tournamentId })}
            >Kick</button>
          </li>
        ))}
      </ul>
      <h3 className="text-lg font-bold text-white mt-8">Tournament Settings</h3>
      <button
        className="mt-8 px-4 py-2 rounded bg-red-700 text-white font-bold"
        onClick={() => deleteTournament.mutate(tournamentId)}
      >Delete Tournament</button>
    </div>
  )
}
