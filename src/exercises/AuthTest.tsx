import { useEffect, useState } from 'react'
import { useAuthStore, useUser, useIsAuthenticated, useAuthLoading } from '@/stores/authStores'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export function AuthTest() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { initialize, signIn, signUp, signInWithGoogle, signOut, error } = useAuthStore()
  const user = useUser()
  const isAuth = useIsAuthenticated()
  const isLoading = useAuthLoading()

  useEffect(() => {
    initialize()
  }, [])

  if (isLoading) {
    return <div className="p-4 text-white">Loading...</div>
  }

  if (isAuth && user) {
    return (
      <div className="p-4 space-y-4 text-white">
        <h2 className="text-xl font-bold">✅ Logged in as {user.email}</h2>
        <p>Display Name: {user.displayName || 'Not set'}</p>
        <Button onClick={signOut} variant="danger">Sign Out</Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 max-w-md">
      <h2 className="text-xl font-bold text-white">Auth Test</h2>
      
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}
      
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <div className="flex gap-2">
        <Button onClick={() => signIn(email, password)}>Sign In</Button>
        <Button onClick={() => signUp(email, password)} variant="secondary">Sign Up</Button>
      </div>
      
      <div className="border-t border-slate-700 pt-4">
        <Button onClick={signInWithGoogle} className="w-full">
          Sign in with Google
        </Button>
      </div>
    </div>
  )
}