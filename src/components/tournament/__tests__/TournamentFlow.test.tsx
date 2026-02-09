import { render, screen, fireEvent } from '@testing-library/react'
import TournamentWizard from '@/pages/TournamentWizard'
import TournamentList from '@/pages/TournamentList'
import TournamentView from '@/pages/TournamentView'

test('user can create, view, and delete a tournament', async () => {
  render(<TournamentWizard />)
  // Fill out form steps...
  // Submit and check redirect to TournamentView
  // Delete tournament from AdminTab
  // Check tournament is removed from list
})