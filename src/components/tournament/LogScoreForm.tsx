import { useForm } from 'react-hook-form'
import { useLogScore } from '@/hooks/useMatches'

export function LogScoreForm({ matchId, onClose }: { matchId: string, onClose: () => void }) {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm()
    const { logScore } = useLogScore()

    const onSubmit = async (data: any) => {
        await logScore.mutateAsync({
            matchId,
            homeScore: Number(data.homeScore),
            awayScore: Number(data.awayScore)
        })
        onClose()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-slate-300 mb-1">Home Score</label>
                <input {...register('homeScore', { required: true })} type="number" className="w-full px-3 py-2 rounded bg-slate-700 text-white" />
            </div>
            <div>
                <label className="block text-slate-300 mb-1">Away Score</label>
               <input {...register('awayScore', { required: true })} type="number" className="w-full px-3 py-2 rounded bg-slate-700 text-white" />
            </div>
            <button type="submit" className="w-full py-2 rounded bg-green-500 text-white font-semibold" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Score'}
            </button>
        </form>
    )
}