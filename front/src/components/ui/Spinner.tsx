'use client'

import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'secondary' | 'white'
}

export default function Spinner({ 
  size = 'md', 
  className = '', 
  color = 'primary' 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  }

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  )
}

interface LoadingOverlayProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingOverlay({ 
  message = 'Cargando...', 
  fullScreen = false 
}: LoadingOverlayProps) {
  return (
    <div className={`
      ${fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10'} 
      bg-white/80/80 backdrop-blur-sm 
      flex flex-col items-center justify-center
    `}>
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-4 text-lg font-medium text-slate-600">
          {message}
        </p>
      </div>
    </div>
  )
}

interface DashboardLoadingProps {
  title?: string
  subtitle?: string
}

export function DashboardLoading({ 
  title = 'Cargando Dashboard',
  subtitle = 'Obteniendo las últimas estadísticas...'
}: DashboardLoadingProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {}
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
      </div>
      
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 animate-pulse mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="h-6 bg-slate-200 rounded w-32 animate-pulse mb-6"></div>
        <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="h-6 bg-slate-200 rounded w-32 animate-pulse mb-4"></div>
          <div className="h-10 bg-slate-200 rounded w-40 animate-pulse mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-36 animate-pulse"></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="h-6 bg-slate-200 rounded w-32 animate-pulse mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3">
          <Spinner size="lg" />
          <div>
            <p className="text-lg font-medium text-slate-900">{title}</p>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}