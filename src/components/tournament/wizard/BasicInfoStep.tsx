import { useFormContext } from "react-hook-form";
import { Globe, Lock, Mail } from 'lucide-react';
import type { CreateTournamentFormData } from "@/schemas/tournament.schema";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label"

const VISIBILITY_OPTIONS = [
    { value: 'PUBLIC', label: 'Public', icon: Globe, description: 'Anyone can find and join' },
    { value: 'PRIVATE', label: 'Private', icon: Lock, description: 'Only invited players can join' },
    { value: 'INVITE_ONLY', label: 'Invite Only', icon: Mail, description: 'Players need an invite link' },
]

export function BasicInfoStep() {
    const { register, watch, setValue, formState: { errors } } = useFormContext<CreateTournamentFormData>()
    const visibility = watch('visibility')

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Tournament Name *</Label>
                <Input {...register('name')} id="name" placeholder="Premier League 2026" className={errors.name ? "border-red-500" : ""} />
                {errors.name && (
                    <p className="text-red-400-text-sm">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <textarea
                    {...register('description')}
                    id="description"
                    placeholder="A friendly tournament among friends..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg 
                                text-white placeholder:text-slate-500 focus:outline-none 
                                focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
            {errors.description && (
                <p className="text-red-400 text-sm">
                    {errors.description.message}
                </p>
            )}
            </div>

            <div className="space-y-3">
                <Label>Visibility *</Label>
                <div className="grid gap-3">
                    {VISIBILITY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = visibility === option.value

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setValue('visibility', option.value as any)}
                                className={`
                                flex items-center gap-4 p-4 rounded-lg border-2 text-left
                                transition-colors duration-200
                                ${isSelected 
                                    ? 'border-yellow-500 bg-yellow-500/10' 
                                    : 'border-slate-600 hover:border-slate-500'}
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-yellow-500' : 'text-slate-400'}`} />
                                <div>
                                    <p className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                        {option.label}
                                    </p>
                                    <p className="text-sm text-slate-400">{option.description}</p>
                                    
                                    </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}