'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { LoadingPage } from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      
      const currentPath = window.location.pathname
      const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`
      router.replace(redirectUrl)
    }
  }, [loading, isAuthenticated, requireAuth, router])

  if (loading) {
    return <LoadingPage message="Verificando autenticación..." />
  }

  if (requireAuth && !isAuthenticated) {
    return <LoadingPage message="Redirigiendo..." />
  }

  return <>{children}</>
}