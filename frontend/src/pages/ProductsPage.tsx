/**
 * Página de produtos extraídos - REFATORADA E MODERNIZADA
 */

import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, Button, Alert } from '@/components/ui'
import { Download, Package, Sparkles } from 'lucide-react'
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
          <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            <p className="font-medium">Carregando produtos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header Compacto e Moderno */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Produtos Extraídos</h1>
              <p className="text-blue-100 text-xs">
                {visibleProducts.length} de {filteredProducts.length} produtos
                {filteredProducts.length !== products.length && ` (total: ${products.length})`}
                {selectedProducts.size > 0 && ` • ${selectedProducts.size} selecionado(s)`}
              </p>
            </div>
          </div>
          <Button
            onClick={openExportModal}
            disabled={products.length === 0}
            className="bg-white/95 text-blue-700 hover:bg-white border border-white/20 dark:bg-gray-800/95 dark:text-blue-300 dark:hover:bg-gray-700 dark:border-gray-700 shadow-lg backdrop-blur-sm h-9 font-semibold text-xs"
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">
              {selectedProducts.size > 0
                ? `Exportar (${selectedProducts.size})`
                : 'Exportar Todos'}
            </span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>
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
          {selectedProducts.size > 0 && (
            <ProductSelection
              visibleCount={visibleProducts.length}
              selectedCount={selectedProducts.size}
              allVisibleSelected={allVisibleSelected}
              onToggleSelectAll={() => selectAll(visibleProducts)}
              onClearSelection={clearSelection}
            />
          )}
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <Package className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Nenhum produto encontrado
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifique o mapeamento de colunas e tente novamente
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/mapping/${uploadId}`)}
              className="mt-4"
            >
              Voltar ao Mapeamento
            </Button>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Nenhum resultado encontrado
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tente ajustar os critérios de pesquisa
              </p>
            </div>
            <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-4">
              Limpar Pesquisa
            </Button>
          </div>
        </div>
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
