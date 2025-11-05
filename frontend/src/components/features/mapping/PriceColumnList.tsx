/**
 * Lista de colunas de preço
 */

import { Button, Input } from '@/components/ui'
import { Plus, X } from 'lucide-react'
import { formatColumnIndex } from '@/lib/utils'
import type { PriceColumn } from '@/hooks'

export interface PriceColumnListProps {
  priceColumns: PriceColumn[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdateName: (index: number, name: string) => void
  onUpdateColumn: (index: number, input: string) => void
}

export function PriceColumnList({
  priceColumns,
  onAdd,
  onRemove,
  onUpdateName,
  onUpdateColumn,
}: PriceColumnListProps) {
  const MAX_PRICE_COLUMNS = 3
  const canAddMore = priceColumns.length < MAX_PRICE_COLUMNS

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Colunas de Preço (máximo {MAX_PRICE_COLUMNS})
      </label>

      <div className="space-y-3">
        {priceColumns.slice(0, MAX_PRICE_COLUMNS).map((priceCol, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Nome do preço (ex: Atacado)"
                value={priceCol.name}
                onChange={(e) => onUpdateName(index, e.target.value)}
              />
            </div>
            <div className="w-32">
              <Input
                type="text"
                placeholder="Coluna"
                defaultValue={formatColumnIndex(priceCol.column)}
                onChange={(e) => onUpdateColumn(index, e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => onRemove(index)}
              className="px-3"
              title="Remover"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={onAdd} className="w-full" disabled={!canAddMore}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Coluna de Preço
        </Button>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Adicione até {MAX_PRICE_COLUMNS} colunas de preço (ex: Atacado, Varejo, Revenda)
      </p>
    </div>
  )
}
