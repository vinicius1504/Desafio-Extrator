import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button, Alert, Select, Input, Table } from '@/components/ui'
import { Save, Plus, Trash2, ArrowRight, Zap } from 'lucide-react'
import { useSpreadsheetStore } from '@/store/spreadsheetStore'
import { spreadsheetAPI, columnMappingAPI } from '@/lib/api'
import type { SpreadsheetPreview, MappingData, PriceColumn } from '@/types'

// Helper functions para converter letras de colunas (A, B, C) em números (0, 1, 2)
const columnLetterToNumber = (letter: string): number => {
  let num = 0
  for (let i = 0; i < letter.length; i++) {
    num = num * 26 + (letter.charCodeAt(i) - 64)
  }
  return num - 1 // Retorna índice baseado em 0
}

const columnNumberToLetter = (num: number): string => {
  let letter = ''
  let n = num + 1 // Converte de índice 0 para 1
  while (n > 0) {
    const mod = (n - 1) % 26
    letter = String.fromCharCode(65 + mod) + letter
    n = Math.floor((n - mod) / 26)
  }
  return letter
}

const parseColumnInput = (input: string): number | null => {
  const trimmed = input.trim().toUpperCase()
  if (!trimmed) return null

  // Se for número
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10)
  }

  // Se for letra (A, B, C, etc)
  if (/^[A-Z]+$/.test(trimmed)) {
    return columnLetterToNumber(trimmed)
  }

  return null
}

export function MappingPage() {
  const { uploadId } = useParams<{ uploadId: string }>()
  const navigate = useNavigate()
  const { setError, error } = useSpreadsheetStore()

  const [preview, setPreview] = useState<SpreadsheetPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modo automático vs manual
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [autoStartColumn, setAutoStartColumn] = useState('')
  const [autoEndColumn, setAutoEndColumn] = useState('')
  const [autoStartRow, setAutoStartRow] = useState('1')

  // Campos disponíveis para mapeamento automático
  type FieldOption = {
    key: string
    label: string
    enabled: boolean
    required?: boolean
  }

  const [autoFields, setAutoFields] = useState<FieldOption[]>([
    { key: 'code', label: 'Código', enabled: true, required: true },
    { key: 'description', label: 'Descrição', enabled: true },
    { key: 'dimensions', label: 'Dimensões', enabled: true },
    { key: 'cubic', label: 'Cubagem', enabled: true },
    { key: 'weight', label: 'Peso', enabled: true },
    { key: 'ncm', label: 'NCM', enabled: true },
  ])

  // Mapping state
  const [codeColumn, setCodeColumn] = useState<number | null>(null)
  const [descriptionColumn, setDescriptionColumn] = useState<number | null>(null)
  const [dimensionsColumn, setDimensionsColumn] = useState<number | null>(null)
  const [cubicColumn, setCubicColumn] = useState<number | null>(null)
  const [weightColumn, setWeightColumn] = useState<number | null>(null)
  const [ncmColumn, setNcmColumn] = useState<number | null>(null)
  const [priceColumns, setPriceColumns] = useState<PriceColumn[]>([])
  const [dataStartRow, setDataStartRow] = useState(1) // Índice baseado em 0, mas exibido como 1 para o usuário

  useEffect(() => {
    if (!uploadId) return

    const loadPreview = async () => {
      try {
        setLoading(true)
        const data = await spreadsheetAPI.getPreview(Number(uploadId))
        setPreview(data)

        // Try to load existing mapping
        try {
          const mapping = await columnMappingAPI.getMappingByUpload(Number(uploadId))
          if (mapping) {
            setCodeColumn(mapping.code_column ?? null)
            setDescriptionColumn(mapping.description_column ?? null)
            setDimensionsColumn(mapping.dimensions_column ?? null)
            setCubicColumn(mapping.cubic_column ?? null)
            setWeightColumn(mapping.weight_column ?? null)
            setNcmColumn(mapping.ncm_column ?? null)
            setPriceColumns(mapping.price_columns || [])
            setDataStartRow(mapping.data_start_row || 2)
          }
        } catch {
          // No existing mapping, that's ok
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar preview')
      } finally {
        setLoading(false)
      }
    }

    loadPreview()
  }, [uploadId, setError])

  const columnOptions = preview?.headers?.map((header, index) => ({
    value: index,
    label: `Coluna ${index}: ${header || '(vazio)'}`,
  })) || []

  const addPriceColumn = () => {
    setPriceColumns([...priceColumns, { index: 0, name: `Preço ${priceColumns.length + 1}` }])
  }

  const removePriceColumn = (idx: number) => {
    setPriceColumns(priceColumns.filter((_, i) => i !== idx))
  }

  const updatePriceColumn = (idx: number, field: 'index' | 'name', value: number | string) => {
    const updated = [...priceColumns]
    if (field === 'index') {
      updated[idx].index = Number(value)
    } else {
      updated[idx].name = String(value)
    }
    setPriceColumns(updated)
  }

  const applyAutoMapping = () => {
    // Parse inputs
    const startCol = parseColumnInput(autoStartColumn)
    const endCol = parseColumnInput(autoEndColumn)
    const startRow = parseInt(autoStartRow, 10)

    // Validações
    if (startCol === null || endCol === null) {
      setError('Por favor, insira colunas válidas (ex: A ou 0, H ou 7)')
      return
    }

    if (isNaN(startRow) || startRow < 0) {
      setError('Por favor, insira uma linha inicial válida')
      return
    }

    if (startCol > endCol) {
      setError('A coluna inicial deve ser menor ou igual à coluna final')
      return
    }

    if (!preview || endCol >= preview.total_columns) {
      setError(`A coluna final não pode ser maior que ${preview?.total_columns ? preview.total_columns - 1 : 0}`)
      return
    }

    // Mapear colunas automaticamente na ordem
    const columns = []
    for (let i = startCol; i <= endCol; i++) {
      columns.push(i)
    }

    // Ordem padrão dos campos: Código, Descrição, Dimensões, Cubagem, Peso, NCM, Preços...
    let idx = 0

    if (idx < columns.length) {
      setCodeColumn(columns[idx++])
    }

    if (idx < columns.length) {
      setDescriptionColumn(columns[idx++])
    }

    if (idx < columns.length) {
      setDimensionsColumn(columns[idx++])
    }

    if (idx < columns.length) {
      setCubicColumn(columns[idx++])
    }

    if (idx < columns.length) {
      setWeightColumn(columns[idx++])
    }

    if (idx < columns.length) {
      setNcmColumn(columns[idx++])
    }

    // Restante vira colunas de preço
    const prices: PriceColumn[] = []
    while (idx < columns.length) {
      prices.push({
        index: columns[idx],
        name: `Preço ${prices.length + 1}`
      })
      idx++
    }
    setPriceColumns(prices)

    // Definir linha de início
    setDataStartRow(startRow)

    setError(null)
  }

  const handleSaveMapping = async () => {
    if (!uploadId) return

    // Validar campo obrigatório
    if (codeColumn === null) {
      setError('O campo "Coluna de Código" é obrigatório. Por favor, selecione uma coluna.')
      return
    }

    const mappingData: MappingData = {
      upload: Number(uploadId),
      code_column: codeColumn,
      description_column: descriptionColumn,
      dimensions_column: dimensionsColumn,
      cubic_column: cubicColumn,
      weight_column: weightColumn,
      ncm_column: ncmColumn,
      price_columns: priceColumns,
      data_start_row: dataStartRow,
    }

    console.log('=== INICIANDO SALVAMENTO ===')
    console.log('Upload ID:', uploadId)
    console.log('Dados do mapeamento:', mappingData)

    try {
      setSaving(true)
      setError(null)

      // 1. Salvar mapeamento
      console.log('1. Salvando mapeamento...')
      const savedMapping = await columnMappingAPI.createMapping(mappingData)
      console.log('✅ Mapeamento salvo:', savedMapping)

      // 2. Processar planilha
      console.log('2. Processando planilha...')
      const result = await spreadsheetAPI.processSpreadsheet(Number(uploadId))
      console.log('✅ Processamento concluído:', result)

      // 3. Verificar resultado
      if (result.warnings && result.warnings.length > 0) {
        console.warn('⚠️ Avisos durante processamento:', result.warnings)
      }

      if (result.statistics) {
        console.log('📊 Estatísticas:', result.statistics)

        if (result.statistics.products_created === 0) {
          setError(`Nenhum produto foi criado. Verifique se:
            - A coluna de Código está correta
            - A linha de início dos dados está configurada corretamente
            - A planilha contém dados válidos`)
          return
        }
      }

      // 4. Redirecionar para página de produtos
      console.log('4. Redirecionando para produtos...')
      navigate(`/products/${uploadId}`)
    } catch (err) {
      console.error('❌ Erro durante processamento:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar mapeamento e processar dados'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando preview...</p>
        </div>
      </div>
    )
  }

  if (!preview || !preview.headers || !preview.rows) {
    return (
      <div className="max-w-7xl mx-auto">
        <Alert type="error" title="Erro">
          Não foi possível carregar o preview da planilha
        </Alert>
      </div>
    )
  }

  const tableColumns = preview.headers.map((header, index) => ({
    key: String(index),
    header: `Col ${index}: ${header || '(vazio)'}`,
    width: '150px',
    render: (value: any) => (
      <div className="truncate max-w-[150px]" title={String(value || '')}>
        {value || '-'}
      </div>
    ),
  }))

  const tableData = preview.rows.map((row) => {
    const obj: any = {}
    row.data.forEach((cell, index) => {
      obj[String(index)] = cell
    })
    return obj
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapeamento de Colunas</h1>
        <p className="text-gray-600">
          Configure como as colunas da planilha devem ser interpretadas
        </p>
      </div>

      {error && (
        <Alert type="error" title="Erro" closable onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Preview da Planilha */}
      <Card>
        <CardHeader>
          <CardTitle>Preview da Planilha ({preview.total_rows} linhas × {preview.total_columns} colunas)</CardTitle>
        </CardHeader>
        <CardContent>
          {preview.empty_columns_removed && preview.original_columns && (
            <Alert type="info" title="Colunas vazias removidas" className="mb-4">
              {preview.original_columns - preview.total_columns} coluna(s) vazia(s) foi(ram) removida(s) do preview.
              A planilha original tem {preview.original_columns} colunas, mas apenas {preview.total_columns} contêm dados.
            </Alert>
          )}
          <div className="overflow-x-auto overflow-y-auto max-h-[450px] border rounded-lg">
            <Table
              columns={tableColumns}
              data={tableData}
              keyExtractor={(_, index) => index}
              compact
              bordered
            />
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Exibindo {preview.rows.length} linhas (linhas {preview.start_row + 1} a {preview.end_row + 1}) de {preview.total_rows} • Scroll vertical para ver todas
          </p>
        </CardContent>
      </Card>

      {/* Modo de Mapeamento */}
      <Card>
        <CardHeader>
          <CardTitle>Modo de Mapeamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAutoMode(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !isAutoMode
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setIsAutoMode(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isAutoMode
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="h-4 w-4" />
              Automático
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {isAutoMode
              ? 'No modo automático, defina o range de colunas e a linha inicial para mapear automaticamente.'
              : 'No modo manual, selecione cada coluna individualmente.'}
          </p>
        </CardContent>
      </Card>

      {/* Configuração Automática */}
      {isAutoMode && (
        <Card className="border-2 border-primary-200 bg-primary-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-600" />
              Mapeamento Automático
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert type="info" title="Como funciona">
              Informe o range de colunas (ex: A até H, ou 0 até 7) e a linha inicial.
              O sistema mapeará automaticamente na ordem: Código → Descrição → Dimensões → Cubagem → Peso → NCM → Preços...
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Coluna Inicial"
                value={autoStartColumn}
                onChange={(e) => setAutoStartColumn(e.target.value)}
                placeholder="Ex: A ou 0"
                helperText="Use letra (A, B, C) ou número (0, 1, 2)"
              />

              <Input
                label="Coluna Final"
                value={autoEndColumn}
                onChange={(e) => setAutoEndColumn(e.target.value)}
                placeholder="Ex: H ou 7"
                helperText="Use letra (A, B, C) ou número (0, 1, 2)"
              />

              <Input
                type="number"
                label="Linha Inicial dos Dados"
                value={autoStartRow}
                onChange={(e) => setAutoStartRow(e.target.value)}
                placeholder="Ex: 1"
                min={0}
                helperText="Linha onde começam os dados (0 = primeira)"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={applyAutoMapping} variant="primary">
                <Zap className="h-4 w-4 mr-2" />
                Aplicar Mapeamento Automático
              </Button>
            </div>

            <Alert type="warning" title="Atenção">
              Aplicar o mapeamento automático irá <strong>substituir</strong> qualquer configuração manual existente.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      <Card variant="bordered" className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="text-sm space-y-2">
            <p className="font-semibold text-blue-900">ℹ️ Configuração Atual:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-blue-800">
              <div>
                <span className="font-medium">Código:</span> {codeColumn !== null ? `Coluna ${codeColumn} (${columnNumberToLetter(codeColumn)})` : 'Não configurado'}
              </div>
              <div>
                <span className="font-medium">Descrição:</span> {descriptionColumn !== null ? `Coluna ${descriptionColumn} (${columnNumberToLetter(descriptionColumn)})` : 'Não configurado'}
              </div>
              <div>
                <span className="font-medium">Linha Inicial:</span> {dataStartRow}
              </div>
              <div>
                <span className="font-medium">Preços:</span> {priceColumns.length} configurado(s)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Mapeamento */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Colunas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grid de Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Select
                label="Coluna de Código *"
                options={[{ value: '', label: 'Selecione...' }, ...columnOptions]}
                value={codeColumn ?? ''}
                onChange={(e) => setCodeColumn(e.target.value ? Number(e.target.value) : null)}
              />
              <p className="text-xs text-gray-500 mt-1">* Campo obrigatório</p>
            </div>

            <Select
              label="Coluna de Descrição"
              options={[{ value: '', label: 'Nenhuma' }, ...columnOptions]}
              value={descriptionColumn ?? ''}
              onChange={(e) => setDescriptionColumn(e.target.value ? Number(e.target.value) : null)}
            />

            <Select
              label="Coluna de Dimensões"
              options={[{ value: '', label: 'Nenhuma' }, ...columnOptions]}
              value={dimensionsColumn ?? ''}
              onChange={(e) => setDimensionsColumn(e.target.value ? Number(e.target.value) : null)}
            />

            <Select
              label="Coluna de Cubagem"
              options={[{ value: '', label: 'Nenhuma' }, ...columnOptions]}
              value={cubicColumn ?? ''}
              onChange={(e) => setCubicColumn(e.target.value ? Number(e.target.value) : null)}
            />

            <Select
              label="Coluna de Peso"
              options={[{ value: '', label: 'Nenhuma' }, ...columnOptions]}
              value={weightColumn ?? ''}
              onChange={(e) => setWeightColumn(e.target.value ? Number(e.target.value) : null)}
            />

            <Select
              label="Coluna de NCM"
              options={[{ value: '', label: 'Nenhuma' }, ...columnOptions]}
              value={ncmColumn ?? ''}
              onChange={(e) => setNcmColumn(e.target.value ? Number(e.target.value) : null)}
            />
          </div>

          {/* Colunas de Preço */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Colunas de Preço</h3>
              <Button onClick={addPriceColumn} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Preço
              </Button>
            </div>

            <div className="space-y-3">
              {priceColumns.map((priceCol, idx) => (
                <div key={idx} className="flex items-end gap-3">
                  <Input
                    label="Nome do Preço"
                    value={priceCol.name}
                    onChange={(e) => updatePriceColumn(idx, 'name', e.target.value)}
                    placeholder="Ex: Preço Varejo"
                  />
                  <Select
                    label="Coluna"
                    options={columnOptions}
                    value={priceCol.index}
                    onChange={(e) => updatePriceColumn(idx, 'index', Number(e.target.value))}
                  />
                  <Button
                    onClick={() => removePriceColumn(idx)}
                    variant="outline"
                    size="md"
                    className="!min-w-0 !px-3"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}

              {priceColumns.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">
                  Nenhuma coluna de preço configurada. Clique em "Adicionar Preço" para começar.
                </p>
              )}
            </div>
          </div>

          {/* Linha de Início dos Dados */}
          <div className="border-t pt-6">
            <Input
              type="number"
              label="Linha de Início dos Dados (índice baseado em 0)"
              value={dataStartRow}
              onChange={(e) => setDataStartRow(Number(e.target.value))}
              min={0}
              max={preview.total_rows - 1}
              helperText={`Índice da linha onde começam os dados (0 = primeira linha, 1 = segunda linha, etc.). Para começar após o cabeçalho da linha 0, use 1.`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button onClick={handleSaveMapping} isLoading={saving}>
          <Save className="h-5 w-5 mr-2" />
          {saving ? 'Processando dados...' : 'Salvar e Processar'}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
