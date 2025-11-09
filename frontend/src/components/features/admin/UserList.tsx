/**
 * Lista de usuários com ações (apenas admin) - Design Minimalista
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Table, type TableColumn } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { useUsers } from '@/hooks'
import type { User } from '@/lib/api'
import { UserPlus, Edit2, Trash2, CheckCircle, XCircle, Shield, Clock, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface UserListProps {
  onCreateUser: () => void
  onEditUser: (user: User) => void
  onDeleteUser: (user: User) => void
  refreshTrigger?: number
}

export function UserList({ onCreateUser, onEditUser, onDeleteUser, refreshTrigger }: UserListProps) {
  const { users, loading, error, toggleUserActive, getUsers, isAdmin } = useUsers()
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Carregar usuários APENAS UMA VEZ ao montar o componente
  useEffect(() => {
    if (isAdmin && !hasLoaded) {
      getUsers()
        .then(() => {
          setHasLoaded(true)
        })
        .catch((err) => {
        })
    }
  }, [isAdmin])

  // Atualizar quando refreshTrigger mudar (após criar/editar/deletar)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0 && isAdmin && hasLoaded) {
      getUsers()
    }
  }, [refreshTrigger, isAdmin, hasLoaded])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await getUsers()
    } catch (err) {
    } finally {
      setRefreshing(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    setActionLoading(user.id)
    try {
      await toggleUserActive(user.id)
      // NÃO atualizar automaticamente - deixar o estado interno do hook atualizar
    } catch (err) {
    } finally {
      setActionLoading(null)
    }
  }

  const columns: TableColumn<User>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (value, user) => (
        <div className="flex items-center gap-2">
          <span className="font-light text-gray-900 dark:text-gray-100">{value}</span>
          {user.is_admin && (
            <span title="Administrador">
              <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'first_name',
      header: 'Nome',
      render: (_, user) => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
        return fullName || <span className="text-gray-400 dark:text-gray-600 italic font-light">Não informado</span>
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      align: 'center',
      render: (value) =>
        value ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-sm text-xs font-light text-gray-900 dark:text-gray-100">
            <CheckCircle className="h-3 w-3" />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-sm text-xs font-light text-gray-600 dark:text-gray-400">
            <XCircle className="h-3 w-3" />
            Inativo
          </span>
        ),
    },
    {
      key: 'created_at',
      header: 'Criado em',
      render: (value) => (
        <div className="flex items-center gap-2 text-sm font-light text-gray-600 dark:text-gray-400">
          <Clock className="h-3 w-3" />
          <span>{format(new Date(value), 'dd/MM/yyyy HH:mm')}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'center',
      render: (_, user) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditUser(user)}
            disabled={actionLoading === user.id}
            title="Editar usuário"
            className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleActive(user)}
            disabled={actionLoading === user.id}
            title={user.is_active ? 'Desativar usuário' : 'Ativar usuário'}
            className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm h-8 w-8 p-0"
          >
            {user.is_active ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteUser(user)}
            disabled={actionLoading === user.id}
            title="Deletar usuário"
            className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-light text-gray-900 dark:text-gray-100">
            Gerenciar Usuários
          </h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              disabled={refreshing || loading}
              title="Atualizar lista de usuários"
              className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm h-10 px-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              onClick={onCreateUser}
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-10 px-4 rounded-sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Usuário
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        {loading && !hasLoaded ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400 font-light">
            Carregando usuários...
          </div>
        ) : (
          <Table
            columns={columns}
            data={Array.isArray(users) ? users : []}
            keyExtractor={(user) => String(user.id)}
            emptyMessage="Nenhum usuário encontrado"
          />
        )}
      </div>
    </div>
  )
}
