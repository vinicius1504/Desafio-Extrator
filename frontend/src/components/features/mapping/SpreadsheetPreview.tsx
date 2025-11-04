/**
 * Preview da planilha
 */

import { Table } from '@/components/ui'
import type { SpreadsheetPreview } from '@/types'
import { columnNumberToLetter } from '@/lib/utils'

export interface SpreadsheetPreviewProps {
  preview: SpreadsheetPreview
}

export function SpreadsheetPreview({ preview }: SpreadsheetPreviewProps) {
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
    width: '120px',
    render: (value: any) => value || '-',
  }))

  // Converter PreviewRow[] em data[][] para a Table
  const tableData = preview.rows.map(row => row.data)

  return (
    <div>
      <div className="mb-2 text-sm text-gray-600">
        Mostrando {preview.rows.length} de {preview.total_rows} linhas
      </div>
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          data={tableData}
          keyExtractor={(_: any, index: number) => index.toString()}
          compact
        />
      </div>
    </div>
  )
}
