import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileSpreadsheet, Upload, LogOut, User } from 'lucide-react'
import { DarkModeToggle } from '@/components/common'
import { useAuth } from '@/hooks'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  const isActive = (path: string) => location.pathname === path
  const isLoginPage = location.pathname === '/login'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header fixo - Esconder na página de login */}
      {!isLoginPage && (
        <header className="flex-none bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400">
                <FileSpreadsheet className="h-6 w-6" />
                Extrator de Planilhas
              </Link>
              <div className="flex items-center gap-4">
                {/* Menu - apenas se autenticado */}
                {isAuthenticated && (
                  <nav className="flex gap-4">
                    <Link
                      to="/"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive('/')
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Início
                    </Link>
                    <Link
                      to="/upload"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive('/upload')
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Link>
                  </nav>
                )}

                <DarkModeToggle />

                {/* User info e logout - apenas se autenticado */}
                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{user.username}</span>
                      {user.is_admin && (
                        <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Sair"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Conteúdo scrollável */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      {/* Footer fixo */}
      <footer className="flex-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2024 Extrator de Planilhas. Desenvolvido com React + TypeScript + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}
