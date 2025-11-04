/**
 * Formatos de exportação disponíveis
 */
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  XML: 'xml',
} as const

export type ExportFormatType = typeof EXPORT_FORMATS[keyof typeof EXPORT_FORMATS]

/**
 * Metadados dos formatos de exportação
 */
export const EXPORT_FORMAT_METADATA = {
  json: {
    label: 'JSON',
    description: 'Formato estruturado ideal para APIs',
    extension: '.json',
    mimeType: 'application/json',
    icon: 'FileJson',
    color: 'blue',
  },
  csv: {
    label: 'CSV',
    description: 'Formato tabular para Excel e planilhas',
    extension: '.csv',
    mimeType: 'text/csv',
    icon: 'FileText',
    color: 'green',
  },
  xml: {
    label: 'XML',
    description: 'Formato estruturado para integrações',
    extension: '.xml',
    mimeType: 'application/xml',
    icon: 'FileCode',
    color: 'orange',
  },
} as const
