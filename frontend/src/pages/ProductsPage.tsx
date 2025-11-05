/**
 * Página de produtos extraídos - REFATORADA
 */

import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, Button, Alert } from '@/components/ui'
import { Download } from 'lucide-react'
import { useProducts, useExport } from '@/hooks'
import {
  ProductCard,
  ProductSearch,
  ProductSelection,
  LoadMoreButton,
  ProductExportModal,
} from '@/components/features/products'

export function ProductsPage() {
  const { uploadId } = useParams<{ uploadId: string }>()
  const navigate = useNavigate()

  // Hook de produtos (gerencia estado, filtros, seleção, paginação)
  const {
    products,
    loading,
    error,
    filteredProducts,
    visibleProducts,
    searchTerm,
    setSearchTerm,
    selectedProducts,
    toggleSelectProduct,
    selectAll,
    clearSelection,
    displayLimit,
    hasMore,
    loadMore,
    isExpanded,
    toggleExpand,
    setError,
  } = useProducts({ uploadId: uploadId ? Number(uploadId) : undefined })

  // Hook de exportação
  const {
    exporting,
    exportingProductId,
    exportModalOpen,
    openExportModal,
    closeExportModal,
    exportSingle,
    handleExport,
  } = useExport({ uploadId: uploadId ? Number(uploadId) : undefined })

  // Verificar se todos os visíveis estão selecionados
  const allVisibleSelected =
    visibleProducts.length > 0 && visibleProducts.every((p) => selectedProducts.has(p.id))

  // Handler de exportação do modal
  const onModalExport = async (format: any) => {
    await handleExport(format, {
      selectedIds: selectedProducts,
      allProducts: products,
    })
  }

  // Handler de exportação de produto individual
  const onProductExport = async (product: any, format: any) => {
    await exportSingle(product, format)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Produtos Extraídos</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Mostrando {visibleProducts.length} de {filteredProducts.length} produtos
            {filteredProducts.length !== products.length && ` (total: ${products.length})`}
            {selectedProducts.size > 0 && ` • ${selectedProducts.size} selecionado(s)`}
          </p>
        </div>
        <Button onClick={openExportModal} disabled={products.length === 0}>
          <Download className="h-5 w-5 mr-2" />
          {selectedProducts.size > 0
            ? `Exportar Selecionados (${selectedProducts.size})`
            : 'Exportar Todos'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Erro" closable onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Selection */}
      {products.length > 0 && (
        <div className="space-y-3">
          <ProductSearch value={searchTerm} onChange={setSearchTerm} />
          <ProductSelection
            visibleCount={visibleProducts.length}
            selectedCount={selectedProducts.size}
            allVisibleSelected={allVisibleSelected}
            onToggleSelectAll={() => selectAll(visibleProducts)}
            onClearSelection={clearSelection}
          />
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
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
              <p className="text-gray-500 dark:text-gray-400">Nenhum produto encontrado com os critérios de pesquisa.</p>
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-4">
                Limpar Pesquisa
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isExpanded={isExpanded(product.id)}
              isSelected={selectedProducts.has(product.id)}
              isExporting={exportingProductId === product.id}
              onToggleExpand={() => toggleExpand(product.id)}
              onToggleSelect={() => toggleSelectProduct(product.id)}
              onExport={(format) => onProductExport(product, format)}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <LoadMoreButton
              remainingCount={filteredProducts.length - displayLimit}
              onClick={loadMore}
            />
          )}
        </div>
      )}

      {/* Export Modal */}
      <ProductExportModal
        isOpen={exportModalOpen}
        isExporting={exporting}
        onClose={closeExportModal}
        onExport={onModalExport}
      />
    </div>
  )
}
