
export * from './auth.types'
export * from './product.types'
export * from './dashboard.types'
export * from './api.types'
export * from './order.types'

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  pages: number
}

export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterState {
  search?: string
  category?: number
  brand?: number
  status?: string
}

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}