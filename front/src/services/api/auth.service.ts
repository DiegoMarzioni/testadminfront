import { BaseApiService } from '../base.service'
import { LoginCredentials, LoginResponse, User, API_ENDPOINTS } from '@/types'
import { Logger } from '@/lib/logger'

export class AuthService extends BaseApiService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.post<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      )
      
      Logger.debug('Backend login response:', response)

      if (response.token && response.user) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
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
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  static async getCurrentUser(): Promise<User | null> {
    
    return this.getStoredUser()
  }

  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      Logger.error('Error parsing stored user data:', error)
      return null
    }
  }

  static getToken(): string | null {
    return localStorage.getItem('token')
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }
}