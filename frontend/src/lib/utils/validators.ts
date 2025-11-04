/**
 * Utilitários de validação
 */

import { FILE_VALIDATION, COLUMN_VALIDATION, ERROR_MESSAGES } from '@/constants'
import { validateColumnIndex } from './columnUtils'

/**
 * Resultado de validação
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Valida tamanho de arquivo
 * @param file - Arquivo a validar
 * @returns Resultado da validação
 */
export function validateFileSize(file: File): ValidationResult {
  if (file.size > FILE_VALIDATION.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE,
    }
  }
  return { valid: true }
}

/**
 * Valida formato de arquivo
 * @param file - Arquivo a validar
 * @returns Resultado da validação
 */
export function validateFileFormat(file: File): ValidationResult {
  const fileName = file.name.toLowerCase()
  const hasValidExtension = FILE_VALIDATION.ACCEPTED_FORMATS.some(ext =>
    fileName.endsWith(ext.toLowerCase())
  )

  const hasValidMimeType = FILE_VALIDATION.ACCEPTED_MIME_TYPES.includes(file.type)

  if (!hasValidExtension && !hasValidMimeType) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_FORMAT,
    }
  }

  return { valid: true }
}

/**
 * Valida arquivo completo (tamanho + formato)
 * @param file - Arquivo a validar
 * @returns Resultado da validação
 */
export function validateFile(file: File): ValidationResult {
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  const formatValidation = validateFileFormat(file)
  if (!formatValidation.valid) {
    return formatValidation
  }

  return { valid: true }
}

/**
 * Estrutura de mapeamento de colunas
 */
export interface ColumnMapping {
  code?: number | null
  description?: number | null
  dimensions?: number | null
  weight?: number | null
  cubic?: number | null
  ncm?: number | null
  priceColumns?: Array<{ name: string; column: number }>
  groupBy?: string
}

/**
 * Valida mapeamento de colunas
 * @param mapping - Mapeamento a validar
 * @returns Resultado da validação
 */
export function validateMapping(mapping: ColumnMapping): ValidationResult {
  // Validar campo obrigatório (código)
  if (mapping.code === null || mapping.code === undefined || !validateColumnIndex(mapping.code)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MAPPING_REQUIRED,
    }
  }

  // Validar índices de colunas opcionais
  const optionalFields: Array<keyof ColumnMapping> = [
    'description',
    'dimensions',
    'weight',
    'cubic',
    'ncm',
  ]

  for (const field of optionalFields) {
    const value = mapping[field]
    if (value !== null && value !== undefined && !validateColumnIndex(value as number)) {
      return {
        valid: false,
        error: `${ERROR_MESSAGES.INVALID_COLUMN_INDEX}: ${field}`,
      }
    }
  }

  // Validar colunas de preço
  if (mapping.priceColumns) {
    for (const priceCol of mapping.priceColumns) {
      if (!validateColumnIndex(priceCol.column)) {
        return {
          valid: false,
          error: `${ERROR_MESSAGES.INVALID_COLUMN_INDEX}: ${priceCol.name}`,
        }
      }
      if (!priceCol.name || priceCol.name.trim() === '') {
        return {
          valid: false,
          error: 'Nome de coluna de preço não pode ser vazio',
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Verifica se há colunas duplicadas no mapeamento
 * @param mapping - Mapeamento a verificar
 * @returns Lista de colunas duplicadas ou array vazio
 */
export function findDuplicateColumns(mapping: ColumnMapping): number[] {
  const columnIndices: number[] = []
  const duplicates = new Set<number>()

  // Adicionar colunas básicas
  const basicFields: Array<keyof ColumnMapping> = [
    'code',
    'description',
    'dimensions',
    'weight',
    'cubic',
    'ncm',
  ]

  for (const field of basicFields) {
    const value = mapping[field]
    if (value !== null && value !== undefined && typeof value === 'number') {
      if (columnIndices.includes(value)) {
        duplicates.add(value)
      } else {
        columnIndices.push(value)
      }
    }
  }

  // Adicionar colunas de preço
  if (mapping.priceColumns) {
    for (const priceCol of mapping.priceColumns) {
      if (columnIndices.includes(priceCol.column)) {
        duplicates.add(priceCol.column)
      } else {
        columnIndices.push(priceCol.column)
      }
    }
  }

  return Array.from(duplicates)
}
