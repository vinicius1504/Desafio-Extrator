import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, Button, Alert, Modal, Table, Input } from '@/components/ui'
import { Download, FileJson, FileText, FileCode, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { productsAPI } from '@/lib/api'
import type { Product, ExportFormat } from '@/types'

export function ProductsPage() {
  const { uploadId } = useParams<{ uploadId: string }>()
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [exportingProductId, setExportingProductId] = useState<number | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [displayLimit, setDisplayLimit] = useState(10)

  // Função auxiliar para formatar preços com segurança
  const formatPrice = (price: any): string => {
    if (typeof price === 'number') {
      return price.toFixed(2)
    }
    const numPrice = parseFloat(price)
    if (isNaN(numPrice)) {
      return '0.00'
    }
    return numPrice.toFixed(2)
  }

  useEffect(() => {
    if (!uploadId) return

    const loadProducts = async () => {
      try {
        setLoading(true)
        console.log('=== CARREGANDO PRODUTOS ===')
        console.log('Upload ID:', uploadId)

        const data = await productsAPI.getProductsByUpload(Number(uploadId))
        console.log('📦 Dados recebidos:', data)
        console.log('Tipo de dados:', typeof data, Array.isArray(data) ? 'é array' : 'não é array')

        // Tratar resposta paginada ou array direto
        let productsArray: Product[] = []

        if (Array.isArray(data)) {
          // API retornou array direto
          productsArray = data
          console.log('✅ Array direto')
        } else if (data && typeof data === 'object' && 'results' in data) {
          // API retornou objeto paginado do DRF
          productsArray = (data as any).results || []
          console.log('✅ Resposta paginada do DRF')
          console.log('Total no servidor:', (data as any).count)
          console.log('Próxima página:', (data as any).next)
        }

        console.log('Total de produtos carregados:', productsArray.length)
        setProducts(productsArray)
      } catch (err) {
        console.error('❌ Erro ao carregar produtos:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [uploadId])

  const toggleProduct = (productId: number) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  const toggleSelectProduct = (productId: number) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const toggleSelectAll = (visible: Product[]) => {
    const visibleIds = visible.map(p => p.id)
    const allVisibleSelected = visibleIds.every(id => selectedProducts.has(id))

    if (allVisibleSelected) {
      // Desmarcar os visíveis
      const newSelected = new Set(selectedProducts)
      visibleIds.forEach(id => newSelected.delete(id))
      setSelectedProducts(newSelected)
    } else {
      // Marcar os visíveis
      const newSelected = new Set(selectedProducts)
      visibleIds.forEach(id => newSelected.add(id))
      setSelectedProducts(newSelected)
    }
  }

  const handleExport = async (format: ExportFormat) => {
    if (!uploadId) return

    try {
      setExporting(true)

      // Se houver produtos selecionados, exportar apenas eles
      if (selectedProducts.size > 0) {
        console.log('=== EXPORTANDO PRODUTOS SELECIONADOS ===')
        console.log('Produtos selecionados:', selectedProducts.size)

        const selectedProductsData = products.filter(p => selectedProducts.has(p.id))
        await handleExportMultiple(selectedProductsData, format)
      } else {
        // Exportar todos os produtos
        console.log('=== INICIANDO EXPORTAÇÃO ===')
        console.log('Upload ID:', uploadId)
        console.log('Formato:', format)

        const blob = await productsAPI.exportProducts(Number(uploadId), format)
        console.log('✅ Blob recebido:', blob)
        console.log('Tamanho do blob:', blob.size, 'bytes')
        console.log('Tipo do blob:', blob.type)

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `produtos_${uploadId}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        console.log('✅ Download iniciado')
      }

      setExportModalOpen(false)
    } catch (err) {
      console.error('❌ Erro ao exportar:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar produtos'
      setError(errorMessage)
    } finally {
      setExporting(false)
    }
  }

  const handleExportMultiple = async (productsToExport: Product[], format: ExportFormat) => {
    let blob: Blob
    let fileName: string

    if (format === 'json') {
      const jsonData = JSON.stringify(productsToExport, null, 2)
      blob = new Blob([jsonData], { type: 'application/json' })
      fileName = `produtos_selecionados.json`
    } else if (format === 'csv') {
      // Criar CSV com todos os produtos selecionados
      const headers = ['Descrição', 'Código', 'Dimensões', 'Peso', 'Cubagem', 'NCM', 'Preços']
      const rows: string[][] = []

      productsToExport.forEach(product => {
        product.variants.forEach(v => {
          rows.push([
            product.description || '',
            v.code,
            v.dimensions || '',
            v.weight || '',
            v.cubic || '',
            v.ncm || '',
            Object.entries(v.prices || {})
              .map(([name, price]) => `${name}: R$ ${formatPrice(price)}`)
              .join('; ')
          ])
        })
      })

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      fileName = `produtos_selecionados.csv`
    } else {
      // XML
      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<produtos>
${productsToExport.map(product => `  <produto>
    <descricao>${product.description || ''}</descricao>
    <variantes>
${product.variants.map(v => `      <variante>
        <codigo>${v.code}</codigo>
        <dimensoes>${v.dimensions || ''}</dimensoes>
        <peso>${v.weight || ''}</peso>
        <cubagem>${v.cubic || ''}</cubagem>
        <ncm>${v.ncm || ''}</ncm>
        <precos>
${Object.entries(v.prices || {})
  .map(([name, price]) => `          <preco nome="${name}">${formatPrice(price)}</preco>`)
  .join('\n')}
        </precos>
      </variante>`).join('\n')}
    </variantes>
  </produto>`).join('\n')}
</produtos>`

      blob = new Blob([xmlData], { type: 'application/xml' })
      fileName = `produtos_selecionados.xml`
    }

    // Fazer download
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    console.log('✅ Download dos produtos selecionados iniciado')
  }

  const handleExportProduct = async (product: Product, format: ExportFormat) => {
    try {
      setExportingProductId(product.id)
      console.log('=== EXPORTANDO PRODUTO INDIVIDUAL ===')
      console.log('Product ID:', product.id)
      console.log('Formato:', format)

      // Criar dados do produto individual
      const productData = {
        description: product.description,
        variants: product.variants
      }

      // Converter para o formato desejado
      let blob: Blob
      let fileName: string

      if (format === 'json') {
        const jsonData = JSON.stringify(productData, null, 2)
        blob = new Blob([jsonData], { type: 'application/json' })
        fileName = `produto_${product.id}.json`
      } else if (format === 'csv') {
        // Criar CSV com as variantes
        const headers = ['Descrição', 'Código', 'Dimensões', 'Peso', 'Cubagem', 'NCM', 'Preços']
        const rows = product.variants.map(v => [
          product.description || '',
          v.code,
          v.dimensions || '',
          v.weight || '',
          v.cubic || '',
          v.ncm || '',
          Object.entries(v.prices || {})
            .map(([name, price]) => `${name}: R$ ${formatPrice(price)}`)
            .join('; ')
        ])

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        fileName = `produto_${product.id}.csv`
      } else {
        // XML
        const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<produto>
  <descricao>${product.description || ''}</descricao>
  <variantes>
${product.variants.map(v => `    <variante>
      <codigo>${v.code}</codigo>
      <dimensoes>${v.dimensions || ''}</dimensoes>
      <peso>${v.weight || ''}</peso>
      <cubagem>${v.cubic || ''}</cubagem>
      <ncm>${v.ncm || ''}</ncm>
      <precos>
${Object.entries(v.prices || {})
  .map(([name, price]) => `        <preco nome="${name}">${formatPrice(price)}</preco>`)
  .join('\n')}
      </precos>
    </variante>`).join('\n')}
  </variantes>
</produto>`

        blob = new Blob([xmlData], { type: 'application/xml' })
        fileName = `produto_${product.id}.xml`
      }

      // Fazer download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log('✅ Download do produto iniciado')
    } catch (err) {
      console.error('❌ Erro ao exportar produto:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar produto'
      setError(errorMessage)
    } finally {
      setExportingProductId(null)
    }
  }

  // Filtrar produtos baseado no termo de pesquisa
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()

    // Buscar na descrição do produto
    if (product.description?.toLowerCase().includes(searchLower)) return true

    // Buscar nos códigos das variantes
    if (product.variants?.some(v => v.code?.toLowerCase().includes(searchLower))) return true

    // Buscar nas dimensões
    if (product.variants?.some(v => v.dimensions?.toLowerCase().includes(searchLower))) return true

    // Buscar no NCM
    if (product.variants?.some(v => v.ncm?.toLowerCase().includes(searchLower))) return true

    return false
  })

  // Produtos visíveis (limitados)
  const visibleProducts = filteredProducts.slice(0, displayLimit)
  const hasMore = filteredProducts.length > displayLimit

  // Resetar limite quando pesquisa mudar
  useEffect(() => {
    setDisplayLimit(10)
  }, [searchTerm])

  const loadMore = () => {
    setDisplayLimit(prev => prev + 10)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  const totalVariants = Array.isArray(products)
    ? products.reduce((acc, p) => acc + (p.variants?.length || 0), 0)
    : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Produtos Extraídos</h1>
          <p className="text-gray-600">
            Mostrando {visibleProducts.length} de {filteredProducts.length} produtos {filteredProducts.length !== products.length && `(total: ${products.length})`}
            {selectedProducts.size > 0 && ` • ${selectedProducts.size} selecionado(s)`}
          </p>
        </div>
        <Button onClick={() => setExportModalOpen(true)} disabled={products.length === 0}>
          <Download className="h-5 w-5 mr-2" />
          {selectedProducts.size > 0 ? `Exportar Selecionados (${selectedProducts.size})` : 'Exportar Todos'}
        </Button>
      </div>

      {error && (
        <Alert type="error" title="Erro" closable onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Barra de Pesquisa e Seleção */}
      {products.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar por descrição, código, dimensões ou NCM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleProducts.length > 0 && visibleProducts.every(p => selectedProducts.has(p.id))}
                onChange={() => toggleSelectAll(visibleProducts)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                Selecionar visíveis ({visibleProducts.length})
              </span>
            </label>
            {selectedProducts.size > 0 && (
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Limpar seleção
              </button>
            )}
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500">
                Nenhum produto encontrado. Verifique o mapeamento de colunas.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate(`/mapping/${uploadId}`)}
                className="mt-4"
              >
                Voltar ao Mapeamento
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500">
                Nenhum produto encontrado com os critérios de pesquisa.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Limpar Pesquisa
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleProducts.map((product) => {
            const isExpanded = expandedProducts.has(product.id)
            const mainVariant = product.variants?.[0]

            if (!mainVariant) return null

            return (
              <Card key={product.id}>
                <CardContent className="p-0">
                  {/* Product Header */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                      />
                      <div
                        className="mt-1 cursor-pointer"
                        onClick={() => toggleProduct(product.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => toggleProduct(product.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {product.description || '(Sem descrição)'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {product.variants.length} variante(s)
                            </p>
                          </div>
                        </div>

                        {/* Quick Info */}
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                          {mainVariant.weight && (
                            <span>Peso: {mainVariant.weight}kg</span>
                          )}
                          {mainVariant.cubic && (
                            <span>Cubagem: {mainVariant.cubic}m³</span>
                          )}
                          {mainVariant.ncm && <span>NCM: {mainVariant.ncm}</span>}
                        </div>

                        {/* Prices */}
                        {mainVariant.prices && Object.keys(mainVariant.prices).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-3">
                            {Object.entries(mainVariant.prices).map(([name, price]) => (
                              <div
                                key={name}
                                className="px-3 py-1 bg-primary-50 rounded-full"
                              >
                                <span className="text-sm font-medium text-primary-700">
                                  {name}: R$ {formatPrice(price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Download Buttons */}
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-gray-500 mb-1">Baixar:</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportProduct(product, 'json')
                          }}
                          disabled={exportingProductId === product.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Baixar em JSON"
                        >
                          <FileJson className="h-4 w-4 text-blue-600" />
                          <span>JSON</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportProduct(product, 'csv')
                          }}
                          disabled={exportingProductId === product.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Baixar em CSV"
                        >
                          <FileText className="h-4 w-4 text-green-600" />
                          <span>CSV</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportProduct(product, 'xml')
                          }}
                          disabled={exportingProductId === product.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Baixar em XML"
                        >
                          <FileCode className="h-4 w-4 text-orange-600" />
                          <span>XML</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Variants Table */}
                  {isExpanded && product.variants && product.variants.length > 1 && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-4">Variantes</h4>
                      <Table
                        columns={[
                          { key: 'code', header: 'Código', width: '120px' },
                          {
                            key: 'dimensions',
                            header: 'Dimensões',
                            render: (v) => v || '-',
                          },
                          {
                            key: 'weight',
                            header: 'Peso',
                            render: (v) => (v ? `${v}kg` : '-'),
                          },
                          {
                            key: 'cubic',
                            header: 'Cubagem',
                            render: (v) => (v ? `${v}m³` : '-'),
                          },
                          {
                            key: 'ncm',
                            header: 'NCM',
                            render: (v) => v || '-',
                          },
                          {
                            key: 'prices',
                            header: 'Preços',
                            render: (prices) =>
                              Object.entries(prices as Record<string, number>)
                                .map(([name, price]) => `${name}: R$ ${formatPrice(price)}`)
                                .join(', ') || '-',
                          },
                        ]}
                        data={product.variants}
                        keyExtractor={(v) => v.id}
                        compact
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* Botão Ver Mais */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                className="min-w-[200px]"
              >
                Ver mais ({filteredProducts.length - displayLimit} restantes)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Exportar Produtos"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Selecione o formato para exportação:</p>

          <div className="space-y-3">
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="w-full flex items-center gap-4 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FileJson className="h-8 w-8 text-blue-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">JSON</h4>
                <p className="text-sm text-gray-500">
                  Formato estruturado ideal para APIs
                </p>
              </div>
            </button>

            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="w-full flex items-center gap-4 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FileText className="h-8 w-8 text-green-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">CSV</h4>
                <p className="text-sm text-gray-500">
                  Formato tabular para Excel e planilhas
                </p>
              </div>
            </button>

            <button
              onClick={() => handleExport('xml')}
              disabled={exporting}
              className="w-full flex items-center gap-4 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FileCode className="h-8 w-8 text-orange-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">XML</h4>
                <p className="text-sm text-gray-500">
                  Formato estruturado para integrações
                </p>
              </div>
            </button>
          </div>

          {exporting && (
            <p className="text-center text-sm text-gray-500">Gerando arquivo...</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
