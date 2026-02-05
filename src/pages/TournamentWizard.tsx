import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2, Component } from 'lucide-react'
import { createTournamentSchema, type CreateTournamentFormData } from "@/schemas/tournament.schema";
import { useCreateTournament } from "@/hooks/useTournament";
import { useTournamentStore, useWizardDraft } from "@/stores/tournamentStore";
import { Button } from "@/components/ui/Button";
import { AnimatedPage } from '@/components/ui/AnimatedPage'
import { BasicInfoStep } from '@/components/tournament/wizard/BasicInfoStep'
import { FormatStep } from '@.components/tournament/wizard/FormatStep'
import { SettingsStep } from "@/components/tournament/wizard/SettingsStep";
import { ReviewStep } from '@/components/tournament/wizard/ReviewStep'

const STEPS = [
    { id: 'basic', title: 'Basic Information', component: BasicInfoStep },
    { id: 'format', title: 'Format', component: FormatStep },
    { id: 'settings', title: 'Settings', component: SettingsStep },
    { id: 'review', title: 'Review', component: ReviewStep }
]

export default function TournamentWizard() {
    const navigate = useNavigate()
    const wizardDraft = useWizardDraft()
    const { updateWizardData, updateWizardStep, clearWizardDraft } = useTournamentStore()
    const createTournament = useCreateTournament()

    const [currentStep, setCurrentStep] = useState(wizardDraft?.currentStep ?? 0)
    const methods = useForm<CreateTournamentFormData>({
        resolver: zodResolver(createTournamentSchema),
        defaultValues: {
            name: '',
            description: '',
            visibility: 'PRIVATE',
            format: 'LEAGUE',
            maxParticipants: 8,
            pointsForWin: 3,
            pointsForDraw: 1,
            legsPerMatch: 2,
            groupSize: 4,
            teamsAdvancing: 2,
            hasThirdPlace: false,
            inviteEmails: [],
            ...wizardDraft?.data,
        },
        mode: 'onChange',
    })

    const { handleSubmit, trigger, getValues, formState: { isSubmitting } } = methods

    useEffect(() => {
        const subscription = methods.watch((data) => {
            updateWizardData(data)
        })
        return () => subscription.unsubscribe()
    }, [methods, updateWizardData])

    useEffect(() => {
        updateWizardStep(currentStep)
    }, [currentStep, updateWizardStep])

    const StepComponent = STEPS[currentStep].component

    const goNext = async () =>  {
        const fieldsToValidate = getStepFields(currentStep)
        const isValid = await trigger(fieldsToValidate)

        if (isValid && currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const goBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const onSubmit = async (data: CreateTournamentFormData) => {
        try {
            const tournament = await createTournament.mutateAsync({
                name: data.name,
                description: data.description,
                format: data.format,
                visibility: data.visibility,
                maxParticipants: data.maxParticipants,
                settings: {
                pointsForWin: data.pointsForWin,
                pointsForDraw: data.pointsForDraw,
                pointsForLoss: 0,
                legsPerMatch: data.legsPerMatch,
                groupSize: data.groupSize,
                teamsAdvancing: data.teamsAdvancing,
                hasThirdPlace: data.hasThirdPlace,
                tiebreakers: ['goalDifference', 'goalsScored', 'headToHead'],
                },
            })

            clearWizardDraft()
            navigate(`/tournaments/${tournament.id}`)
        } catch (error) {
            console.error('Failed to create tournament:', error)
        }
    }

    return (
        <AnimatedPage className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create Tournament</h1>
                <p className="text-slate-400">Set up your tournament in a few easy steps.</p>
            </div>

            <div className="flex items-center justify-between mb-8">
                {STEPS.map((step, index) => (
                    <div className="flex items-center" key={step.id}>
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-semibold
                            transition-colors duration-200
                            ${index < currentStep 
                                ? 'bg-green-500 text-white' 
                                : index === currentStep 
                                ? 'bg-yellow-500 text-slate-900' 
                                : 'bg-slate-700 text-slate-400'}
                            `}>{index < currentStep ? (
                                <Check className="w-5 h-5" />
                            ) : (index + 1)}</div>

                            {index < STEPS.length - 1 && (
                                <div></div>
                            )}
                    </div>
                ))}
            </div>
        </AnimatedPage>
    )
}