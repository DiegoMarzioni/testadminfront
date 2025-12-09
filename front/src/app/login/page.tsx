'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { LoadingPage } from '@/components/ui/LoadingSpinner'
import { Logger } from '@/lib/logger'

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isAuthenticated) {
      
      const redirectUrl = searchParams.get('redirect') || '/dashboard'
      router.replace(redirectUrl)
    }
  }, [isAuthenticated, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        const redirectUrl = searchParams.get('redirect') || '/dashboard'
        router.replace(redirectUrl)
      } else {
        setError(result.error || 'Credenciales inválidas')
      }
    } catch (error) {
      Logger.error('Login error:', error)
      setError('Error al iniciar sesión')
    }
    
    setLoading(false)
  }

  if (authLoading) {
    return <LoadingPage message="Verificando sesión..." />
  }

  if (isAuthenticated) {
    return <LoadingPage message="Redirigiendo..." />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-200">
        {}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-4 shadow-lg border border-slate-200">
                <Image
                  src="/assets/logotipo.png"
                  alt="Tennis Star Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-xl font-semibold">Iniciar Sesión</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {typeof error === 'string' ? error : 'Error en el login'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ingresa tu email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Mantener sesión iniciada
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-500 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>

          {}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                o
              </span>
            </div>
          </div>

          {}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              ¿No tienes una cuenta?{' '}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors underline"
              >
                Crear cuenta de Superadmin
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <LoginForm />
    </Suspense>
  )
}