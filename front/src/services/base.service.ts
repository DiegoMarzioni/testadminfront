import { ApiResponse, ApiError, RequestOptions, API_ENDPOINTS } from '@/types'
import { Logger } from '@/lib/logger'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://testadminback.onrender.com/api'

export class BaseApiService {
  private static getAuthHeaders(method: string = 'GET'): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: HeadersInit = {}

    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      headers['Content-Type'] = 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  private static handleAuthError(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  static async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = 10000, ...fetchOptions } = options
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        ...this.getAuthHeaders(fetchOptions.method || 'GET'),
        ...fetchOptions.headers,
      },
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        
        if (response.status === 401 && !endpoint.includes('/auth/')) {
          this.handleAuthError()
          throw new Error('Sesión expirada')
        }

        let errorMessage = `HTTP error! status: ${response.status}`
        let errorData: any = null
        
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } else {
            const textResponse = await response.text()
            errorMessage = textResponse || response.statusText || errorMessage
          }
        } catch (parseError) {
          
          errorMessage = response.statusText || errorMessage
        }

        const apiError: any = new Error(errorMessage)
        apiError.status = response.status
        apiError.response = { data: errorData }
        throw apiError
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return response.text() as unknown as T
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }

      const apiError = error as any
      if (!apiError.status || apiError.status < 400 || apiError.status >= 500) {
        Logger.error(`API request failed for ${endpoint}:`, error)
      }
      
      throw error
    }
  }

  static async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { 
      method: 'GET',
      ...options 
    })
  }

  static async post<T>(
    endpoint: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  static async put<T>(
    endpoint: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  static async patch<T>(
    endpoint: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  static async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { 
      method: 'DELETE',
      ...options 
    })
  }
}