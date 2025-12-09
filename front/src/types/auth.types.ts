export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => void
  checkAuth: () => Promise<void>
}

export interface AuthProviderProps {
  children: React.ReactNode
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}