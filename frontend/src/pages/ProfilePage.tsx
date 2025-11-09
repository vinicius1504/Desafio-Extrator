/**
 * Página de perfil do usuário - Design Minimalista
 * - Tab 1: Informações pessoais (para todos)
 * - Tab 2: Alterar senha (para todos)
 * - Tab 3: Histórico de Exportações (para todos)
 * - Tab 4: Painel admin (apenas para admins)
 */

import { useState } from 'react'
import { useAuth } from '@/hooks'
import { ProfileInfoCard, ChangePasswordCard } from '@/components/features/profile'
import { UserList, UserForm, UserDeleteModal } from '@/components/features/admin'
import { ExportHistoryList, ProductCatalogModal, GlobalCatalogView } from '@/components/features/exports'
import type { User } from '@/lib/api'
import { User as UserIcon, Lock, Shield, History, LayoutGrid, LayoutList } from 'lucide-react'

type TabType = 'personal' | 'security' | 'history' | 'admin'
type HistoryViewMode = 'compact' | 'catalog'

export function ProfilePage() {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('personal')

  // Estados para o painel admin
  const [showUserForm, setShowUserForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Estados para o catálogo de exportações
  const [showCatalog, setShowCatalog] = useState(false)
  const [selectedUploadId, setSelectedUploadId] = useState<number | null>(null)
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(null)

  // Estado para modo de visualização do histórico
  const [historyViewMode, setHistoryViewMode] = useState<HistoryViewMode>('compact')

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

  const handleViewCatalog = (uploadId: number, companyName?: string | null) => {
    setSelectedUploadId(uploadId)
    setSelectedCompanyName(companyName || null)
    setShowCatalog(true)
  }

  const handleCloseCatalog = () => {
    setShowCatalog(false)
    setSelectedUploadId(null)
    setSelectedCompanyName(null)
  }

  const tabs = [
    {
      id: 'personal' as TabType,
      label: 'Informações Pessoais',
      icon: UserIcon,
    },
    {
      id: 'security' as TabType,
      label: 'Segurança',
      icon: Lock,
    },
    {
      id: 'history' as TabType,
      label: 'Histórico',
      icon: History,
    },
    ...(isAdmin
      ? [
          {
            id: 'admin' as TabType,
            label: 'Gerenciar Usuários',
            icon: Shield,
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-[calc(100vh-200px)] space-y-8">
      {/* Header Minimalista */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-gray-100">
              Meu <span className="font-semibold">Perfil</span>
            </h1>
            {user && (
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                {isAdmin && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(Admin)</span>}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Tabs Minimalistas */}
      <section>
        <div className="max-w-5xl mx-auto">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="flex gap-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-light">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </section>

      {/* Conteúdo das Tabs */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Tab: Informações Pessoais */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <ProfileInfoCard />
            </div>
          )}

          {/* Tab: Segurança */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <ChangePasswordCard />
            </div>
          )}

          {/* Tab: Histórico de Exportações */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Toggle de visualização */}
              <div className="flex items-center justify-end gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-2">
                <button
                  onClick={() => setHistoryViewMode('compact')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-colors ${
                    historyViewMode === 'compact'
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="text-sm font-light">Compactado</span>
                </button>
                <button
                  onClick={() => setHistoryViewMode('catalog')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-colors ${
                    historyViewMode === 'catalog'
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-sm font-light">Catálogo</span>
                </button>
              </div>

              {/* Conteúdo baseado no modo de visualização */}
              {historyViewMode === 'compact' ? (
                <ExportHistoryList onViewCatalog={handleViewCatalog} />
              ) : (
                <GlobalCatalogView />
              )}
            </div>
          )}

          {/* Tab: Painel Admin */}
          {activeTab === 'admin' && isAdmin && (
            <div className="space-y-6">
              <UserList
                onCreateUser={handleCreateUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}
        </div>
      </section>

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

      {/* Modal do catálogo de produtos */}
      {showCatalog && selectedUploadId && (
        <ProductCatalogModal
          isOpen={showCatalog}
          onClose={handleCloseCatalog}
          uploadId={selectedUploadId}
          initialCompanyName={selectedCompanyName}
        />
      )}
    </div>
  )
}
