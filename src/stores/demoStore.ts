import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export interface TourStep {
  id: string
  title: string
  content: string
  target?: string
  route?: string
  tab?: 'fixtures' | 'standings' | 'stats' | 'admin'
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

interface DemoState {
  isDemoMode: boolean
  isTourActive: boolean
  tourStep: number
  hasSeenTour: boolean

  startDemo: () => void
  stopDemo: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  goToStep: (step: number) => void
  resetTour: () => void
}

export const useDemoStore = create<DemoState>()(
  devtools(
    persist(
      (set) => ({
        isDemoMode: false,
        isTourActive: false,
        tourStep: 0,
        hasSeenTour: false,

        startDemo: () =>
          set({
            isDemoMode: true,
            isTourActive: true,
            tourStep: 0,
          }),

        stopDemo: () =>
          set({
            isDemoMode: false,
            isTourActive: false,
            tourStep: 0,
            hasSeenTour: true,
          }),

        nextStep: () =>
          set((s) => ({ tourStep: s.tourStep + 1 })),

        prevStep: () =>
          set((s) => ({ tourStep: Math.max(0, s.tourStep - 1) })),

        skipTour: () =>
          set({
            isTourActive: false,
            isDemoMode: false,
            tourStep: 0,
            hasSeenTour: true,
          }),

        goToStep: (step: number) =>
          set({ tourStep: step }),

        resetTour: () =>
          set({
            hasSeenTour: false,
            isDemoMode: false,
            isTourActive: false,
            tourStep: 0,
          }),
      }),
      {
        name: 'demo-tour-storage',
        partialize: (state) => ({ hasSeenTour: state.hasSeenTour }),
      }
    ),
    { name: 'demo-store' }
  )
)

export const useIsDemoMode = () => useDemoStore((s) => s.isDemoMode)
export const useIsTourActive = () => useDemoStore((s) => s.isTourActive)
export const useTourStep = () => useDemoStore((s) => s.tourStep)
export const useHasSeenTour = () => useDemoStore((s) => s.hasSeenTour)
