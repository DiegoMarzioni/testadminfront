import { BaseApiService } from '../base.service'
import { LoginCredentials, LoginResponse, User, API_ENDPOINTS } from '@/types'
import { Logger } from '@/lib/logger'
import { CookieService } from '@/lib/cookies'

export class AuthService extends BaseApiService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.post<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      )
      
      Logger.debug('Backend login response:', response)

      if (response.token && response.user) {
        // Guardar en localStorage Y en cookies
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
          
          // Guardar token en cookie para que el middleware lo pueda leer
          CookieService.set('token', response.token, 7) // 7 días
        }
        
        return {
          success: true,
          token: response.token,
          user: response.user
        }
      } else {
        return {
          success: false,
          error: 'Respuesta inválida del servidor'
        }
      }
    } catch (error: any) {
      Logger.error('Login error:', error)

      if (error.status === 401) {
        return {
          success: false,
          error: 'Credenciales inválidas'
        }
      }
      
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión'
      }
    }
  }

  static async logout(): Promise<void> {
    // Limpiar localStorage Y cookies
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      CookieService.remove('token')
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    return this.getStoredUser()
  }

  static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      Logger.error('Error parsing stored user data:', error)
      return null
    }
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Intentar obtener de localStorage primero, luego de cookies
    const tokenFromStorage = localStorage.getItem('token')
    if (tokenFromStorage) return tokenFromStorage
    
    return CookieService.get('token')
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }
}