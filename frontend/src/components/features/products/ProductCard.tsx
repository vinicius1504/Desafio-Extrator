/**
 * Card de produto individual
 */

import { Card, CardContent } from '@/components/ui'
import { ChevronDown, ChevronRight, FileJson, FileText, FileCode } from 'lucide-react'
import type { Product, ExportFormat } from '@/types'
import { formatPrice } from '@/lib/utils'
import { ProductVariantTable } from './ProductVariantTable'

export interface ProductCardProps {
  product: Product
  isExpanded: boolean
  isSelected: boolean
  isExporting: boolean
  onToggleExpand: () => void
  onToggleSelect: () => void
  onExport: (format: ExportFormat) => void
}

export function ProductCard({
  product,
  isExpanded,
  isSelected,
  isExporting,
  onToggleExpand,
  onToggleSelect,
  onExport,
}: ProductCardProps) {
  const mainVariant = product.variants?.[0]

  if (!mainVariant) return null

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
              className="mt-1.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
            />

            {/* Expand/Collapse */}
            <div className="mt-1 cursor-pointer" onClick={onToggleExpand}>
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggleExpand}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {product.description || '(Sem descrição)'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {product.variants.length} variante(s)
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {mainVariant.weight && <span>Peso: {mainVariant.weight}kg</span>}
                {mainVariant.cubic && <span>Cubagem: {mainVariant.cubic}m³</span>}
                {mainVariant.ncm && <span>NCM: {mainVariant.ncm}</span>}
              </div>

              {/* Prices */}
              {mainVariant.prices && Object.keys(mainVariant.prices).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {Object.entries(mainVariant.prices).map(([name, price]) => (
                    <div key={name} className="px-3 py-1 bg-primary-50 dark:bg-primary-900 rounded-full">
                      <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                        {name}: R$ {formatPrice(price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Baixar:</div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onExport('json')
                }}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Baixar em JSON"
              >
                <FileJson className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>JSON</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onExport('csv')
                }}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Baixar em CSV"
              >
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>CSV</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onExport('xml')
                }}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Baixar em XML"
              >
                <FileCode className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span>XML</span>
              </button>
            </div>
          </div>
        </div>

        {/* Variants Table */}
        {isExpanded && product.variants && product.variants.length > 1 && (
          <ProductVariantTable variants={product.variants} />
        )}
      </CardContent>
    </Card>
  )
}
