/**
 * Página de produtos extraídos - Design Minimalista
 */

import { useParams, useNavigate } from 'react-router-dom'
import { Button, Alert } from '@/components/ui'
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
          <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 font-light">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            <p>Carregando produtos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] space-y-8">
      {/* Header Minimalista */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-gray-100">
                Produtos <span className="font-semibold">Extraídos</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light mt-2">
                {visibleProducts.length} de {filteredProducts.length} produtos
                {filteredProducts.length !== products.length && ` • total: ${products.length}`}
                {selectedProducts.size > 0 && ` • ${selectedProducts.size} selecionado(s)`}
              </p>
            </div>
            <Button
              onClick={openExportModal}
              disabled={products.length === 0}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-12 px-8 rounded-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {selectedProducts.size > 0
                ? `Exportar (${selectedProducts.size})`
                : 'Exportar Todos'}
            </Button>
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <section className="max-w-7xl mx-auto">
          <Alert type="error" closable onClose={() => setError(null)}>
            {error}
          </Alert>
        </section>
      )}

      {/* Search and Selection */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto space-y-4">
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
        </section>
      )}

      {/* Products List */}
      <section className="max-w-7xl mx-auto pb-16">
        {products.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-sm">
                <Package className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-1">
                  Nenhum produto encontrado
                </h3>
                <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                  Verifique o mapeamento de colunas e tente novamente
                </p>
              </div>
              <Button
                onClick={() => navigate(`/mapping/${uploadId}`)}
                className="mt-4 border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm"
              >
                Voltar ao Mapeamento
              </Button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-sm">
                <Sparkles className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-1">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                  Tente ajustar os critérios de pesquisa
                </p>
              </div>
              <Button
                onClick={() => setSearchTerm('')}
                className="mt-4 border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm"
              >
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
      </section>

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
