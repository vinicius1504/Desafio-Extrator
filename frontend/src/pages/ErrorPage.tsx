/**
 * Página de erro genérico
 */

import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'

export function ErrorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const message = searchParams.get('message') || 'Ocorreu um erro inesperado.'
  const code = searchParams.get('code') || 'ERROR'

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="p-6 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Code */}
        <div className="text-sm font-mono text-gray-500 dark:text-gray-400">
          {code}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
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

        {/* Help text */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Se o problema persistir, tente recarregar a página.
        </p>
      </div>
    </div>
  )
}
