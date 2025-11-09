/**
 * Card com informações do perfil do usuário - Design Minimalista
 */

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useProfile } from '@/hooks'
import { User, Mail, Edit2, X, Check, Shield } from 'lucide-react'

export function ProfileInfoCard() {
  const { currentUser, loading, error, updateProfile, refreshProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    email: currentUser?.email || '',
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleEdit = () => {
    setIsEditing(true)
    setSuccessMessage(null)
    setFormData({
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || '',
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSuccessMessage(null)
    setFormData({
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)

    try {
      await updateProfile(formData)
      await refreshProfile()
      setSuccessMessage('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (err: any) {
    }
  }

  if (!currentUser) {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Carregando informações...</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-light text-gray-900 dark:text-gray-100">
            Informações Pessoais
          </h3>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm h-10 px-4"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {successMessage && (
          <div className="mb-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
            <p className="text-sm text-gray-900 dark:text-gray-100 font-light">{successMessage}</p>
          </div>
        )}

        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        {!isEditing ? (
          // Modo visualização - Minimalista
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-sm">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-sm">
                <User className="h-5 w-5 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Username
                </p>
                <p className="font-light text-gray-900 dark:text-gray-100 text-base truncate">
                  {currentUser.username}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-sm">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-sm">
                <Mail className="h-5 w-5 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Email
                </p>
                <p className="font-light text-gray-900 dark:text-gray-100 text-base break-all">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-sm">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-sm">
                <User className="h-5 w-5 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Nome Completo
                </p>
                <p className="font-light text-gray-900 dark:text-gray-100 text-base">
                  {currentUser.first_name || currentUser.last_name
                    ? `${currentUser.first_name} ${currentUser.last_name}`.trim()
                    : 'Não informado'}
                </p>
              </div>
            </div>

            {currentUser.is_admin && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <span className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-sm text-sm font-light text-gray-900 dark:text-gray-100">
                  <Shield className="h-4 w-4" />
                  Administrador
                </span>
              </div>
            )}
          </div>
        ) : (
          // Modo edição - Minimalista
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-light text-gray-900 dark:text-gray-100 mb-2">
                Username
              </label>
              <Input
                type="text"
                value={currentUser.username}
                disabled
                className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-sm h-12 font-light"
              />
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-light">
                Username não pode ser alterado
              </p>
            </div>

            <div>
              <label className="block text-sm font-light text-gray-900 dark:text-gray-100 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="border-gray-300 dark:border-gray-700 rounded-sm h-12 font-light"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-gray-900 dark:text-gray-100 mb-2">
                Nome
              </label>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Seu nome"
                className="border-gray-300 dark:border-gray-700 rounded-sm h-12 font-light"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-gray-900 dark:text-gray-100 mb-2">
                Sobrenome
              </label>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Seu sobrenome"
                className="border-gray-300 dark:border-gray-700 rounded-sm h-12 font-light"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-12 px-6 rounded-sm"
              >
                <Check className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 h-12 px-6 rounded-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
