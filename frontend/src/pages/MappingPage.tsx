/**
 * Página de mapeamento 100% DINÂMICO - Design Minimalista
 * Gemini AI detecta TODAS as colunas automaticamente
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Alert } from '@/components/ui'
import { Save, ArrowRight, Sparkles, Loader2, Trash2 } from 'lucide-react'
import { spreadsheetAPI, columnMappingAPI } from '@/lib/api'

interface DynamicField {
  index: number
  name: string
  type: string
  confidence: number
}

export function MappingPage() {
  const { uploadId } = useParams<{ uploadId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  // Campos dinâmicos detectados pela IA
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([])
  const [dataStartRow, setDataStartRow] = useState(1)
  const [analysisMethod, setAnalysisMethod] = useState<string>('')

  // Preview da planilha
  const [preview, setPreview] = useState<any>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Abas da planilha
  const [sheets, setSheets] = useState<Array<{index: number, name: string, rows: number}>>([])
  const [selectedSheet, setSelectedSheet] = useState<number>(0)
  const [hasMultipleSheets, setHasMultipleSheets] = useState(false)

  // Carregar abas disponíveis
  useEffect(() => {
    if (!uploadId) return

    const loadSheets = async () => {
      try {
        const data = await spreadsheetAPI.getSheets(Number(uploadId))
        if (data.sheets && data.sheets.length > 1) {
          setSheets(data.sheets)
          setHasMultipleSheets(true)
        }
      } catch (err: any) {
        console.error('Erro ao carregar abas:', err)
      }
    }

    loadSheets()
  }, [uploadId])

  // Carregar preview (atualiza quando aba é alterada)
  useEffect(() => {
    if (!uploadId) return

    const loadPreview = async () => {
      setLoadingPreview(true)
      try {
        const data = await spreadsheetAPI.getPreview(Number(uploadId), selectedSheet)
        setPreview(data)
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar preview')
      } finally {
        setLoadingPreview(false)
      }
    }

    loadPreview()
  }, [uploadId, selectedSheet])

  // Sugerir mapeamento automático com IA
  const handleAISuggestion = async () => {
    if (!uploadId) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await spreadsheetAPI.suggestMapping(Number(uploadId), selectedSheet)

      if (result.dynamic_fields && result.dynamic_fields.length > 0) {
        setDynamicFields(result.dynamic_fields)
        setDataStartRow(result.data_start_row || 1)
        setAnalysisMethod(result.analysis_method || 'gemini_ai')

        setSuccess(
          `IA detectou ${result.dynamic_fields.length} campos automaticamente`
        )
      } else {
        setError('Nenhum campo foi detectado pela IA')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao analisar planilha com IA')
    } finally {
      setLoading(false)
    }
  }

  // Salvar mapeamento
  const handleSaveMapping = async () => {
    if (!uploadId || dynamicFields.length === 0) {
      setError('Execute a análise com IA primeiro')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const mappingData = {
        upload: Number(uploadId),
        data_start_row: dataStartRow,
        dynamic_fields: dynamicFields,
        sheet_index: selectedSheet
      }

      await columnMappingAPI.createOrUpdate(mappingData)
      setSuccess('Mapeamento salvo com sucesso!')

      setTimeout(() => {
        handleProcess()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar mapeamento')
      setLoading(false)
    }
  }

  // Processar planilha
  const handleProcess = async () => {
    if (!uploadId) return

    setProcessing(true)
    setError(null)

    try {
      await spreadsheetAPI.process(Number(uploadId))
      setSuccess('Processamento concluído! Redirecionando...')

      setTimeout(() => {
        navigate(`/products/${uploadId}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao processar planilha')
      setProcessing(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-gray-900 dark:text-gray-100'
    if (confidence >= 0.6) return 'text-gray-700 dark:text-gray-300'
    return 'text-gray-600 dark:text-gray-400'
  }

  const handleDeleteField = (fieldIndex: number) => {
    setDynamicFields(dynamicFields.filter(field => field.index !== fieldIndex))
    setSuccess('Campo removido com sucesso')
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className="min-h-[calc(100vh-200px)] space-y-8">
      {/* Header */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-gray-100">
              Análise <span className="font-semibold">Inteligente</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto">
              A IA identifica automaticamente todas as colunas da sua planilha
            </p>
          </div>

          {/* Alertas */}
          {error && (
            <Alert type="error" closable onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
              <p className="text-center text-gray-900 dark:text-gray-100 font-light">{success}</p>
            </div>
          )}
        </div>
      </section>

      {/* Barra de Ações: Seletor de Abas + Botão Analisar */}
      {dynamicFields.length === 0 && (
        <section className="pb-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            {/* Seletor de Abas (Dropdown) */}
            {hasMultipleSheets ? (
              <div className="relative">
                <select
                  value={selectedSheet}
                  onChange={(e) => {
                    setSelectedSheet(Number(e.target.value))
                    setDynamicFields([])
                  }}
                  className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm px-4 py-3 pr-10 font-light text-gray-900 dark:text-gray-100 focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 transition-colors"
                >
                  {sheets.map((sheet) => (
                    <option key={sheet.index} value={sheet.index}>
                      {sheet.name} ({sheet.rows} linhas)
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 dark:text-gray-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            ) : (
              <div></div>
            )}

            {/* Botão de Análise com IA */}
            <Button
              onClick={handleAISuggestion}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-12 px-8 rounded-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analisar com IA
                </>
              )}
            </Button>
          </div>
        </section>
      )}

      {/* Campos Detectados */}
      {dynamicFields.length > 0 && (
        <section className="pb-16">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">
                Campos Detectados ({dynamicFields.length})
              </h2>
              <span className="text-sm font-light text-gray-600 dark:text-gray-400">
                {analysisMethod === 'gemini_ai' ? 'Gemini AI' : 'Tradicional'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dynamicFields.map((field) => (
                <div
                  key={field.index}
                  className="group relative p-6 border border-gray-200 dark:border-gray-800 rounded-sm hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      Col {field.index}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${getConfidenceColor(field.confidence)}`}>
                        {Math.round(field.confidence * 100)}%
                      </span>
                      <button
                        onClick={() => handleDeleteField(field.index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm"
                        title="Remover campo"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-light text-lg text-gray-900 dark:text-gray-100 mb-1">
                    {field.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                    {field.type}
                  </p>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="pt-8 flex items-center justify-between">
              <Button
                onClick={handleAISuggestion}
                disabled={loading || processing}
                className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analisar Novamente
              </Button>

              <Button
                onClick={handleSaveMapping}
                disabled={loading || processing}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-12 px-8 rounded-sm"
              >
                {loading || processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {processing ? 'Processando...' : 'Salvando...'}
                  </>
                ) : (
                  <>
                    Salvar e Processar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Preview da Planilha */}
      {(preview || loadingPreview) && (
        <section className="pb-16">
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">
              Preview
            </h2>
            <div className="border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
              {loadingPreview ? (
                // Skeleton Loading
                <div className="animate-pulse overflow-auto max-h-[400px]">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                      <tr>
                        {[...Array(5)].map((_, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-3 text-left text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap"
                          >
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {[...Array(5)].map((_, rowIdx) => (
                        <tr key={rowIdx}>
                          {[...Array(5)].map((_, cellIdx) => (
                            <td key={cellIdx} className="px-4 py-3 whitespace-nowrap">
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Preview Real - Headers + Sample Data
                <div className="overflow-auto max-h-[400px]">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                      <tr>
                        {preview.headers?.map((header: string, idx: number) => (
                          <th
                            key={idx}
                            className="px-4 py-3 text-left text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap"
                          >
                            {header || `Col ${idx}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {preview.rows?.slice(0, 10).map((row: any, rowIdx: number) => (
                        <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          {row.data?.map((cell: any, cellIdx: number) => (
                            <td key={cellIdx} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-light whitespace-nowrap">
                              {cell !== null && cell !== undefined ? String(cell) : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
