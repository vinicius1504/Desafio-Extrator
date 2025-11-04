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
  return (
    <div className="border-t border-gray-200 p-6 bg-gray-50">
      <h4 className="font-semibold text-gray-900 mb-4">Variantes</h4>
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
