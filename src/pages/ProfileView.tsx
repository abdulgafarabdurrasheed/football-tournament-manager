import React, { useEffect, useState } from "react";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { User, Mail, Camera, Save, Loader2, Trophy, Calendar, Target, AlertCircle, CheckCircle2, ArrowLeft, StickyNote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { useUser, useAuthStore } from '@/stores/authStores'
import { supabase } from "@/lib/supabase";
import { Button } from  '@/components/ui/Button'
import Input from "@/components/ui/Input"
import Card from "@/components/ui/Card"
import { AnimatedPage } from "@/components/ui/AnimatedPage"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animations";

const profileSchema = z.object({
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(30, 'Display name must be under 30 characters')
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserStats{
    tournamentsCreated: number
    tournamentsJoined: number
    matchesPlayed: number
    winRate: number
    memberSince: string
}

export default function ProfileView(){
    const user = useUser()
    const { refreshUser } = useAuthStore()
    const [stats, setStats] = useState<UserStats | null>(null)
    const [statsLoading, setStatsLoading] = useState<boolean>(true)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [avatarUploading, setAvatarUploading] = useState<boolean>(false)
    
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: user?.displayName || '',
            avatarUrl: user?.avatarUrl || '',
        },
    })

    const currentAvatarUrl = watch('avatarUrl')

    useEffect(() => {
        async function fetchStats() {
            if(!user) return

            try {
                const { count: tournamentCount } = await supabase
                    .from('tournaments')
                    .select('*', { count: 'exact', head: true })
                    .eq('created_by', user.id)

                const { count: matchCount } = await supabase
                    .from('matches')
                    .select('*', { count: 'exact', head: true })
                    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
                
                const memberSince = new Date(user.created_at || Date.now())
                    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

                setStats({
                    tournamentsCreated: tournamentCount || 0,
                    tournamentsJoined: 0,
                    matchesPlayed: matchCount || 0,
                    winRate: 0,
                    memberSince,
                })
            } catch (error) {
                console.error('Failed to fetch user stats', error)
            } finally {
                setStatsLoading(false)
            }
        }

        fetchStats()
    }, [user])

    const handleAvatarUpload = async (e:
        React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file || !user) return

            if (!file.type.startsWith('image/')) {
                alert('Please select an image file')
                return
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('File size must be less than 2MB')
                return
            }

            setAvatarUploading(true)
            try{
                const fileExt = file.name.split('.').pop()
                const fileName = `${user.id}-${Date.now()}.${fileExt}`
                const filePath = `avatars/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file, { upsert: true })
                
                if (uploadError) throw uploadError
            }
        }

}