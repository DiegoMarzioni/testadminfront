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
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  },
  PRODUCTS: {
    BASE: '/api/products',
    BY_ID: (id: string) => `/api/products/${id}`,
    SEARCH: '/api/products/search'
  },
  CATEGORIES: {
    BASE: '/api/categories',
    BY_ID: (id: string) => `/api/categories/${id}`,
    TREE: '/api/categories/tree'
  },
  BRANDS: {
    BASE: '/api/brands',
    BY_ID: (id: string) => `/api/brands/${id}`
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    INVENTORY: '/api/dashboard/inventory-summary',
    SALES: '/api/dashboard/sales',
    TOP_PRODUCTS: '/api/dashboard/top-products'
  },
  ORDERS: {
    BASE: '/api/orders',
    CUSTOMERS: '/api/orders/customers/all'
  }
} as const