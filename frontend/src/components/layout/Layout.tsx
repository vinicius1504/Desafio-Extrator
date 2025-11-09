import { ReactNode, useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileSpreadsheet, User, ChevronDown, LogOut, Moon, Sun } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header fixo - Esconder na página de login */}
      {!isLoginPage && (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              {/* Logo - Minimalista */}
              <Link to="/" className="flex items-center gap-3 text-gray-900 dark:text-gray-100 font-light text-xl tracking-tight">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-sm flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                </div>
                <span className="hidden sm:inline">Extrator de Planilhas</span>
              </Link>

              <div className="flex items-center gap-8">
                {/* User dropdown - apenas se autenticado */}
                {isAuthenticated && user && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 text-sm font-light text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-light">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:inline">{user.username}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 py-2 z-50">
                        {/* Ver Perfil */}
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-light text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>Ver Perfil</span>
                        </button>

                        {/* Divisor */}
                        <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

                        {/* Dark Mode Toggle */}
                        <button
                          onClick={handleToggleDarkMode}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-light text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                        <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

                        {/* Sair */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-light text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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

      {/* Conteúdo principal - flex-1 empurra o footer para baixo */}
      <main className="flex-1">
        {isLoginPage ? (
          children
        ) : (
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        )}
      </main>

      {/* Footer no final do conteúdo - Esconder na página de login */}
      {!isLoginPage && (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <div className="container mx-auto px-4 py-8">
            <p className="text-center text-sm font-light text-gray-600 dark:text-gray-400">
              © 2024 Extrator de Planilhas
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
