/**
 * RouteGuard - Valida parâmetros de rota e redireciona em caso de erro
 */

import { ReactNode } from 'react'
import { Navigate, useParams } from 'react-router-dom'

interface RouteGuardProps {
  children: ReactNode
  validate?: (params: Record<string, string | undefined>) => boolean
  redirectTo?: string
}

export function RouteGuard({ children, validate, redirectTo = '/404' }: RouteGuardProps) {
  const params = useParams()

  // Se não houver validação customizada, permitir acesso
  if (!validate) {
    return <>{children}</>
  }

  // Executar validação
  const isValid = validate(params)

  // Se não for válido, redirecionar
  if (!isValid) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

/**
 * Validador para uploadId - verifica se é um número válido
 */
export function validateUploadId(params: Record<string, string | undefined>): boolean {
  const { uploadId } = params

  if (!uploadId) return false

  const id = parseInt(uploadId, 10)
  return !isNaN(id) && id > 0
}
