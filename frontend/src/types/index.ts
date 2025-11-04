// Spreadsheet types
export interface SpreadsheetUpload {
  id: number
  file: string
  uploaded_at: string
  original_filename: string
  total_rows: number
  total_columns: number
}

export interface PreviewRow {
  row_number: number
  data: any[]
}

export interface SpreadsheetPreview {
  headers: string[]
  rows: PreviewRow[]
  start_row: number
  end_row: number
  total_rows: number
  total_columns: number
  original_columns?: number
  empty_columns_removed?: boolean
  column_mapping?: Record<string, number>
  has_mapping?: boolean
}

// Column Mapping types
export interface PriceColumn {
  index: number
  name: string
}

export interface MappingData {
  upload: number
  code_column?: number | null
  description_column?: number | null
  dimensions_column?: number | null
  cubic_column?: number | null
  weight_column?: number | null
  ncm_column?: number | null
  price_columns: PriceColumn[]
  data_start_row: number
}

export interface ColumnMapping extends MappingData {
  id: number
  created_at: string
}

// Product types
export interface ProductVariant {
  id: number
  code: string
  dimensions?: string | null
  cubic?: number | null
  weight?: number | null
  ncm?: string | null
  prices: Record<string, number>
  raw_data: Record<string, any>
  row_number: number
  created_at: string
}

export interface Product {
  id: number
  description?: string | null
  variants: ProductVariant[]
  created_at: string
}

export type ExportFormat = 'json' | 'csv' | 'xml'
