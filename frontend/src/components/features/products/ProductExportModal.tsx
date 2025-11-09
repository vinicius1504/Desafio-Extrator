/**
 * Modal de exportação de produtos
 */

import { Modal } from '@/components/ui'
import { FileJson, FileText, FileCode } from 'lucide-react'
import type { ExportFormat } from '@/types'

export interface ProductExportModalProps {
  isOpen: boolean
  isExporting: boolean
  onClose: () => void
  onExport: (format: ExportFormat) => void
}

export function ProductExportModal({
  isOpen,
  isExporting,
  onClose,
  onExport,
}: ProductExportModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exportar Produtos">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400 font-light">Selecione o formato para exportação:</p>

        <div className="space-y-3">
          <button
            onClick={() => onExport('json')}
            disabled={isExporting}
            className="w-full flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <FileJson className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">JSON</h4>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">Formato estruturado ideal para APIs</p>
            </div>
          </button>

          <button
            onClick={() => onExport('csv')}
            disabled={isExporting}
            className="w-full flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">CSV</h4>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">Formato tabular para Excel e planilhas</p>
            </div>
          </button>

          <button
            onClick={() => onExport('xml')}
            disabled={isExporting}
            className="w-full flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <FileCode className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">XML</h4>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">Formato estruturado para integrações</p>
            </div>
          </button>
        </div>

        {isExporting && <p className="text-center text-sm font-light text-gray-500 dark:text-gray-400">Gerando arquivo...</p>}
      </div>
    </Modal>
  )
}
