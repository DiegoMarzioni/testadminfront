'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, AuthContextType, AuthProviderProps } from '@/types'
import { AuthService } from '@/services/api'
import { Logger } from '@/lib/logger'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      setIsLoading(true)

      const storedUser = AuthService.getStoredUser()
      const token = AuthService.getToken()
      
      if (token && storedUser) {
        setUser(storedUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      Logger.error('Error checking auth:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const result = await AuthService.login({ email, password })
      
      if (result.success && result.user) {
        setUser(result.user)
        return { success: true, user: result.user }
      } else {
        return { success: false, error: result.error || 'Error al iniciar sesión' }
      }
    } catch (error) {
      Logger.error('Login error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al iniciar sesión'
      }
    }
  }
  const logout = async () => {
    try {
      
      await AuthService.logout()

      setUser(null)

      window.location.href = '/login'
    } catch (error) {
      Logger.error('Error during logout:', error)
      
      setUser(null)
      window.location.href = '/login'
    }
  }

  const value = {
    user,
    isAuthenticated: !!user && AuthService.isAuthenticated(),
    loading: isLoading,
    login,
    logout,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}