/**
 * Utilitários para manipulação de colunas de planilha
 */

import { COLUMN_VALIDATION } from '@/constants'

/**
 * Converte letra de coluna (A, B, C, ..., Z, AA, AB, ...) para número (0, 1, 2, ...)
 * @param letter - Letra da coluna (ex: "A", "AB", "ZZ")
 * @returns Índice numérico da coluna (0-based)
 * @throws Error se a letra for inválida
 */
export function columnLetterToNumber(letter: string): number {
  let result = 0
  const upperLetter = letter.toUpperCase()

  for (let i = 0; i < upperLetter.length; i++) {
    const charCode = upperLetter.charCodeAt(i) - 64 // A=1, B=2, ...
    if (charCode < 1 || charCode > 26) {
      throw new Error(`Letra de coluna inválida: ${letter}`)
    }
    result = result * 26 + charCode
  }

  return result - 1 // Converter para 0-based
}

/**
 * Converte número de coluna (0, 1, 2, ...) para letra (A, B, C, ..., Z, AA, AB, ...)
 * @param num - Índice numérico da coluna (0-based)
 * @returns Letra da coluna (ex: "A", "AB", "ZZ")
 * @throws Error se o número for inválido
 */
export function columnNumberToLetter(num: number): string {
  if (num < 0 || num > COLUMN_VALIDATION.MAX_COLUMN_INDEX) {
    throw new Error(`Índice de coluna inválido: ${num}`)
  }

  let result = ''
  let n = num + 1 // Converter para 1-based

  while (n > 0) {
    const remainder = (n - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    n = Math.floor((n - 1) / 26)
  }

  return result
}

/**
 * Faz parsing de entrada de coluna (pode ser letra ou número)
 * @param input - Input do usuário (ex: "A", "1", "AB", "27")
 * @returns Índice numérico da coluna (0-based) ou null se inválido
 */
export function parseColumnInput(input: string): number | null {
  if (!input || input.trim() === '') {
    return null
  }

  const trimmed = input.trim()

  // Tentar como número primeiro
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10)
    // Se for número, assumir 1-based e converter para 0-based
    const index = num - 1
    if (index >= COLUMN_VALIDATION.MIN_COLUMN_INDEX && index <= COLUMN_VALIDATION.MAX_COLUMN_INDEX) {
      return index
    }
    return null
  }

  // Tentar como letra
  if (/^[A-Za-z]+$/.test(trimmed)) {
    try {
      const index = columnLetterToNumber(trimmed)
      if (index >= COLUMN_VALIDATION.MIN_COLUMN_INDEX && index <= COLUMN_VALIDATION.MAX_COLUMN_INDEX) {
        return index
      }
    } catch {
      return null
    }
  }

  return null
}

/**
 * Valida se um índice de coluna está no range válido
 * @param index - Índice da coluna (0-based)
 * @returns true se válido, false caso contrário
 */
export function validateColumnIndex(index: number | null | undefined): boolean {
  if (index === null || index === undefined) return false
  return index >= COLUMN_VALIDATION.MIN_COLUMN_INDEX && index <= COLUMN_VALIDATION.MAX_COLUMN_INDEX
}

/**
 * Gera opções de colunas para um select
 * @param maxColumns - Número máximo de colunas
 * @returns Array de opções { value, label }
 */
export function generateColumnOptions(maxColumns: number = 26): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = []

  for (let i = 0; i < Math.min(maxColumns, COLUMN_VALIDATION.MAX_COLUMN_INDEX + 1); i++) {
    const letter = columnNumberToLetter(i)
    options.push({
      value: i.toString(),
      label: `${letter} (${i + 1})`,
    })
  }

  return options
}

/**
 * Formata índice de coluna para exibição amigável
 * @param index - Índice da coluna (0-based)
 * @returns String formatada (ex: "A (1)")
 */
export function formatColumnIndex(index: number | null | undefined): string {
  if (index === null || index === undefined) return '-'
  if (!validateColumnIndex(index)) return '-'

  try {
    const letter = columnNumberToLetter(index)
    return `${letter} (${index + 1})`
  } catch {
    return '-'
  }
}

/**
 * Extrai índices de colunas de um array de headers
 * @param headers - Array de headers da planilha
 * @returns Map de nome do header para índice
 */
export function extractColumnIndices(headers: string[]): Map<string, number> {
  const map = new Map<string, number>()

  headers.forEach((header, index) => {
    if (header && header.trim() !== '') {
      map.set(header.toLowerCase().trim(), index)
    }
  })

  return map
}
