/**
 * Exportador XML
 */

import type { Product } from '@/types'
import { formatPrice } from '../formatters'

/**
 * Escapa caracteres especiais XML
 * @param value - Valor a escapar
 * @returns Valor escapado
 */
function escapeXml(value: any): string {
  if (value === null || value === undefined) return ''

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Gera XML de um produto
 * @param product - Produto a converter
 * @param indent - Nível de indentação
 * @returns String XML do produto
 */
function productToXml(product: Product, indent: string = '  '): string {
  const variants = product.variants.map(variant => {
    const prices = Object.entries(variant.prices || {})
      .map(([name, price]) => {
        return `${indent}        <preco nome="${escapeXml(name)}">${formatPrice(price)}</preco>`
      })
      .join('\n')

    return `${indent}    <variante>
${indent}      <codigo>${escapeXml(variant.code)}</codigo>
${indent}      <dimensoes>${escapeXml(variant.dimensions || '')}</dimensoes>
${indent}      <peso>${escapeXml(variant.weight || '')}</peso>
${indent}      <cubagem>${escapeXml(variant.cubic || '')}</cubagem>
${indent}      <ncm>${escapeXml(variant.ncm || '')}</ncm>
${indent}      <precos>
${prices}
${indent}      </precos>
${indent}    </variante>`
  }).join('\n')

  return `${indent}<produto>
${indent}  <descricao>${escapeXml(product.description || '')}</descricao>
${indent}  <variantes>
${variants}
${indent}  </variantes>
${indent}</produto>`
}

/**
 * Exporta produtos para formato XML
 * @param products - Array de produtos a exportar
 * @returns Blob com conteúdo XML
 */
export function exportToXml(products: Product[]): Blob {
  const productsXml = products.map(product => productToXml(product, '')).join('\n')

  const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<produtos>
${productsXml}
</produtos>`

  return new Blob([xmlData], { type: 'application/xml' })
}

/**
 * Exporta um único produto para formato XML
 * @param product - Produto a exportar
 * @returns Blob com conteúdo XML
 */
export function exportSingleProductToXml(product: Product): Blob {
  const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
${productToXml(product, '')}`

  return new Blob([xmlData], { type: 'application/xml' })
}
