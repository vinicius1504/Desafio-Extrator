/**
 * Formulário de mapeamento automático
 */

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Zap } from 'lucide-react'

export interface AutoMappingFormProps {
  onApply: (startCol: string, endCol: string, startRow: string) => void
}

export function AutoMappingForm({ onApply }: AutoMappingFormProps) {
  const [startColumn, setStartColumn] = useState('A')
  const [endColumn, setEndColumn] = useState('H')
  const [startRow, setStartRow] = useState('2')

  const handleApply = () => {
    onApply(startColumn, endColumn, startRow)
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-1">
              Mapeamento Automático
            </h4>
            <p className="text-sm text-primary-700 dark:text-primary-300 mb-3">
              Defina o intervalo de colunas e a linha de início dos dados. O sistema mapeará
              automaticamente na ordem: Código, Descrição, Dimensões, Cubagem, Peso, NCM e até 3
              Preços.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Coluna Inicial
          </label>
          <Input
            type="text"
            placeholder="Ex: A ou 0"
            value={startColumn}
            onChange={(e) => setStartColumn(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Primeira coluna dos dados</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coluna Final</label>
          <Input
            type="text"
            placeholder="Ex: H ou 7"
            value={endColumn}
            onChange={(e) => setEndColumn(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Última coluna dos dados</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Linha Inicial
          </label>
          <Input
            type="text"
            placeholder="Ex: 2"
            value={startRow}
            onChange={(e) => setStartRow(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Linha onde começam os dados</p>
        </div>
      </div>

      <Button onClick={handleApply} className="w-full">
        <Zap className="h-4 w-4 mr-2" />
        Aplicar Mapeamento Automático
      </Button>
    </div>
  )
}
