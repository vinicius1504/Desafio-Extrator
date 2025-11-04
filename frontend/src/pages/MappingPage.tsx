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
import { ColumnSelector, PriceColumnList, SpreadsheetPreview } from '@/components/features/mapping'
import { BASIC_COLUMN_FIELDS, GROUPING_OPTIONS } from '@/constants'

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
    groupBy,
    setCodeColumn,
    setDescriptionColumn,
    setDimensionsColumn,
    setWeightColumn,
    setCubicColumn,
    setNcmColumn,
    setGroupBy,
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
          const priceColumnsConverted = (mapping.price_columns || []).map((pc: any) => ({
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
            groupBy: 'code',
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
      const priceColumnsBackend = priceColumns.map(pc => ({
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
      const priceColumnsBackend = priceColumns.map(pc => ({
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

  if (loadingPreview) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapeamento de Colunas</h1>
        <p className="text-gray-600">
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

          <Card>
            <CardHeader>
              <CardTitle>Agrupamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                options={GROUPING_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
              />
              <p className="mt-2 text-xs text-gray-500">
                Define como os produtos serão agrupados
              </p>
            </CardContent>
          </Card>

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

        {/* Preview */}
        <div>
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
        </div>
      </div>
    </div>
  )
}
