/**
 * Barra de pesquisa de produtos
 */

import { Input } from '@/components/ui'
import { Search } from 'lucide-react'

export interface ProductSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ProductSearch({
  value,
  onChange,
  placeholder = 'Pesquisar por descrição, código, dimensões ou NCM...',
}: ProductSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
