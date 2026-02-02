import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type ViewMode = 'fixtures' | 'standings' | 'stats' | 'bracket' | 'analytics' | 'admin'

interface TournamentFilters {
    status: ('DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED')[]
    format: ('LEAGUE' | 'KNOCKOUT' | 'HYBRID_MULTI_GROUP' | 'HYBRID_SINGLE_LEAGUE')[]
    visibility: ('PUBLIC' | 'PRIVATE' | 'INVITE_ONLY')[]
    search: string
    showMineOnly: boolean
}

interface WizardDraft {
    currentStep: number
    data: Partial<{
        name: string
        description: string
        visibility: string
        format: string
        maxParticipants: number
        pointsForWin: number
        pointsForDraw: number
        legsPerMatch: number
        groupSize: number
        teamsAdvancing: number
        hasThirdPlace: boolean
        inviteEmails: string[]
    }>
}

interface TournamentState {
    activeTournamentId: string | null
    viewMode: ViewMode
    filters: TournamentFilters
    wizardDraft: WizardDraft | null
    isScoreModalOpen: boolean
    selectedMatchId: string | null
    isInviteModalOpen: boolean
    setActiveTournament: (id: string | null) => void
    setViewMode: (mode: ViewMode) => void
    setFilters: (filters: Partial<TournamentFilters>) => void
    resetFilters: () => void
    setWizardDraft: (draft: WizardDraft | null) => void
    updateWizardStep: (step: number) => void
    updateWizardData: (data: Partial<WizardDraft['data']>) => void
    clearWizardDraft: () => void
    openScoreModal: (matchId: string) => void
    closeScoreModal: () => void
    openInviteModal: () => void
    closeInviteModal: () => void
}

const defaultFilters: TournamentFilters = {
    status: [],
    format: [],
    visibility: [],
    search: '',
    showMineOnly: false,
}

export const useTournamentStore = create<TournamentState>()(
    devtools(
        (set, get) => ({
            activeTournamentId: null,
            viewMode: 'fixtures',
            filters: defaultFilters,
            wizardDraft: null,
            isScoreModalOpen: false,
            selectedMatchId: null,
            isInviteModalOpen: false,

            setActiveTournament: (id) => set({ activeTournamentId: id }),
            setViewMode: (mode) => set({ viewMode: mode }),
            setFilters: (filters) => set((state) => ({
                filters: { ...state.filters, ...filters }
            })),
            resetFilters: () => set({ filters: defaultFilters }),
            setWizardDraft: (draft) => {
                set({ wizardDraft: draft })
                if(draft) {
                    localStorage.setItem('tournament-wizard-draft', JSON.stringify(draft))
                } else {
                    localStorage.removeItem('tournament-wizard-draft')
                }
            },
            
            updateWizardStep: (step) => set((state) => ({
                wizardDraft: state.wizardDraft ? { ...state.wizardDraft, currentStep: step } : { currentStep: step, data: {} }
            })),

            updateWizardData: (data) => set((state) => {
                const newDraft = {
                currentStep: state.wizardDraft?.currentStep ?? 0,
                data: { ...state.wizardDraft?.data, ...data }
                }
                localStorage.setItem('tournament-wizard-draft', JSON.stringify(newDraft))
                return { wizardDraft: newDraft }
            }),

            clearWizardDraft: () => {
                localStorage.removeItem('tournament-wizard-draft')
                set({ wizardDraft: null })
            },

            openScoreModal: (matchId) => set({
                isScoreModalOpen: true,
                selectedMatchId: matchId
            }),
            closeScoreModal: () => set({
                isScoreModalOpen: false,
                selectedMatchId: null
            }),

            openInviteModal: () => set({ isInviteModalOpen: true }),
            closeInviteModal: () => set({ isInviteModalOpen: false })
        }),

        { name: 'tournament-store' }
    )
)



export const useActiveTournamentId = () => 
  useTournamentStore((s) => s.activeTournamentId)
export const useViewMode = () => 
  useTournamentStore((s) => s.viewMode)
export const useTournamentFilters = () => 
  useTournamentStore((s) => s.filters)
export const useWizardDraft = () => 
  useTournamentStore((s) => s.wizardDraft)
export const useScoreModal = () => 
  useTournamentStore((s) => ({ 
    isOpen: s.isScoreModalOpen, 
    matchId: s.selectedMatchId,
    open: s.openScoreModal,
    close: s.closeScoreModal,
  }))

export function initializeWizardDraft() {
  const saved = localStorage.getItem('tournament-wizard-draft')
  if (saved) {
    try {
      const draft = JSON.parse(saved)
      useTournamentStore.getState().setWizardDraft(draft)
    } catch {
      localStorage.removeItem('tournament-wizard-draft')
    }
  }
} 