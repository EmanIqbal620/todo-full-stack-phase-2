'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types/user'
import { authService } from '@/services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in on component mount
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // We don't have an endpoint to get current user from token,
          // so we just set the user as authenticated without user details
          // In a real app, you'd call an endpoint like /api/auth/me
          setUser({ id: 'temp', email: 'temp@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }) // Placeholder - would be replaced with actual user data
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          authService.clearTokens()
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password)
    authService.setTokens(response.access_token, response.refresh_token)

    // In a real app, you'd set the actual user data from the response
    setUser(response.user || { id: 'temp', email, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register(name, email, password)
    authService.setTokens(response.access_token, response.refresh_token)

    // In a real app, you'd set the actual user data from the response
    setUser(response.user || { id: 'temp', email, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const isAuthenticated = () => {
    return !!user
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}