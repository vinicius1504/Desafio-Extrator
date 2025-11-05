/**
 * Página 404 - Rota não encontrada
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 Icon */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🤔</div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Página não encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir para Home
          </Button>
        </div>
      </div>
    </div>
  )
}
