/**
 * Seletor de coluna individual
 */

import { Input } from '@/components/ui'
import { formatColumnIndex } from '@/lib/utils'

export interface ColumnSelectorProps {
  label: string
  value: number | null
  onInputChange: (input: string) => void
  required?: boolean
  placeholder?: string
  helpText?: string
}

export function ColumnSelector({
  label,
  value,
  onInputChange,
  required = false,
  placeholder = 'Ex: A, B, 1, 2',
  helpText,
}: ColumnSelectorProps) {
  const displayValue = value !== null ? formatColumnIndex(value) : ''

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        type="text"
        placeholder={placeholder}
        defaultValue={displayValue}
        onChange={(e) => onInputChange(e.target.value)}
        className={value !== null ? 'border-green-500' : ''}
      />
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      {value !== null && (
        <p className="mt-1 text-xs text-green-600">
          Mapeado para coluna: {formatColumnIndex(value)}
        </p>
      )}
    </div>
  )
}
