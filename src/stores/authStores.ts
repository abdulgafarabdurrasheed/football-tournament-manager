import { create } from "zustand";
import { persist, devtools } from 'zustand/middleware'

interface User{
    //Todo: replace these with supabase types
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
}

interface Session {
    accessToken: string
    expiresAt: number
}

interface AuthState{
    user: User | null
    session: Session | null
    isLoading: boolean
    error: string | null

    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    reset: () => void
}

const initialState = {
    user: null,
    session: null,
    isLoading: true,
    error: null
}

export const  useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,
                setUser: (user) => set({ user }, false, 'setUser'),
                setSession: (session) => set({ session }, false, 'setSession'),
                setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
                setError: (error) => set({ error }, false, 'setError'),
                reset: () => set(initialState, false, 'reset'),
            }),
            {
                name: "auth-storage",
                partialize: (state) => ({ user: state.user, session: state.session, }),
            }
        ),
        { name: "AuthStore" }
    )
)

export const useUser = () => useAuthStore((s) => s.user)
export const useSession = () => useAuthStore((s) => s.session)
export const useIsAuthenticated = () => useAuthStore((s) => !!s.session)
export const useAuthLoading = () => useAuthStore((s) => s.isLoading)
export const useAuthError = () => useAuthStore((s) => s.error)