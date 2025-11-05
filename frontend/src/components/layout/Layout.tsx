import { ReactNode, useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileSpreadsheet, Upload, User, ChevronDown, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth, useDarkMode } from '@/hooks'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => location.pathname === path
  const isLoginPage = location.pathname === '/login'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    setIsDropdownOpen(false)
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setIsDropdownOpen(false)
  }

  const handleToggleDarkMode = () => {
    toggleDarkMode()
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

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

                {/* User dropdown - apenas se autenticado */}
                {isAuthenticated && user && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.username}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        {/* Ver Perfil */}
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>Ver Perfil</span>
                        </button>

                        {/* Divisor */}
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

                        {/* Dark Mode Toggle */}
                        <button
                          onClick={handleToggleDarkMode}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {isDark ? (
                            <>
                              <Sun className="h-4 w-4" />
                              <span>Modo Claro</span>
                            </>
                          ) : (
                            <>
                              <Moon className="h-4 w-4" />
                              <span>Modo Escuro</span>
                            </>
                          )}
                        </button>

                        {/* Divisor */}
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

                        {/* Sair */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sair</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Conteúdo scrollável */}
      <main className={`flex-1 ${isLoginPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {isLoginPage ? (
          children
        ) : (
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        )}
      </main>

      {/* Footer fixo - Esconder na página de login */}
      {!isLoginPage && (
        <footer className="flex-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              © 2024 Extrator de Planilhas. Desenvolvido com React + TypeScript + Tailwind CSS
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
