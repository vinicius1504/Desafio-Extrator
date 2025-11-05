/**
 * Página de mapeamento de colunas - REFATORADA
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button, Alert, Select } from '@/components/ui'
import { Save, ArrowRight, Sparkles, FileSpreadsheet, Zap, Grid, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import { useSpreadsheetStore } from '@/store/spreadsheetStore'
import { spreadsheetAPI, columnMappingAPI } from '@/lib/api'
import { useColumnMapping, usePreview } from '@/hooks'
import { ColumnSelector, PriceColumnList, SpreadsheetPreview, AutoMappingForm } from '@/components/features/mapping'
import { BASIC_COLUMN_FIELDS } from '@/constants'
import { parseColumnInput } from '@/lib/utils'

export function MappingPage() {
  const { uploadId } = useParams<{ uploadId: string }>()
  const navigate = useNavigate()
  const { error: storeError } = useSpreadsheetStore()

  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Hooks customizados
  const {
    preview,
    loading: loadingPreview,
    error: previewError,
  } = usePreview(uploadId ? Number(uploadId) : undefined)

  const {
    codeColumn,
    descriptionColumn,
    dimensionsColumn,
    weightColumn,
    cubicColumn,
    ncmColumn,
    priceColumns,
    setCodeColumn,
    setDescriptionColumn,
    setDimensionsColumn,
    setWeightColumn,
    setCubicColumn,
    setNcmColumn,
    addPriceColumn,
    removePriceColumn,
    updatePriceColumn,
    parseAndSetColumn,
    isValid,
    validationError,
    duplicates,
    setMapping,
  } = useColumnMapping()

  const error = localError || previewError || storeError

  // Carregar mapeamento existente se houver
  useEffect(() => {
    if (!uploadId) return

    const loadExistingMapping = async () => {
      try {
        const mapping = await columnMappingAPI.getMappingByUpload(Number(uploadId))
        if (mapping) {
          // Converter price_columns do backend (index, name) para o formato do hook (name, column)
          // LIMITAR A 3 COLUNAS DE PREÇO
          const priceColumnsConverted = (mapping.price_columns || [])
            .slice(0, 3)
            .map((pc: any) => ({
              name: pc.name,
              column: pc.index,
            }))

          setMapping({
            code: mapping.code_column ?? null,
            description: mapping.description_column ?? null,
            dimensions: mapping.dimensions_column ?? null,
            weight: mapping.weight_column ?? null,
            cubic: mapping.cubic_column ?? null,
            ncm: mapping.ncm_column ?? null,
            priceColumns: priceColumnsConverted,
          })
        }
      } catch (err) {
        // Sem mapeamento existente, tudo bem
      }
    }

    loadExistingMapping()
  }, [uploadId])

  const handleSaveMapping = async () => {
    if (!uploadId) return

    if (!isValid) {
      setLocalError(validationError || 'Mapeamento inválido')
      return
    }

    if (duplicates.length > 0) {
      setLocalError('Há colunas duplicadas no mapeamento')
      return
    }

    try {
      setSaving(true)
      setLocalError(null)

      // Converter price_columns para o formato do backend (index, name)
      // LIMITAR A 3 COLUNAS DE PREÇO
      const priceColumnsBackend = priceColumns.slice(0, 3).map(pc => ({
        index: pc.column,
        name: pc.name,
      }))

      const mappingData = {
        upload: Number(uploadId),
        code_column: codeColumn,
        description_column: descriptionColumn,
        dimensions_column: dimensionsColumn,
        weight_column: weightColumn,
        cubic_column: cubicColumn,
        ncm_column: ncmColumn,
        price_columns: priceColumnsBackend,
        data_start_row: 1,
      }

      await columnMappingAPI.createMapping(mappingData)

      // Navegar para próxima etapa
      navigate(`/products/${uploadId}`)
    } catch (err) {
      console.error('Erro ao salvar mapeamento:', err)
      setLocalError(err instanceof Error ? err.message : 'Erro ao salvar mapeamento')
    } finally {
      setSaving(false)
    }
  }

  const handleProcessAndContinue = async () => {
    if (!uploadId) return

    // Primeiro salvar o mapeamento
    if (!isValid) {
      setLocalError(validationError || 'Mapeamento inválido')
      return
    }

    try {
      setProcessing(true)
      setLocalError(null)

      // Converter price_columns para o formato do backend (index, name)
      // LIMITAR A 3 COLUNAS DE PREÇO
      const priceColumnsBackend = priceColumns.slice(0, 3).map(pc => ({
        index: pc.column,
        name: pc.name,
      }))

      // 1. Salvar mapeamento
      const mappingData = {
        upload: Number(uploadId),
        code_column: codeColumn,
        description_column: descriptionColumn,
        dimensions_column: dimensionsColumn,
        weight_column: weightColumn,
        cubic_column: cubicColumn,
        ncm_column: ncmColumn,
        price_columns: priceColumnsBackend,
        data_start_row: 1,
      }

      await columnMappingAPI.createMapping(mappingData)

      // 2. Processar planilha
      await spreadsheetAPI.processSpreadsheet(Number(uploadId))

      // 3. Navegar para produtos
      navigate(`/products/${uploadId}`)
    } catch (err) {
      console.error('Erro ao processar:', err)
      setLocalError(err instanceof Error ? err.message : 'Erro ao processar planilha')
    } finally {
      setProcessing(false)
    }
  }

  const handleAutoMapping = (startCol: string, endCol: string, startRow: string) => {
    const startRowNum = parseInt(startRow, 10)

    // Validate row
    if (isNaN(startRowNum) || startRowNum < 1) {
      setLocalError('Por favor, insira uma linha inicial válida (mínimo 1)')
      return
    }

    // Parse start and end columns
    const startColIndex = parseColumnInput(startCol.trim())
    const endColIndex = parseColumnInput(endCol.trim())

    if (startColIndex === null || endColIndex === null) {
      setLocalError('Por favor, insira colunas válidas (ex: A, B, C ou 0, 1, 2)')
      return
    }

    if (startColIndex > endColIndex) {
      setLocalError('A coluna inicial deve ser menor ou igual à coluna final')
      return
    }

    // Build array of column indices from start to end
    const columns: number[] = []
    for (let i = startColIndex; i <= endColIndex; i++) {
      columns.push(i)
    }

    // Map columns in order: Code, Description, Dimensions, Cubic, Weight, NCM
    // Then remaining columns as prices (max 3)
    let idx = 0
    const newMapping: any = {
      code: idx < columns.length ? columns[idx++] : null,
      description: idx < columns.length ? columns[idx++] : null,
      dimensions: idx < columns.length ? columns[idx++] : null,
      cubic: idx < columns.length ? columns[idx++] : null,
      weight: idx < columns.length ? columns[idx++] : null,
      ncm: idx < columns.length ? columns[idx++] : null,
      priceColumns: [],
    }

    // Code column is required
    if (newMapping.code === null) {
      setLocalError('É necessário pelo menos uma coluna para o código')
      return
    }

    // Add price columns from remaining columns (máximo 3)
    let priceIdx = 1
    while (idx < columns.length && priceIdx <= 3) {
      newMapping.priceColumns.push({
        name: `Preço ${priceIdx}`,
        column: columns[idx],
      })
      idx++
      priceIdx++
    }

    // Apply the new mapping
    setMapping(newMapping)
    setLocalError(null)
  }

  if (loadingPreview) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Carregando preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header com botão de ação */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="text-center lg:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Configuração Inteligente</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Mapeamento de Colunas</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Configure quais colunas da planilha correspondem a cada campo do produto
          </p>
        </div>

        {/* Botão de Processar - Posição de destaque */}
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleSaveMapping}
            disabled={saving || !isValid}
            className="h-12 px-6 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>

          <Button
            onClick={handleProcessAndContinue}
            disabled={processing || !isValid}
            className="h-12 px-8 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            {processing ? 'Processando...' : 'Processar e Continuar'}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Erro" closable onClose={() => setLocalError(null)}>
          {error}
        </Alert>
      )}

      {/* Validation Errors */}
      {!isValid && validationError && (
        <Alert type="warning" title="Atenção">
          {validationError}
        </Alert>
      )}

      {duplicates.length > 0 && (
        <Alert type="warning" title="Atenção">
          Há colunas duplicadas no mapeamento. Cada coluna deve ser usada apenas uma vez.
        </Alert>
      )}

      {/* Preview e Mapeamento Rápido lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Preview da Planilha
            </h2>
          </div>
          <div className="p-6">
            {preview ? (
              <SpreadsheetPreview preview={preview} />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum preview disponível</div>
            )}
          </div>
        </div>

        {/* Auto Mapping Form */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-lg border border-amber-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              Mapeamento Rápido
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure automaticamente todas as colunas de uma vez
            </p>
          </div>
          <div className="p-6">
            <AutoMappingForm onApply={handleAutoMapping} />
          </div>
        </div>
      </div>

      {/* Toggle Detalhes Avançados */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Grid className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Mapeamento de Campos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure código, descrição e campos adicionais
              </p>
            </div>
          </div>
          {showAdvanced ? (
            <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="p-6 space-y-4">
              {BASIC_COLUMN_FIELDS.map((field) => (
                <ColumnSelector
                  key={field.key}
                  label={field.label}
                  value={
                    field.key === 'code'
                      ? codeColumn
                      : field.key === 'description'
                      ? descriptionColumn
                      : field.key === 'dimensions'
                      ? dimensionsColumn
                      : field.key === 'weight'
                      ? weightColumn
                      : field.key === 'cubic'
                      ? cubicColumn
                      : ncmColumn
                  }
                  onInputChange={(input) => {
                    if (field.key === 'code') parseAndSetColumn(setCodeColumn, input)
                    else if (field.key === 'description')
                      parseAndSetColumn(setDescriptionColumn, input)
                    else if (field.key === 'dimensions')
                      parseAndSetColumn(setDimensionsColumn, input)
                    else if (field.key === 'weight') parseAndSetColumn(setWeightColumn, input)
                    else if (field.key === 'cubic') parseAndSetColumn(setCubicColumn, input)
                    else parseAndSetColumn(setNcmColumn, input)
                  }}
                  required={field.required}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Columns */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Colunas de Preço
          </h2>
          <p className="text-sm text-green-100 dark:text-green-200 mt-1">
            Adicione até 3 colunas de preço diferentes
          </p>
        </div>
        <div className="p-6">
          <PriceColumnList
            priceColumns={priceColumns}
            onAdd={() => addPriceColumn('', 0)}
            onRemove={removePriceColumn}
            onUpdateName={(index, name) =>
              updatePriceColumn(index, name, priceColumns[index].column)
            }
            onUpdateColumn={(index, input) => {
              parseAndSetColumn((col) => {
                if (col !== null) {
                  updatePriceColumn(index, priceColumns[index].name, col)
                }
              }, input)
            }}
          />
        </div>
      </div>

    </div>
  )
}
