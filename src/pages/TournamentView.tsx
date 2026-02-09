import { useParams, useNavigate, Outlet, NavLink } from 'react-router-dom'
import { useTournament } from '@/hooks/useTournament'
import { useTournamentDetailRealtime } from '@/hooks/useRealtimeSubscription'
import { useActiveTournamentId, useTournamentStore } from '@/stores/tournamentStore'
import { Loader2, Trophy, Users, Table, BarChart2, GitBranch, Settings } from 'lucide-react'
import { useEffect } from 'react'

const TABS = [
    { id: 'fixtures', label: 'Fixtures', icon: Table },
    { id: 'standings', label: 'Standings', icon: BarChart2 },
    { id: 'bracket', label: 'Bracket', icon: GitBranch },
    { id: 'stats', label: 'Stats', icon: Trophy },
    { id: 'admin', label: 'Admin', icon: Settings },
]

export default function TournamentView() {
    const { tournamentId } = useParams()
    const navigate = useNavigate()
    const { data: tournament, isLoading, error } = useTournament(tournamentId || null)
    const setActiveTournament = useTournamentStore()
    useTournamentDetailRealtime(tournamentId || null)

    useEffect(() => {
        setActiveTournament(tournamentId || null)
        return () => setActiveTournament(null)
    }, [tournamentId, setActiveTournament])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin h-8 w-8 text-yellow-500" />
            </div>
        )
    }

    if (error || !tournament) {
        return (
            <div className="text-center py-24 text-red-400">Error loading tournament data.</div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        {tournament.name}
                    </h1>
                    <p className="text-slate-400">{tournament.description}</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                        {tournament.format}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                        {tournament.status}
                    </span>
                </div>
            </div>

            <div className="flex gap-2 mb-8 border-b border-slate-700">
                {TABS.map(tab => (
                    <NavLink
                        key={tab.id}
                        to={tab.id}
                        className={({ isActive }) =>
                            `px-4 py-2 -mb-px border-b-2 font-medium flex items-center gap-2 transition-colors ${
                                isActive ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'
                            }`
                            }
                            end
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </NavLink>
                ))}
            </div>
            <Outlet />
        </div>
    )
}