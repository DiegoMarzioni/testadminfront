export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

export interface RequestOptions extends RequestInit {
  timeout?: number
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me'
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    SEARCH: '/products/search'
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
    TREE: '/categories/tree'
  },
  BRANDS: {
    BASE: '/brands',
    BY_ID: (id: string) => `/brands/${id}`
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    INVENTORY: '/dashboard/inventory-summary',
    SALES: '/dashboard/sales',
    TOP_PRODUCTS: '/dashboard/top-products'
  },
  ORDERS: {
    BASE: '/orders',
    CUSTOMERS: '/orders/customers/all'
  }
} as const