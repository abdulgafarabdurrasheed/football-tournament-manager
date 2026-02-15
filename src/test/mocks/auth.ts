interface AppUser {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
}

export const mockUser: AppUser = {
    id: 'test-user-123',
    email: 'test-user@example.com',
    displayName: 'Test User',
    avatarUrl: null,
}

export const mockAuthStore = {
    user: mockUser,
    isLoading: false,
    error: null,
    isAuthenticated: true,
}