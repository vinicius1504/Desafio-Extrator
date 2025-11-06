/**
 * Card com informações do perfil do usuário
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
      console.error('Erro ao atualizar perfil:', err)
    }
  }

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Carregando informações...</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Seus Dados
          </h3>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit} className="h-8 text-xs">
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {successMessage && (
          <Alert type="success" className="mb-3 text-xs">
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert type="error" className="mb-3 text-xs">
            {error}
          </Alert>
        )}

        {!isEditing ? (
          // Modo visualização - Compacto
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
              <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">Username</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{currentUser.username}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
              <div className="p-2 bg-green-600 dark:bg-green-500 rounded-lg">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-0.5">Email</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-all">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
              <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-0.5">Nome Completo</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {currentUser.first_name || currentUser.last_name
                    ? `${currentUser.first_name} ${currentUser.last_name}`.trim()
                    : 'Não informado'}
                </p>
              </div>
            </div>

            {currentUser.is_admin && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
                  <Shield className="h-3.5 w-3.5" />
                  Administrador
                </span>
              </div>
            )}
          </div>
        ) : (
          // Modo edição
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <Input
                type="text"
                value={currentUser.username}
                disabled
                className="bg-gray-100 dark:bg-gray-700 h-9 text-sm"
              />
              <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                Username não pode ser alterado
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nome
              </label>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Seu nome"
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Sobrenome
              </label>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Seu sobrenome"
                className="h-9 text-sm"
              />
            </div>

            <div className="flex space-x-2 pt-3">
              <Button type="submit" disabled={loading} className="h-9 text-xs">
                <Check className="h-3.5 w-3.5 mr-1.5" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="h-9 text-xs">
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
