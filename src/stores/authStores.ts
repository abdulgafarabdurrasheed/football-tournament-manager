import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { supabase, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut as supabaseSignOut } from '@/lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { Tables } from '@/types/database.types'

type Profile = Tables<'profiles'>

interface AppUser {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
}

interface AuthState {
  user: AppUser | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  error: string | null
  
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  error: null,
}

function mapUser(supabaseUser: SupabaseUser | null): AppUser | null {
  if (!supabaseUser) return null
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    displayName: supabaseUser.user_metadata?.full_name || null,
    avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
  }
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        initialize: async () => {
          try {
            set({ isLoading: true, error: null })
            
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session) {
              set({ 
                session, 
                user: mapUser(session.user),
              })
              get().fetchProfile()
            }
            
            supabase.auth.onAuthStateChange(async (event, session) => {
              console.log('Auth event:', event)
              
              if (event === 'SIGNED_IN' && session) {
                set({ 
                  session, 
                  user: mapUser(session.user),
                })
                get().fetchProfile()
              } else if (event === 'SIGNED_OUT') {
                set(initialState)
                set({ isLoading: false })
              } else if (event === 'TOKEN_REFRESHED' && session) {
                set({ session })
              }
            })
          } catch (error) {
            console.error('Auth init error:', error)
            set({ error: (error as Error).message })
          } finally {
            set({ isLoading: false })
          }
        },

        signIn: async (email, password) => {
          try {
            set({ isLoading: true, error: null })
            const { session, user } = await signInWithEmail(email, password)
            set({ 
              session, 
              user: mapUser(user),
            })
            get().fetchProfile()
          } catch (error) {
            set({ error: (error as Error).message })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        signUp: async (email, password, displayName) => {
          try {
            set({ isLoading: true, error: null })
            const { session, user } = await signUpWithEmail(email, password, displayName)
            
            if (user && !session) {
              set({ error: 'Check your email to confirm your account' })
            } else if (session && user) {
              set({ 
                session, 
                user: mapUser(user),
              })
              get().fetchProfile()
            }
          } catch (error) {
            set({ error: (error as Error).message })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        signInWithGoogle: async () => {
          try {
            set({ isLoading: true, error: null })
            await signInWithGoogle()
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
          }
        },

        signOut: async () => {
          try {
            set({ isLoading: true, error: null })
            await supabaseSignOut()
            set(initialState)
            set({ isLoading: false })
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
          }
        },

        fetchProfile: async () => {
          const user = get().user
          if (!user) return
          
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (error) throw error
            set({ profile: data })
          } catch (error) {
            console.error('Profile fetch error:', error)
          }
        },

        setError: (error) => set({ error }),
        reset: () => set({ ...initialState, isLoading: false }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
)
export const useUser = () => useAuthStore((s) => s.user)
export const useProfile = () => useAuthStore((s) => s.profile)
export const useSession = () => useAuthStore((s) => s.session)
export const useIsAuthenticated = () => useAuthStore((s) => !!s.session)
export const useAuthLoading = () => useAuthStore((s) => s.isLoading)
export const useAuthError = () => useAuthStore((s) => s.error)