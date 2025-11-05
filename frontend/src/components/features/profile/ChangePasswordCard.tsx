/**
 * Card para alterar senha do usuário
 */

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
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
      console.error('Erro ao alterar senha:', err)
    }
  }

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
      </CardHeader>

      <CardContent>
        {successMessage && (
          <Alert type="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {(error || validationError) && (
          <Alert type="error" className="mb-4">
            {error || validationError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPasswords.old ? 'text' : 'password'}
                value={formData.old_password}
                onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                className="pl-10 pr-10"
                placeholder="Digite sua senha atual"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.old ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="pl-10 pr-10"
                placeholder="Digite sua nova senha"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Mínimo de 6 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.new_password_confirm}
                onChange={(e) => setFormData({ ...formData, new_password_confirm: e.target.value })}
                className="pl-10 pr-10"
                placeholder="Confirme sua nova senha"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
