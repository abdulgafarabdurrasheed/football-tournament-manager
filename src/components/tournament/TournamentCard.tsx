import { Link } from 'react-router-dom'
import { Trophy, Users, Calendar, Globe, Lock, Mail } from 'lucide-react'
import type { TournamentWithManagers } from '@/types/tournament.types'

interface TournamentCardProps {
  tournament: TournamentWithManagers
}

const STATUS_COLORS = {
  DRAFT: 'bg-slate-600',
  OPEN: 'bg-blue-500',
  IN_PROGRESS: 'bg-green-500',
  KNOCKOUT_STAGE: 'bg-purple-500',
  COMPLETED: 'bg-slate-500',
  CANCELLED: 'bg-red-500',
}

const STATUS_LABELS = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  KNOCKOUT_STAGE: 'Knockout Stage',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const FORMAT_LABELS = {
  LEAGUE: 'League',
  KNOCKOUT: 'Knockout',
  HYBRID_MULTI_GROUP: 'Groups + KO',
  HYBRID_SINGLE_LEAGUE: 'League + Playoffs',
}

const VISIBILITY_ICONS = {
  PUBLIC: Globe,
  PRIVATE: Lock,
  INVITE_ONLY: Mail,
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const VisibilityIcon = VISIBILITY_ICONS[tournament.visibility]
  const participantCount = tournament.tournament_managers?.length ?? 0
  
  return (
    <Link to={`/tournament/${tournament.id}`}>
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className={`
              px-2 py-0.5 text-xs font-medium rounded-full text-white
              ${STATUS_COLORS[tournament.status]}
            `}>
              {STATUS_LABELS[tournament.status]}
            </span>
          </div>
          <VisibilityIcon className="w-4 h-4 text-slate-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-1 truncate">
          {tournament.name}
        </h3>
        
        <p className="text-sm text-slate-400 mb-3">
          {FORMAT_LABELS[tournament.format]}
        </p>
        
        {tournament.description && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
            {tournament.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <Users className="w-4 h-4" />
            <span>{participantCount}/{tournament.max_participants}</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(tournament.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}