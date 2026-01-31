import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema'
import { useAuthStore } from '@/stores/authStores'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'sonner'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { signUp, error: authError, setError } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      displayName: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')
  const passwordStrength = getPasswordStrength(password)

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      await signUp(data.email, data.password, data.displayName || undefined)
      
      toast.success('Check your email!', {
        description: 'We\'ve sent a confirmation link to verify your account.',
        duration: 5000,
      })
      
      onSuccess?.()
      onSwitchToLogin?.()
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {authError && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <div className="space-y-1">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            {...register('displayName')}
            type="text"
            placeholder="Display name (optional)"
            className={`pl-10 ${errors.displayName ? 'border-red-500' : ''}`}
            autoComplete="name"
          />
        </div>
        {errors.displayName && (
          <p className="text-red-400 text-sm">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            {...register('email')}
            type="email"
            placeholder="Email address"
            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            {...register('password')}
            type="password"
            placeholder="Password"
            className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
            autoComplete="new-password"
          />
        </div>
        <div className="flex gap-1 h-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`flex-1 rounded-full transition-colors ${
                passwordStrength >= level
                  ? level <= 1 ? 'bg-red-500'
                  : level <= 2 ? 'bg-yellow-500'
                  : level <= 3 ? 'bg-blue-500'
                  : 'bg-green-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        {errors.password && (
          <p className="text-red-400 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm password"
            className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            autoComplete="new-password"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <p className="text-center text-slate-400 text-sm">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-yellow-500 hover:text-yellow-400 font-medium"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}

function getPasswordStrength(password: string): number {
  if (!password) return 0
  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  return Math.min(strength, 4)
}

export default RegisterForm