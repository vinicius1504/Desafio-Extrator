/**
 * Lista de histórico de exportações - Design Minimalista
 */

import { useState, useEffect } from 'react'
import { exportHistoryAPI, type ExportHistory } from '@/lib/api'
import { Alert } from '@/components/ui/Alert'
import { Eye, Package, FileText, Building2, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface ExportHistoryListProps {
  onViewCatalog: (uploadId: number, companyName?: string | null) => void
}

export function ExportHistoryList({ onViewCatalog }: ExportHistoryListProps) {
  const [history, setHistory] = useState<ExportHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await exportHistoryAPI.getExportHistory()
      setHistory(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histórico')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert type="error" className="mb-6">
        {error}
      </Alert>
    )
  }

  if (history.length === 0) {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-8 text-center">
        <Package className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-light text-gray-900 dark:text-gray-100 mb-2">
          Nenhuma exportação ainda
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
          Quando você processar planilhas, elas aparecerão aqui
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Info da exportação */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-sm">
                    <FileText className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <h3 className="text-base font-light text-gray-900 dark:text-gray-100">
                      {item.upload.filename}
                    </h3>
                    {item.company_name && (
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-light">
                          {item.company_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm font-light text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>{item.products_count} produtos</span>
                  </div>
                  {item.variants_count > 0 && (
                    <div className="flex items-center gap-2">
                      <span>•</span>
                      <span>{item.variants_count} variantes</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(item.exported_at), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>

              {/* Botão de visualizar */}
              <button
                onClick={() => onViewCatalog(item.upload.id, item.company_name)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-sm text-sm font-light text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title="Visualizar catálogo"
              >
                <Eye className="h-4 w-4" />
                <span>Visualizar</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
