/**
 * Página de mapeamento de colunas - REFATORADA
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button, Alert, Select } from '@/components/ui'
import { Save, ArrowRight } from 'lucide-react'
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
        console.log('Nenhum mapeamento existente encontrado')
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mapeamento de Colunas</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure quais colunas da planilha correspondem a cada campo do produto
        </p>
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

      {/* Preview no topo */}
      <Card>
        <CardHeader>
          <CardTitle>Preview da Planilha</CardTitle>
        </CardHeader>
        <CardContent>
          {preview ? (
            <SpreadsheetPreview preview={preview} />
          ) : (
            <div className="text-center py-8 text-gray-500">Nenhum preview disponível</div>
          )}
        </CardContent>
      </Card>

      {/* Auto Mapping Form */}
      <Card>
        <CardHeader>
          <CardTitle>Mapeamento Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoMappingForm onApply={handleAutoMapping} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapping Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campos Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        {/* Price Columns */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Colunas de Preço</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleSaveMapping} disabled={saving || !isValid}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Mapeamento'}
        </Button>

        <Button
          onClick={handleProcessAndContinue}
          disabled={processing || !isValid}
          className="flex-1"
        >
          {processing ? 'Processando...' : 'Processar e Continuar'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
