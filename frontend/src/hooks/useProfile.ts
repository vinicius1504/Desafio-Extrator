/**
 * Hook para gerenciar perfil do usuário
 */

import { useState } from 'react'
import { authAPI, type User } from '@/lib/api'
import { useAuth } from './useAuth'

interface ChangePasswordData {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export function useProfile() {
  const { user: currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Atualizar informações do perfil
   */
  const updateProfile = async (data: Partial<User>): Promise<User | null> => {
    setLoading(true)
    setError(null)

    try {
      const updatedUser = await authAPI.updateProfile(data)

      // Atualizar localStorage com novos dados
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        localStorage.setItem('user', JSON.stringify({ ...userData, ...updatedUser }))
      }

      return updatedUser
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Erro ao atualizar perfil'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Alterar senha do usuário
   */
  const changePassword = async (data: ChangePasswordData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Validação básica
      if (!data.old_password || !data.new_password || !data.new_password_confirm) {
        throw new Error('Todos os campos são obrigatórios')
      }

      if (data.new_password !== data.new_password_confirm) {
        throw new Error('As senhas não coincidem')
      }

      if (data.new_password.length < 6) {
        throw new Error('A nova senha deve ter no mínimo 6 caracteres')
      }

      if (data.old_password === data.new_password) {
        throw new Error('A nova senha deve ser diferente da senha atual')
      }

      await authAPI.changePassword(data)
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Erro ao alterar senha'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Buscar perfil atualizado do servidor
   */
  const refreshProfile = async (): Promise<User | null> => {
    setLoading(true)
    setError(null)

    try {
      const updatedUser = await authAPI.getProfile()

      // Atualizar localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))

      return updatedUser
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao buscar perfil'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    currentUser,
    loading,
    error,
    updateProfile,
    changePassword,
    refreshProfile,
  }
}
