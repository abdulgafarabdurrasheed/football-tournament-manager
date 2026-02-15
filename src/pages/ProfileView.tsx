import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { 
  User, Mail, Camera, Save, Loader2, 
  Trophy, Calendar, Target, AlertCircle,
  CheckCircle2, ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { useUser, useAuthStore } from '@/stores/authStores'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { AnimatedPage } from '@/components/ui/AnimatedPage'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations'


const profileSchema = z.object({
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(30, 'Display name must be under 30 characters')
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>


interface UserStats {
  tournamentsCreated: number
  tournamentsJoined: number
  matchesPlayed: number
  winRate: number
  memberSince: string
}

export default function ProfileView() {
  const user = useUser()
  const { fetchProfile, profile } = useAuthStore()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [avatarUploading, setAvatarUploading] = useState(false)

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
      if (!user) return
      
      try {

        const { count: tournamentCount } = await supabase
          .from('tournaments')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id)

        const { count: matchCount } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .or(`home_manager_id.eq.${user.id},away_manager_id.eq.${user.id}`)

        const memberSince = new Date(profile?.created_at || Date.now())
          .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

        setStats({
          tournamentsCreated: tournamentCount || 0,
          tournamentsJoined: 0,
          matchesPlayed: matchCount || 0,
          winRate: 0,
          memberSince,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB')
      return
    }

    setAvatarUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setValue('avatarUrl', publicUrl, { shouldDirty: true })
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setSaveStatus('saving')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.displayName || null,
          avatar_url: data.avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      await fetchProfile()
      setSaveStatus('saved')
      
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setSaveStatus('error')
    }
  }

  if (!user) {
    return (
      <AnimatedPage className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-slate-400">Please sign in to view your profile.</p>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage className="max-w-4xl mx-auto px-4 py-8">
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-white">Profile Settings</h2>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-slate-800 overflow-hidden">
                    {currentAvatarUrl ? (
                      <img 
                        src={currentAvatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-12 w-12 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                    {avatarUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={avatarUploading}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-white font-medium">{user.displayName || 'No display name'}</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    {...register('displayName')}
                    placeholder="Enter display name"
                    className={`pl-10 ${errors.displayName ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.displayName && (
                  <p className="text-red-400 text-sm">{errors.displayName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={user.email}
                    disabled
                    className="pl-10 bg-slate-800/50 text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-slate-500 text-xs">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Avatar URL (optional)
                </label>
                <Input
                  {...register('avatarUrl')}
                  placeholder="https://example.com/avatar.jpg"
                  className={errors.avatarUrl ? 'border-red-500' : ''}
                />
                {errors.avatarUrl && (
                  <p className="text-red-400 text-sm">{errors.avatarUrl.message}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={!isDirty || saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                
                {saveStatus === 'saved' && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-green-500 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Saved!
                  </motion.span>
                )}
                
                {saveStatus === 'error' && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-red-500 text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Failed to save
                  </motion.span>
                )}
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Stats</h3>
              
              {statsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-700 rounded w-24 mb-2" />
                      <div className="h-6 bg-slate-700 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : stats ? (
                <motion.div 
                  variants={staggerContainerVariants}
                  initial="initial"
                  animate="animate"
                  className="space-y-4"
                >
                  <motion.div variants={staggerItemVariants} className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Tournaments Created</p>
                      <p className="text-white font-bold">{stats.tournamentsCreated}</p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItemVariants} className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Matches Played</p>
                      <p className="text-white font-bold">{stats.matchesPlayed}</p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItemVariants} className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Member Since</p>
                      <p className="text-white font-bold">{stats.memberSince}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <p className="text-slate-400 text-sm">Failed to load stats</p>
              )}
            </div>
          </Card>

          <Card className="border-red-900/50">
            <div className="p-6">
              <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
              <p className="text-slate-400 text-sm mb-4">
                Permanently delete your account and all associated data.
              </p>
              <Button variant="secondary" className="text-red-400 border-red-500/50 hover:bg-red-500/10">
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  )
}