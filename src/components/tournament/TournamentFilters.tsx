import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FilterOption {
  value: string
  label: string
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

const FORMAT_OPTIONS: FilterOption[] = [
  { value: 'LEAGUE', label: 'League' },
  { value: 'KNOCKOUT', label: 'Knockout' },
  { value: 'HYBRID_MULTI_GROUP', label: 'Groups + KO' },
  { value: 'HYBRID_SINGLE_LEAGUE', label: 'League + Playoffs' },
]

interface TournamentFiltersProps {
  filters: {
    status: string[]
    format: string[]
  }
  onChange: (filters: Partial<{ status: string[]; format: string[] }>) => void
  onReset: () => void
}

export function TournamentFilters({ filters, onChange, onReset }: TournamentFiltersProps) {
  const toggleFilter = (type: 'status' | 'format', value: string) => {
    const current = filters[type]
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ [type]: updated })
  }
  
  const hasFilters = filters.status.length > 0 || filters.format.length > 0
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-2">Status</h4>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => toggleFilter('status', option.value)}
              className={`
                px-3 py-1.5 text-sm rounded-full transition-colors
                ${filters.status.includes(option.value)
                  ? 'bg-yellow-500 text-slate-900 font-medium'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-2">Format</h4>
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => toggleFilter('format', option.value)}
              className={`
                px-3 py-1.5 text-sm rounded-full transition-colors
                ${filters.format.includes(option.value)
                  ? 'bg-yellow-500 text-slate-900 font-medium'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {hasFilters && (
        <div className="pt-2 border-t border-slate-700">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="w-4 h-4 mr-1" />
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}