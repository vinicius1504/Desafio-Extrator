/**
 * Hook para gerenciar mapeamento de colunas
 */

import { useState } from 'react'
import type { ColumnMapping as ColumnMappingType } from '@/lib/utils/validators'
import { validateMapping, findDuplicateColumns } from '@/lib/utils'
import { parseColumnInput } from '@/lib/utils'

export interface PriceColumn {
  name: string
  column: number
}

export interface UseColumnMappingReturn {
  // Campos básicos
  codeColumn: number | null
  descriptionColumn: number | null
  dimensionsColumn: number | null
  weightColumn: number | null
  cubicColumn: number | null
  ncmColumn: number | null

  // Colunas de preço
  priceColumns: PriceColumn[]

  // Agrupamento
  groupBy: string

  // Setters
  setCodeColumn: (col: number | null) => void
  setDescriptionColumn: (col: number | null) => void
  setDimensionsColumn: (col: number | null) => void
  setWeightColumn: (col: number | null) => void
  setCubicColumn: (col: number | null) => void
  setNcmColumn: (col: number | null) => void
  setGroupBy: (value: string) => void

  // Price columns
  addPriceColumn: (name: string, column: number) => void
  removePriceColumn: (index: number) => void
  updatePriceColumn: (index: number, name: string, column: number) => void

  // Parsing
  parseAndSetColumn: (setter: (col: number | null) => void, input: string) => void

  // Validation
  isValid: boolean
  validationError: string | null
  duplicates: number[]
  validate: () => boolean

  // Utils
  getMapping: () => ColumnMappingType
  setMapping: (mapping: ColumnMappingType) => void
  reset: () => void
}

/**
 * Hook para gerenciar mapeamento de colunas
 */
export function useColumnMapping(): UseColumnMappingReturn {
  const [codeColumn, setCodeColumn] = useState<number | null>(null)
  const [descriptionColumn, setDescriptionColumn] = useState<number | null>(null)
  const [dimensionsColumn, setDimensionsColumn] = useState<number | null>(null)
  const [weightColumn, setWeightColumn] = useState<number | null>(null)
  const [cubicColumn, setCubicColumn] = useState<number | null>(null)
  const [ncmColumn, setNcmColumn] = useState<number | null>(null)
  const [groupBy, setGroupBy] = useState('code')
  const [priceColumns, setPriceColumns] = useState<PriceColumn[]>([])

  const addPriceColumn = (name: string, column: number) => {
    setPriceColumns(prev => [...prev, { name, column }])
  }

  const removePriceColumn = (index: number) => {
    setPriceColumns(prev => prev.filter((_, i) => i !== index))
  }

  const updatePriceColumn = (index: number, name: string, column: number) => {
    setPriceColumns(prev => prev.map((col, i) => (i === index ? { name, column } : col)))
  }

  const parseAndSetColumn = (setter: (col: number | null) => void, input: string) => {
    const parsed = parseColumnInput(input)
    setter(parsed)
  }

  const getMapping = (): ColumnMappingType => ({
    code: codeColumn,
    description: descriptionColumn,
    dimensions: dimensionsColumn,
    weight: weightColumn,
    cubic: cubicColumn,
    ncm: ncmColumn,
    priceColumns,
    groupBy,
  })

  const setMapping = (mapping: ColumnMappingType) => {
    setCodeColumn(mapping.code ?? null)
    setDescriptionColumn(mapping.description ?? null)
    setDimensionsColumn(mapping.dimensions ?? null)
    setWeightColumn(mapping.weight ?? null)
    setCubicColumn(mapping.cubic ?? null)
    setNcmColumn(mapping.ncm ?? null)
    setPriceColumns(mapping.priceColumns || [])
    setGroupBy(mapping.groupBy || 'code')
  }

  const reset = () => {
    setCodeColumn(null)
    setDescriptionColumn(null)
    setDimensionsColumn(null)
    setWeightColumn(null)
    setCubicColumn(null)
    setNcmColumn(null)
    setPriceColumns([])
    setGroupBy('code')
  }

  const mapping = getMapping()
  const validation = validateMapping(mapping)
  const duplicates = findDuplicateColumns(mapping)

  const validate = () => {
    return validation.valid && duplicates.length === 0
  }

  return {
    // Campos básicos
    codeColumn,
    descriptionColumn,
    dimensionsColumn,
    weightColumn,
    cubicColumn,
    ncmColumn,

    // Colunas de preço
    priceColumns,

    // Agrupamento
    groupBy,

    // Setters
    setCodeColumn,
    setDescriptionColumn,
    setDimensionsColumn,
    setWeightColumn,
    setCubicColumn,
    setNcmColumn,
    setGroupBy,

    // Price columns
    addPriceColumn,
    removePriceColumn,
    updatePriceColumn,

    // Parsing
    parseAndSetColumn,

    // Validation
    isValid: validation.valid && duplicates.length === 0,
    validationError: validation.error || null,
    duplicates,
    validate,

    // Utils
    getMapping,
    setMapping,
    reset,
  }
}
