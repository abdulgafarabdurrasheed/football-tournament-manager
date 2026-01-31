import type { User } from '../../src/types/database.types'

export const mockUser: User = {
    id: 'test-user-123',
    email: 'test-user@example.com',
    displayName: 'Test User',
    avatarUrl: null,
    createdAt: new Date().toISOString,
}

export const mockAuthStore = {
    user: mockUser,
    isLoading: false,
    error: null,
    isAuthenticated: true,
}