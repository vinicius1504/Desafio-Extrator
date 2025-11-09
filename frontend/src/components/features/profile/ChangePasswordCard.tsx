/**
 * Card para alterar senha do usuário - Design Minimalista
 */

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useProfile } from '@/hooks'
import { Lock, Eye, EyeOff } from 'lucide-react'

export function ChangePasswordCard() {
  const { loading, error, changePassword } = useProfile()
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setValidationError(null)

    // Validação no frontend
    if (!formData.old_password || !formData.new_password || !formData.new_password_confirm) {
      setValidationError('Todos os campos são obrigatórios')
      return
    }

    if (formData.new_password !== formData.new_password_confirm) {
      setValidationError('As senhas não coincidem')
      return
    }

    if (formData.new_password.length < 6) {
      setValidationError('A nova senha deve ter no mínimo 6 caracteres')
      return
    }

    if (formData.old_password === formData.new_password) {
      setValidationError('A nova senha deve ser diferente da senha atual')
      return
    }

    try {
      await changePassword(formData)
      setSuccessMessage('Senha alterada com sucesso!')
      setFormData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      })
    } catch (err: any) {
    }
  }

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-light text-gray-900 dark:text-gray-100">
          Alterar Senha
        </h3>
      </div>

      <div className="p-6">
        {successMessage && (
          <div className="mb-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
            <p className="text-sm text-gray-900 dark:text-gray-100 font-light">{successMessage}</p>
          </div>
        )}

        {(error || validationError) && (
          <Alert type="error" className="mb-6">
            {error || validationError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-light text-gray-900 dark:text-gray-100 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-600" />
              </div>
              <Input
                type={showPasswords.old ? 'text' : 'password'}
                value={formData.old_password}
                onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                className="pl-12 pr-12 border-gray-300 dark:border-gray-700 rounded-sm h-12 font-light"
                placeholder="Digite sua senha atual"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPasswords.old ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-light text-gray-900 dark:text-gray-100 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-600" />
              </div>
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="pl-12 pr-12 border-gray-300 dark:border-gray-700 rounded-sm h-12 font-light"
                placeholder="Digite sua nova senha"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-light">
              Mínimo de 6 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-light text-gray-900 dark:text-gray-100 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-600" />
              </div>
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.new_password_confirm}
                onChange={(e) => setFormData({ ...formData, new_password_confirm: e.target.value })}
                className="pl-12 pr-12 border-gray-300 dark:border-gray-700 rounded-sm h-12 font-light"
                placeholder="Confirme sua nova senha"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-12 px-6 rounded-sm"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
