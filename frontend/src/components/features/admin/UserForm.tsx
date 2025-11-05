/**
 * Formulário para criar/editar usuário (apenas admin)
 */

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useUsers } from '@/hooks'
import type { User } from '@/lib/api'
import { Save, X, Eye, EyeOff } from 'lucide-react'

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onSuccess?: () => void
}

export function UserForm({ isOpen, onClose, user, onSuccess }: UserFormProps) {
  const { loading, error, createUser, updateUser } = useUsers()
  const isEditMode = !!user

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    is_admin: false,
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        password_confirm: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_admin: user.is_admin,
      })
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        is_admin: false,
      })
    }
    setValidationError(null)
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validações
    if (!isEditMode) {
      if (!formData.username || !formData.email || !formData.password) {
        setValidationError('Username, email e senha são obrigatórios')
        return
      }

      if (formData.password !== formData.password_confirm) {
        setValidationError('As senhas não coincidem')
        return
      }

      if (formData.password.length < 6) {
        setValidationError('A senha deve ter no mínimo 6 caracteres')
        return
      }
    } else {
      // Modo edição
      if (!formData.email) {
        setValidationError('Email é obrigatório')
        return
      }

      // Se forneceu senha, validar
      if (formData.password) {
        if (formData.password !== formData.password_confirm) {
          setValidationError('As senhas não coincidem')
          return
        }

        if (formData.password.length < 6) {
          setValidationError('A senha deve ter no mínimo 6 caracteres')
          return
        }
      }
    }

    try {
      if (isEditMode && user) {
        // Atualizar usuário
        const updateData: any = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_admin: formData.is_admin,
        }

        // Só incluir senha se foi fornecida
        if (formData.password) {
          updateData.password = formData.password
        }

        await updateUser(user.id, updateData)
      } else {
        // Criar novo usuário
        await createUser(formData)
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Erro ao salvar usuário:', err)
    }
  }

  const handleClose = () => {
    setValidationError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Editar Usuário' : 'Criar Novo Usuário'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || validationError) && (
          <Alert variant="error">{error || validationError}</Alert>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username *
          </label>
          <Input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="username"
            required
            disabled={isEditMode}
            className={isEditMode ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
          {isEditMode && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Username não pode ser alterado
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Senha {isEditMode ? '(deixe em branco para não alterar)' : '*'}
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••"
              required={!isEditMode}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Mínimo de 6 caracteres
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirmar Senha {isEditMode ? '' : '*'}
          </label>
          <div className="relative">
            <Input
              type={showPasswordConfirm ? 'text' : 'password'}
              value={formData.password_confirm}
              onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              placeholder="••••••"
              required={!isEditMode && !!formData.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {showPasswordConfirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome
            </label>
            <Input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sobrenome
            </label>
            <Input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Sobrenome"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_admin"
            checked={formData.is_admin}
            onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="is_admin"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            É Administrador?
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
