import api from './api'
import { User } from '@/types/user'

interface LoginResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  user: User
}

interface RegisterResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  user: User
}

interface RefreshResponse {
  access_token: string
  token_type: string
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  }

  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Even if logout fails on the server, clear local tokens
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  async refresh(): Promise<RefreshResponse> {
    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token')
    return !!token
  }

  getToken(): string | null {
    return localStorage.getItem('access_token')
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem('access_token', accessToken)
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
  }

  clearTokens(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

export const authService = new AuthService()