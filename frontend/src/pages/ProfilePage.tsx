/**
 * Página de perfil do usuário
 * - Tab 1: Informações pessoais (para todos)
 * - Tab 2: Alterar senha (para todos)
 * - Tab 3: Painel admin (apenas para admins)
 */

import { useState } from 'react'
import { useAuth } from '@/hooks'
import { ProfileInfoCard, ChangePasswordCard } from '@/components/features/profile'
import { UserList, UserForm, UserDeleteModal } from '@/components/features/admin'
import type { User } from '@/lib/api'
import { User as UserIcon, Lock, Shield } from 'lucide-react'

type TabType = 'personal' | 'security' | 'admin'

export function ProfilePage() {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('personal')

  // Estados para o painel admin
  const [showUserForm, setShowUserForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreateUser = () => {
    setSelectedUser(null)
    setShowUserForm(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowUserForm(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleCloseForm = () => {
    setShowUserForm(false)
    setSelectedUser(null)
    // Trigger refresh da lista
    setRefreshTrigger(prev => prev + 1)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedUser(null)
    // Trigger refresh da lista
    setRefreshTrigger(prev => prev + 1)
  }

  const tabs = [
    {
      id: 'personal' as TabType,
      label: 'Informações Pessoais',
      icon: UserIcon,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'security' as TabType,
      label: 'Segurança',
      icon: Lock,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    ...(isAdmin
      ? [
          {
            id: 'admin' as TabType,
            label: 'Gerenciar Usuários',
            icon: Shield,
            iconColor: 'text-purple-600 dark:text-purple-400',
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <UserIcon className="h-8 w-8 mr-3 text-blue-600 dark:text-blue-400" />
            Meu Perfil
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>

        {/* Layout com Menu Lateral */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Lateral (Sidebar) */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <nav className="flex flex-col">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-medium'
                          : 'bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? tab.iconColor : 'text-gray-400'}`} />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="flex-1">
            {/* Tab: Informações Pessoais */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                    Informações Pessoais
                  </h2>
                </div>
                <ProfileInfoCard />
              </div>
            )}

            {/* Tab: Segurança */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                    Segurança
                  </h2>
                </div>
                <ChangePasswordCard />
              </div>
            )}

            {/* Tab: Painel Admin */}
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                    Painel de Administração
                  </h2>
                </div>
                <UserList
                  onCreateUser={handleCreateUser}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}
          </main>
        </div>

        {/* Modals do painel admin */}
        {isAdmin && (
          <>
            <UserForm
              isOpen={showUserForm}
              onClose={handleCloseForm}
              user={selectedUser}
              onSuccess={handleCloseForm}
            />

            <UserDeleteModal
              isOpen={showDeleteModal}
              onClose={handleCloseDeleteModal}
              user={selectedUser}
              onSuccess={handleCloseDeleteModal}
            />
          </>
        )}
      </div>
    </div>
  )
}
