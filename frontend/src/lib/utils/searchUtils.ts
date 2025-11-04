/**
 * Utilitários para busca e filtro de produtos
 */

import type { Product } from '@/types'

/**
 * Filtra produtos baseado em termo de pesquisa
 * @param products - Array de produtos
 * @param searchTerm - Termo de pesquisa
 * @returns Array de produtos filtrados
 */
export function filterProducts(products: Product[], searchTerm: string): Product[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return products
  }

  const searchLower = searchTerm.toLowerCase().trim()

  return products.filter(product => {
    // Buscar na descrição do produto
    if (product.description?.toLowerCase().includes(searchLower)) {
      return true
    }

    // Buscar nas variantes
    if (product.variants) {
      // Buscar nos códigos das variantes
      if (product.variants.some(v => v.code?.toLowerCase().includes(searchLower))) {
        return true
      }

      // Buscar nas dimensões
      if (product.variants.some(v => v.dimensions?.toLowerCase().includes(searchLower))) {
        return true
      }

      // Buscar no NCM
      if (product.variants.some(v => v.ncm?.toLowerCase().includes(searchLower))) {
        return true
      }

      // Buscar no peso
      if (product.variants.some(v => String(v.weight).includes(searchLower))) {
        return true
      }

      // Buscar na cubagem
      if (product.variants.some(v => String(v.cubic).includes(searchLower))) {
        return true
      }
    }

    return false
  })
}

/**
 * Ordena produtos por campo
 * @param products - Array de produtos
 * @param field - Campo para ordenar
 * @param direction - Direção da ordenação (asc ou desc)
 * @returns Array de produtos ordenados
 */
export function sortProducts(
  products: Product[],
  field: 'description' | 'code' | 'variants',
  direction: 'asc' | 'desc' = 'asc'
): Product[] {
  const sorted = [...products].sort((a, b) => {
    let compareValue = 0

    switch (field) {
      case 'description':
        const descA = a.description || ''
        const descB = b.description || ''
        compareValue = descA.localeCompare(descB)
        break

      case 'code':
        const codeA = a.variants?.[0]?.code || ''
        const codeB = b.variants?.[0]?.code || ''
        compareValue = codeA.localeCompare(codeB)
        break

      case 'variants':
        const variantsA = a.variants?.length || 0
        const variantsB = b.variants?.length || 0
        compareValue = variantsA - variantsB
        break

      default:
        return 0
    }

    return direction === 'asc' ? compareValue : -compareValue
  })

  return sorted
}

/**
 * Pagina array de produtos
 * @param products - Array de produtos
 * @param limit - Número de itens por página
 * @returns Array de produtos paginados
 */
export function paginateProducts(products: Product[], limit: number): Product[] {
  return products.slice(0, limit)
}

/**
 * Agrupa produtos por campo
 * @param products - Array de produtos
 * @param field - Campo para agrupar
 * @returns Map de grupos
 */
export function groupProductsBy(
  products: Product[],
  field: 'description'
): Map<string, Product[]> {
  const groups = new Map<string, Product[]>()

  products.forEach(product => {
    let key = ''

    switch (field) {
      case 'description':
        key = product.description || '(Sem descrição)'
        break
      default:
        key = 'Outros'
    }

    const existing = groups.get(key) || []
    groups.set(key, [...existing, product])
  })

  return groups
}

/**
 * Conta total de variantes em produtos
 * @param products - Array de produtos
 * @returns Número total de variantes
 */
export function countTotalVariants(products: Product[]): number {
  return products.reduce((acc, product) => acc + (product.variants?.length || 0), 0)
}

/**
 * Filtra produtos por número mínimo de variantes
 * @param products - Array de produtos
 * @param minVariants - Número mínimo de variantes
 * @returns Array de produtos filtrados
 */
export function filterByMinVariants(products: Product[], minVariants: number): Product[] {
  return products.filter(product => (product.variants?.length || 0) >= minVariants)
}

/**
 * Busca produtos que possuem determinado preço
 * @param products - Array de produtos
 * @param priceName - Nome do preço a buscar
 * @returns Array de produtos filtrados
 */
export function filterByPriceName(products: Product[], priceName: string): Product[] {
  if (!priceName) return products

  const priceLower = priceName.toLowerCase()

  return products.filter(product => {
    return product.variants?.some(variant => {
      if (!variant.prices) return false
      return Object.keys(variant.prices).some(key => key.toLowerCase().includes(priceLower))
    })
  })
}
