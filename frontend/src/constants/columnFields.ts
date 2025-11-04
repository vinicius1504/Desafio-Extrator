/**
 * Definição dos campos de coluna disponíveis para mapeamento
 */
export interface ColumnFieldDefinition {
  key: string
  label: string
  required?: boolean
  placeholder?: string
  helpText?: string
}

/**
 * Campos básicos de produto/variante
 */
export const BASIC_COLUMN_FIELDS: ColumnFieldDefinition[] = [
  {
    key: 'code',
    label: 'Código',
    required: true,
    placeholder: 'Ex: A, B, 1, 2',
    helpText: 'Código único do produto (obrigatório)',
  },
  {
    key: 'description',
    label: 'Descrição',
    placeholder: 'Ex: C',
    helpText: 'Descrição do produto',
  },
  {
    key: 'dimensions',
    label: 'Dimensões',
    placeholder: 'Ex: D',
    helpText: 'Dimensões do produto (ex: 10x20x30)',
  },
  {
    key: 'weight',
    label: 'Peso',
    placeholder: 'Ex: E',
    helpText: 'Peso do produto em kg',
  },
  {
    key: 'cubic',
    label: 'Cubagem',
    placeholder: 'Ex: F',
    helpText: 'Cubagem do produto em m³',
  },
  {
    key: 'ncm',
    label: 'NCM',
    placeholder: 'Ex: G',
    helpText: 'Código NCM (Nomenclatura Comum do Mercosul)',
  },
] as const

/**
 * Opções para o campo de agrupamento
 */
export const GROUPING_OPTIONS = [
  { value: 'code', label: 'Agrupar por Código' },
  { value: 'description', label: 'Agrupar por Descrição' },
  { value: 'none', label: 'Não agrupar (cada linha é um produto)' },
] as const

/**
 * Mapeamento de chaves para labels amigáveis
 */
export const COLUMN_FIELD_LABELS: Record<string, string> = {
  code: 'Código',
  description: 'Descrição',
  dimensions: 'Dimensões',
  weight: 'Peso',
  cubic: 'Cubagem',
  ncm: 'NCM',
} as const
