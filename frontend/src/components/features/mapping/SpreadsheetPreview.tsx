/**
 * Preview da planilha
 */

import { useState, useEffect } from 'react'
import { Table, Button } from '@/components/ui'
import type { SpreadsheetPreview } from '@/types'
import { columnNumberToLetter } from '@/lib/utils'
import { Maximize2, X } from 'lucide-react'

export interface SpreadsheetPreviewProps {
  preview: SpreadsheetPreview
}

export function SpreadsheetPreview({ preview }: SpreadsheetPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fechar com tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll no body quando em fullscreen
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  if (!preview.rows || preview.rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum dado para visualizar
      </div>
    )
  }

  // Gerar colunas dinamicamente baseado na primeira linha
  const firstRowData = preview.rows[0]?.data || []
  const columns = firstRowData.map((_: any, index: number) => ({
    key: index.toString(),
    header: columnNumberToLetter(index),
    width: '80px',
    render: (value: any) => value || '-',
  }))

  // Converter PreviewRow[] em data[][] para a Table
  const tableData = preview.rows.map(row => row.data)

  const PreviewContent = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {preview.rows.length} de {preview.total_rows} linhas
        </div>
        {!isFullscreen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            Expandir
          </Button>
        )}
      </div>
      <div
        className={`overflow-x-auto overflow-y-auto border border-gray-200 dark:border-gray-700 rounded ${
          isFullscreen ? 'h-[calc(100vh-180px)]' : 'max-h-64'
        }`}
      >
        <Table
          columns={columns}
          data={tableData}
          keyExtractor={(_: any, index: number) => index.toString()}
          compact
        />
      </div>
    </>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-hidden flex flex-col animate-in fade-in duration-200">
        {/* Header em tela cheia */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4 shadow-lg">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Preview da Planilha - Visualização Completa</h2>
              <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">
                Pressione ESC para fechar
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFullscreen(false)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 flex items-center gap-2 h-11 px-5 font-semibold transition-all hover:scale-105"
            >
              <X className="h-5 w-5" />
              Fechar
            </Button>
          </div>
        </div>

        {/* Conteúdo em tela cheia */}
        <div className="flex-1 overflow-hidden p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-[1800px] mx-auto h-full">
            <PreviewContent />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PreviewContent />
    </div>
  )
}
