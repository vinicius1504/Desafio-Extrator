/**
 * Hook para gerenciar usuários (apenas admin)
 */

import { useState } from 'react'
import { adminAPI, type User, type RegisterData } from '@/lib/api'
import { useAuth } from './useAuth'

interface CreateUserData extends RegisterData {
  is_admin?: boolean
}

export function useUsers() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Verificar se usuário é admin antes de qualquer operação
   */
  const checkAdminPermission = () => {
    if (!isAdmin) {
      throw new Error('Acesso negado. Apenas administradores podem gerenciar usuários.')
    }
  }

  /**
   * Buscar todos os usuários
   */
  const getUsers = async (): Promise<User[]> => {
    setLoading(true)
    setError(null)

    try {
      checkAdminPermission()
      const fetchedUsers = await adminAPI.getUsers()
      const usersArray = Array.isArray(fetchedUsers) ? fetchedUsers : []
      setUsers(usersArray)
      return fetchedUsers
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Erro ao buscar usuários'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Buscar um usuário específico
   */
  const getUser = async (userId: number): Promise<User> => {
    setLoading(true)
    setError(null)

    try {
      checkAdminPermission()
      const user = await adminAPI.getUser(userId)
      return user
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao buscar usuário'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Criar novo usuário
   */
  const createUser = async (data: CreateUserData): Promise<User> => {
    setLoading(true)
    setError(null)

    try {
      checkAdminPermission()

      // Validação básica
      if (!data.username || !data.email || !data.password) {
        throw new Error('Campos obrigatórios: username, email e password')
      }

      if (data.password !== data.password_confirm) {
        throw new Error('As senhas não coincidem')
      }

      if (data.password.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres')
      }

      const response = await adminAPI.createUser(data)

      // Atualizar lista local
      setUsers((prevUsers) => [...prevUsers, response.user])

      return response.user
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Erro ao criar usuário'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Atualizar usuário existente
   */
  const updateUser = async (userId: number, data: Partial<User>): Promise<User> => {
    setLoading(true)
    setError(null)

    try {
      checkAdminPermission()
      const updatedUser = await adminAPI.updateUser(userId, data)

      // Atualizar lista local
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? updatedUser : user))
      )

      return updatedUser
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao atualizar usuário'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Deletar usuário
   */
  const deleteUser = async (userId: number): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      checkAdminPermission()
      await adminAPI.deleteUser(userId)

      // Remover da lista local
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao deletar usuário'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Ativar/Desativar usuário
   */
  const toggleUserActive = async (userId: number): Promise<User> => {
    setLoading(true)
    setError(null)

    try {
      checkAdminPermission()
      const response = await adminAPI.toggleUserActive(userId)

      // Atualizar lista local
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? response.user : user))
      )

      return response.user
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao alterar status do usuário'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    users,
    loading,
    error,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    isAdmin,
  }
}
