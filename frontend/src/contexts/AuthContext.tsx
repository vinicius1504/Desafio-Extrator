/**
 * Context de autenticação
 */

import { createContext, useState, useEffect, ReactNode } from 'react'
import { authAPI, type User, type LoginCredentials } from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar sessão ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token')
        if (!accessToken) {
          setLoading(false)
          return
        }

        // Verificar se sessão ainda é válida
        const { valid, user: userData } = await authAPI.checkSession()

        if (valid) {
          setUser(userData)
        } else {
          // Sessão expirou
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      } catch (error) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Verificar sessão a cada 5 minutos
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      try {
        const { valid } = await authAPI.checkSession()
        if (!valid) {
          // Sessão expirou
          await logout()
        }
      } catch (error) {
        await logout()
      }
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [user])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials)

      // Salvar tokens e usuário
      localStorage.setItem('access_token', response.access)
      localStorage.setItem('refresh_token', response.refresh)
      localStorage.setItem('user', JSON.stringify(response.user))

      setUser(response.user)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao fazer login')
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
    } finally {
      // Limpar tudo
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
