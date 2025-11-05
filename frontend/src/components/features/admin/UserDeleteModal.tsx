/**
 * Modal de confirmação para deletar usuário
 */

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useUsers } from '@/hooks'
import type { User } from '@/lib/api'
import { Trash2, X, AlertTriangle } from 'lucide-react'

interface UserDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess?: () => void
}

export function UserDeleteModal({ isOpen, onClose, user, onSuccess }: UserDeleteModalProps) {
  const { loading, error, deleteUser } = useUsers()
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (!user) return

    try {
      await deleteUser(user.id)
      onSuccess?.()
      onClose()
      setConfirmText('')
    } catch (err) {
      console.error('Erro ao deletar usuário:', err)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  const canDelete = confirmText === user?.username

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Deletar Usuário">
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Atenção!</h4>
            <p className="text-sm text-red-700 dark:text-red-400">
              Esta ação não pode ser desfeita. Todos os dados do usuário serão permanentemente
              deletados.
            </p>
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {user && (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Você está deletando:</p>
              <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  <span className="text-gray-500 dark:text-gray-400">Username:</span> {user.username}
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  <span className="text-gray-500 dark:text-gray-400">Email:</span> {user.email}
                </p>
                {(user.first_name || user.last_name) && (
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    <span className="text-gray-500 dark:text-gray-400">Nome:</span>{' '}
                    {`${user.first_name} ${user.last_name}`.trim()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Para confirmar, digite o username:{' '}
                <span className="font-bold text-red-600 dark:text-red-400">{user.username}</span>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Digite o username aqui"
                autoComplete="off"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleDelete}
            disabled={loading || !canDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300 dark:disabled:bg-red-800"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {loading ? 'Deletando...' : 'Deletar Usuário'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
