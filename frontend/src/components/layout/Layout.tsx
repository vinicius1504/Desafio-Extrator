import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileSpreadsheet, Upload } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header fixo */}
      <header className="flex-none bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
              <FileSpreadsheet className="h-6 w-6" />
              Extrator de Planilhas
            </Link>
            <nav className="flex gap-4">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/')
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Início
              </Link>
              <Link
                to="/upload"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/upload')
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo scrollável */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      {/* Footer fixo */}
      <footer className="flex-none bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            © 2024 Extrator de Planilhas. Desenvolvido com React + TypeScript + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}
