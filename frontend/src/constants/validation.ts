/**
 * Regras de validação para upload de arquivos
 */
export const FILE_VALIDATION = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_FORMATS: ['.xlsx', '.xls', '.csv', '.ods'],
  ACCEPTED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/vnd.oasis.opendocument.spreadsheet',
  ],
} as const

/**
 * Regras de validação para mapeamento de colunas
 */
export const COLUMN_VALIDATION = {
  MIN_COLUMN_INDEX: 0,
  MAX_COLUMN_INDEX: 702, // ZZ column (26*27 = 702)
  REQUIRED_FIELDS: ['code'] as const,
} as const

/**
 * Configurações de paginação
 */
export const PAGINATION = {
  INITIAL_LIMIT: 10,
  LOAD_MORE_INCREMENT: 10,
} as const

/**
 * Mensagens de erro padrão
 */
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo: 10MB',
  INVALID_FILE_FORMAT: 'Formato de arquivo inválido. Formatos aceitos: .xlsx, .xls, .csv, .ods',
  UPLOAD_FAILED: 'Erro ao fazer upload do arquivo',
  MAPPING_REQUIRED: 'É necessário mapear pelo menos o campo Código',
  INVALID_COLUMN_INDEX: 'Índice de coluna inválido',
  LOAD_PRODUCTS_FAILED: 'Erro ao carregar produtos',
  EXPORT_FAILED: 'Erro ao exportar dados',
} as const
