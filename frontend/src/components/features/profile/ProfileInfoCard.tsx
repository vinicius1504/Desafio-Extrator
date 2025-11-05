/**
 * Card com informações do perfil do usuário
 */

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useProfile } from '@/hooks'
import { User, Mail, Edit2, X, Check } from 'lucide-react'

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
      <Card>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">Carregando informações...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Informações Pessoais</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {successMessage && (
          <Alert type="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        {!isEditing ? (
          // Modo visualização
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                <p className="font-medium">{currentUser.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nome</p>
                <p className="font-medium">
                  {currentUser.first_name || currentUser.last_name
                    ? `${currentUser.first_name} ${currentUser.last_name}`.trim()
                    : 'Não informado'}
                </p>
              </div>
            </div>

            {currentUser.is_admin && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  Administrador
                </span>
              </div>
            )}
          </div>
        ) : (
          // Modo edição
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <Input
                type="text"
                value={currentUser.username}
                disabled
                className="bg-gray-100 dark:bg-gray-700"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Username não pode ser alterado
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome
              </label>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Seu nome"
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
                placeholder="Seu sobrenome"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Check className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
