/**
 * Hook para gerenciar upload de arquivos
 */

import { useState } from 'react'
import { spreadsheetAPI } from '@/lib/api'
import { validateFile } from '@/lib/utils'
import { ERROR_MESSAGES } from '@/constants'

export interface UseUploadReturn {
  // Estado
  uploading: boolean
  progress: number
  error: string | null
  uploadedFile: File | null

  // Actions
  uploadFile: (file: File) => Promise<number | null>
  resetUpload: () => void
  setError: (error: string | null) => void
  validateAndSetFile: (file: File) => boolean
}

/**
 * Hook para gerenciar upload
 */
export function useUpload(): UseUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const validateAndSetFile = (file: File): boolean => {
    const validation = validateFile(file)

    if (!validation.valid) {
      setError(validation.error || ERROR_MESSAGES.INVALID_FILE_FORMAT)
      return false
    }

    setUploadedFile(file)
    setError(null)
    return true
  }

  const uploadFile = async (file: File): Promise<number | null> => {
    if (!validateAndSetFile(file)) {
      return null
    }

    try {
      setUploading(true)
      setProgress(0)
      setError(null)

      // Simular progresso (pode ser implementado com axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await spreadsheetAPI.uploadFile(file)

      clearInterval(progressInterval)
      setProgress(100)

      return response.id
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.UPLOAD_FAILED)
      return null
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setUploading(false)
    setProgress(0)
    setError(null)
    setUploadedFile(null)
  }

  return {
    uploading,
    progress,
    error,
    uploadedFile,

    uploadFile,
    resetUpload,
    setError,
    validateAndSetFile,
  }
}
