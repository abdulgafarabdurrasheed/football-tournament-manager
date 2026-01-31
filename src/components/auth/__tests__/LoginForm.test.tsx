import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

const mockSignIn = vi.fn()
const mockSetError = vi.fn()

vi.mock('@/stores/authStores', () => ({
    useAuthStore: () => ({
        signIn: mockSignIn,
        error: null,
        setError: mockSetError,
    }),
}))

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders email and password fields', () => {
        render(<LoginForm />)

expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows validation errors for empty fields', async () => {
        const user = userEvent.setup()
        render(<LoginForm />)
        await user.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        })
    })

    it('shows validation errors for invalid email', async () => {
        const user = userEvent.setup()
        render(<LoginForm />)

        await user.type(screen.getByPlaceholderText(/email/i), 'invalid-email')
        await user.type(screen.getByPlaceholderText(/password/i), 'password123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
        })
    })

    it('calls signIn with correct data on valid submit', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue(undefined)
    
    render(<LoginForm />)
    
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(() => {}))
    
    render(<LoginForm />)
    
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
  })
})