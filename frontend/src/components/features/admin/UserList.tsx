/**
 * Lista de usuários com ações (apenas admin)
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
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
          console.error('Erro ao carregar usuários:', err)
        })
    }
  }, [isAdmin])

  // Atualizar quando refreshTrigger mudar (após criar/editar/deletar)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0 && isAdmin && hasLoaded) {
      getUsers().catch(console.error)
    }
  }, [refreshTrigger])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await getUsers()
    } catch (err) {
      console.error('Erro ao atualizar usuários:', err)
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
      console.error('Erro ao alterar status:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const columns: TableColumn<User>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{value}</span>
          {user.is_admin && (
            <span title="Administrador">
              <Shield className="h-4 w-4 text-purple-500" />
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
        return fullName || <span className="text-gray-400 italic">Não informado</span>
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      align: 'center',
      render: (value) =>
        value ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Inativo
          </span>
        ),
    },
    {
      key: 'created_at',
      header: 'Criado em',
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
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
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditUser(user)}
            disabled={actionLoading === user.id}
            title="Editar usuário"
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleActive(user)}
            disabled={actionLoading === user.id}
            title={user.is_active ? 'Desativar usuário' : 'Ativar usuário'}
            className={
              user.is_active
                ? 'text-red-600 hover:text-red-700 dark:text-red-400'
                : 'text-green-600 hover:text-green-700 dark:text-green-400'
            }
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
            className="text-red-600 hover:text-red-700 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gerenciar Usuários</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              disabled={refreshing || loading}
              title="Atualizar lista de usuários"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={onCreateUser} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Usuário
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        {loading && !hasLoaded ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
      </CardContent>
    </Card>
  )
}
