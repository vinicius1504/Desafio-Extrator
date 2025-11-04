/**
 * Exportador CSV
 */

import type { Product } from '@/types'
import { formatPrice } from '../formatters'

/**
 * Escapa valores CSV (adiciona aspas se necessário)
 * @param value - Valor a escapar
 * @returns Valor escapado
 */
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return ''

  const stringValue = String(value)

  // Se contém vírgula, aspas ou quebra de linha, envolver em aspas
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Duplicar aspas internas
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Converte array para linha CSV
 * @param row - Array com valores da linha
 * @returns String CSV da linha
 */
function arrayToCsvRow(row: any[]): string {
  return row.map(escapeCsvValue).join(',')
}

/**
 * Exporta produtos para formato CSV
 * @param products - Array de produtos a exportar
 * @returns Blob com conteúdo CSV
 */
export function exportToCsv(products: Product[]): Blob {
  const headers = ['Descrição', 'Código', 'Dimensões', 'Peso', 'Cubagem', 'NCM', 'Preços']
  const rows: string[][] = []

  products.forEach(product => {
    product.variants.forEach(variant => {
      const pricesStr = Object.entries(variant.prices || {})
        .map(([name, price]) => `${name}: R$ ${formatPrice(price)}`)
        .join('; ')

      rows.push([
        product.description || '',
        variant.code,
        variant.dimensions || '',
        variant.weight ? String(variant.weight) : '',
        variant.cubic ? String(variant.cubic) : '',
        variant.ncm || '',
        pricesStr,
      ])
    })
  })

  const csvContent = [
    arrayToCsvRow(headers),
    ...rows.map(row => arrayToCsvRow(row)),
  ].join('\n')

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Exporta um único produto para formato CSV
 * @param product - Produto a exportar
 * @returns Blob com conteúdo CSV
 */
export function exportSingleProductToCsv(product: Product): Blob {
  const headers = ['Descrição', 'Código', 'Dimensões', 'Peso', 'Cubagem', 'NCM', 'Preços']
  const rows: string[][] = []

  product.variants.forEach(variant => {
    const pricesStr = Object.entries(variant.prices || {})
      .map(([name, price]) => `${name}: R$ ${formatPrice(price)}`)
      .join('; ')

    rows.push([
      product.description || '',
      variant.code,
      variant.dimensions || '',
      variant.weight ? String(variant.weight) : '',
      variant.cubic ? String(variant.cubic) : '',
      variant.ncm || '',
      pricesStr,
    ])
  })

  const csvContent = [
    arrayToCsvRow(headers),
    ...rows.map(row => arrayToCsvRow(row)),
  ].join('\n')

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
}
