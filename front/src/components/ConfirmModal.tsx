'use client'

import { ReactNode } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: '🗑️',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: '⚠️',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: 'ℹ️',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  }

  const style = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {}
      <div 
        className="absolute inset-0 bg-black/20/40 backdrop-blur-sm transition-all duration-200"
        onClick={onClose}
      />
      
      {}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-200 scale-100 animate-in fade-in zoom-in-95">
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center`}>
              <span className="text-xl">{style.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
          
          <div className="flex space-x-3 justify-end pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${style.confirmBg}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}