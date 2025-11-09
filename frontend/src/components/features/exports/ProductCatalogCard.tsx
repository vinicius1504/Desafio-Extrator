/**
 * Card de produto em formato catálogo - Design Minimalista
 */

import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ProductDetail } from '@/lib/api'
import { ImageIcon, Edit2, Upload, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProductCatalogCardProps {
  product: ProductDetail
  onUpdateImage: (productId: number, file: File) => Promise<void>
}

export function ProductCatalogCard({ product, onUpdateImage }: ProductCatalogCardProps) {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEdit = () => {
    navigate(`/products/edit/${product.id}`)
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      {/* Imagem do produto */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.description || product.code || 'Produto'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-gray-400 dark:text-gray-600" />
          </div>
        )}
      </div>

      {/* Informações do produto */}
      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
              Código
            </p>
            <p className="text-sm font-light text-gray-900 dark:text-gray-100">
              {product.code || '-'}
            </p>
          </div>

          <div>
            <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
              Descrição
            </p>
            <p className="text-sm font-light text-gray-900 dark:text-gray-100 line-clamp-2">
              {product.description || '-'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Cubagem
              </p>
              <p className="text-sm font-light text-gray-900 dark:text-gray-100">
                {product.cubic || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Peso
              </p>
              <p className="text-sm font-light text-gray-900 dark:text-gray-100">
                {product.weight || '-'}
              </p>
            </div>
          </div>

          {product.ncm && (
            <div>
              <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                NCM
              </p>
              <p className="text-sm font-light text-gray-900 dark:text-gray-100">
                {product.ncm}
              </p>
            </div>
          )}

          {/* Variantes */}
          {product.variants && product.variants.length > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                Variantes ({product.variants.length})
              </p>
              <div className="space-y-2">
                {product.variants.slice(0, 2).map((variant, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-sm"
                  >
                    <Package className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1 min-w-0">
                      {Object.entries(variant.fields || {}).map(([key, value]) => (
                        <span key={key} className="text-xs font-light text-gray-900 dark:text-gray-100">
                          {key}: {String(value)}
                          {' '}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {product.variants.length > 2 && (
                  <p className="text-xs font-light text-gray-600 dark:text-gray-400 text-center">
                    +{product.variants.length - 2} variantes
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botão editar */}
        <Button
          onClick={handleEdit}
          variant="outline"
          size="sm"
          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm h-10"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>
    </div>
  )
}
