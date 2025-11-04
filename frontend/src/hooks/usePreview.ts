/**
 * Hook para gerenciar preview de planilha
 */

import { useState, useEffect } from 'react'
import { spreadsheetAPI } from '@/lib/api'
import type { SpreadsheetPreview } from '@/types'

export interface UsePreviewReturn {
  // Estado
  preview: SpreadsheetPreview | null
  loading: boolean
  error: string | null

  // Actions
  loadPreview: () => Promise<void>
  refreshPreview: () => Promise<void>
  setError: (error: string | null) => void
}

/**
 * Hook para gerenciar preview
 */
export function usePreview(uploadId?: number): UsePreviewReturn {
  const [preview, setPreview] = useState<SpreadsheetPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPreview = async () => {
    if (!uploadId) {
      setPreview(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await spreadsheetAPI.getPreview(uploadId)
      setPreview(data)
    } catch (err) {
      console.error('Erro ao carregar preview:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar preview')
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPreview()
  }, [uploadId])

  const refreshPreview = async () => {
    await loadPreview()
  }

  return {
    preview,
    loading,
    error,

    loadPreview,
    refreshPreview,
    setError,
  }
}
