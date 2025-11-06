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
    <div className="min-h-screen py-4 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Compacto */}
        <div className="mb-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-2">
            <UserIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Configurações</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Meu Perfil
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e segurança
          </p>

          {/* User Info Quick View */}
          {user && (
            <div className="mt-3 inline-flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user.first_name?.[0] || user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              {isAdmin && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Admin
                </span>
              )}
            </div>
          )}
        </div>

        {/* Layout com Menu Lateral */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Menu Lateral (Sidebar) - Compacto */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3">
                <h3 className="text-white font-semibold text-sm">Navegação</h3>
                <p className="text-blue-100 text-xs mt-0.5">Escolha uma opção</p>
              </div>
              <nav className="flex flex-col p-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-left transition-all rounded-lg mb-1 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 font-semibold shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${isActive ? 'bg-white dark:bg-gray-700 shadow-sm' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <Icon className={`h-4 w-4 ${isActive ? tab.iconColor : 'text-gray-400'}`} />
                      </div>
                      <span className="text-xs flex-1">{tab.label}</span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="flex-1 space-y-4">
            {/* Tab: Informações Pessoais */}
            {activeTab === 'personal' && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Informações Pessoais
                      </h2>
                      <p className="text-blue-100 text-xs mt-0.5">
                        Visualize e edite seus dados pessoais
                      </p>
                    </div>
                  </div>
                </div>
                <ProfileInfoCard />
              </div>
            )}

            {/* Tab: Segurança */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Segurança
                      </h2>
                      <p className="text-green-100 text-xs mt-0.5">
                        Gerencie sua senha e configurações de segurança
                      </p>
                    </div>
                  </div>
                </div>
                <ChangePasswordCard />
              </div>
            )}

            {/* Tab: Painel Admin */}
            {activeTab === 'admin' && isAdmin && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Painel de Administração
                      </h2>
                      <p className="text-purple-100 text-xs mt-0.5">
                        Gerencie usuários e permissões do sistema
                      </p>
                    </div>
                  </div>
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
