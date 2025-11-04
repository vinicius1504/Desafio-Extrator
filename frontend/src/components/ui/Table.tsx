import { ReactNode } from 'react'

export interface TableColumn<T = any> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T, index: number) => ReactNode
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor?: (row: T, index: number) => string | number
  emptyMessage?: string
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  compact?: boolean
}

export function Table<T = any>({
  columns,
  data,
  keyExtractor = (_, index) => index,
  emptyMessage = 'Nenhum dado disponível',
  striped = true,
  hoverable = true,
  bordered = false,
  compact = false,
}: TableProps<T>) {
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  const getCellValue = (column: TableColumn<T>, row: T, index: number) => {
    const value = (row as any)[column.key]
    return column.render ? column.render(value, row, index) : value
  }

  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${bordered ? 'border border-gray-200' : ''}`}>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  ${compact ? 'px-3 py-2' : 'px-6 py-3'}
                  text-xs font-medium text-gray-700 uppercase tracking-wider
                  ${getAlignClass(column.align)}
                  ${bordered ? 'border-r border-gray-200 last:border-r-0' : ''}
                `}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                className={`
                  ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                  ${hoverable ? 'hover:bg-gray-100 transition-colors' : ''}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      ${compact ? 'px-3 py-2' : 'px-6 py-4'}
                      text-sm text-gray-900
                      ${getAlignClass(column.align)}
                      ${bordered ? 'border-r border-gray-200 last:border-r-0' : ''}
                    `}
                  >
                    {getCellValue(column, row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
