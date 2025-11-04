/**
 * Exportador JSON
 */

import type { Product } from '@/types'

/**
 * Exporta produtos para formato JSON
 * @param products - Array de produtos a exportar
 * @returns Blob com conteúdo JSON
 */
export function exportToJson(products: Product[]): Blob {
  const jsonData = JSON.stringify(products, null, 2)
  return new Blob([jsonData], { type: 'application/json' })
}

/**
 * Exporta um único produto para formato JSON
 * @param product - Produto a exportar
 * @returns Blob com conteúdo JSON
 */
export function exportSingleProductToJson(product: Product): Blob {
  const productData = {
    description: product.description,
    variants: product.variants,
  }
  const jsonData = JSON.stringify(productData, null, 2)
  return new Blob([jsonData], { type: 'application/json' })
}
