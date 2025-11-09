/**
 * Tabela de variantes de produto
 */

import { Table } from '@/components/ui'
import type { ProductVariant } from '@/types'
import { formatPrice } from '@/lib/utils'

export interface ProductVariantTableProps {
  variants: ProductVariant[]
}

export function ProductVariantTable({ variants }: ProductVariantTableProps) {
  // Verificar se tem campos dinâmicos
  const firstVariant = variants[0]
  const hasDynamicFields = firstVariant?.fields && Object.keys(firstVariant.fields).length > 0

  // Se tem campos dinâmicos, gera colunas dinamicamente
  if (hasDynamicFields) {
    // Coletar todas as chaves únicas de todos os variants
    const allKeys = new Set<string>()
    variants.forEach(v => {
      if (v.fields) {
        Object.keys(v.fields).forEach(key => allKeys.add(key))
      }
    })

    const dynamicColumns = Array.from(allKeys).map(key => ({
      key: `fields.${key}`,
      header: key,
      render: (_: any, variant: ProductVariant) => {
        const value = variant.fields?.[key]
        if (value === null || value === undefined || value === '') return '-'
        if (typeof value === 'number') return value.toLocaleString('pt-BR')
        return String(value)
      }
    }))

    return (
      <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Variantes (Modo Dinâmico)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {Array.from(allKeys).map(key => (
                  <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {variants.map(variant => (
                <tr key={variant.id}>
                  {Array.from(allKeys).map(key => {
                    const value = variant.fields?.[key]
                    const displayValue = value === null || value === undefined || value === ''
                      ? '-'
                      : typeof value === 'number'
                        ? value.toLocaleString('pt-BR')
                        : String(value)
                    return (
                      <td key={key} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {displayValue}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // FALLBACK: Tabela tradicional com campos fixos
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Variantes</h4>
      <Table
        columns={[
          { key: 'code', header: 'Código', width: '120px' },
          {
            key: 'dimensions',
            header: 'Dimensões',
            render: (v) => v || '-',
          },
          {
            key: 'weight',
            header: 'Peso',
            render: (v) => (v ? `${v}kg` : '-'),
          },
          {
            key: 'cubic',
            header: 'Cubagem',
            render: (v) => (v ? `${v}m³` : '-'),
          },
          {
            key: 'ncm',
            header: 'NCM',
            render: (v) => v || '-',
          },
          {
            key: 'prices',
            header: 'Preços',
            render: (prices) =>
              Object.entries(prices as Record<string, number>)
                .map(([name, price]) => `${name}: R$ ${formatPrice(price)}`)
                .join(', ') || '-',
          },
        ]}
        data={variants}
        keyExtractor={(v) => v.id}
        compact
      />
    </div>
  )
}
