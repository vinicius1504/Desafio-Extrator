/**
 * Visualização de catálogo global - Todos os produtos
 */

import { useState, useEffect } from 'react'
import { exportHistoryAPI, type ProductDetail } from '@/lib/api'
import { Alert } from '@/components/ui/Alert'
import { ProductCatalogCard } from './ProductCatalogCard'
import { Search, Filter, Calendar, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function GlobalCatalogView() {
  const [products, setProducts] = useState<ProductDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20

  // Lista de empresas
  const [companies, setCompanies] = useState<string[]>([])

  // Filtros expandidos
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [currentPage, searchTerm, selectedCompany, startDate, endDate])

  const loadCompanies = async () => {
    try {
      const companyList = await exportHistoryAPI.getUniqueCompanies()
      setCompanies(companyList)
    } catch (err: any) {
      console.error('Erro ao carregar empresas:', err)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await exportHistoryAPI.getGlobalCatalog({
        search: searchTerm || undefined,
        company: selectedCompany || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page: currentPage,
        page_size: pageSize,
      })
      setProducts(data.results)
      setTotalPages(data.total_pages)
      setTotalCount(data.count)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar catálogo')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateImage = async (productId: number, file: File) => {
    try {
      const updated = await exportHistoryAPI.updateProductImage(productId, file)
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updated } : p))
      )
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar imagem')
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCompany('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || selectedCompany || startDate || endDate

  return (
    <div className="space-y-6">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">
            Catálogo Global
          </h2>
          <p className="text-sm font-light text-gray-600 dark:text-gray-400 mt-1">
            {totalCount} produto(s) encontrado(s)
          </p>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          size="sm"
          className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </div>

      {/* Barra de pesquisa sempre visível */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Pesquisar por código, descrição ou NCM..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-10 border-gray-300 dark:border-gray-700 rounded-sm h-10 font-light"
        />
      </div>

      {/* Filtros expandidos */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por empresa */}
            <div>
              <label className="flex items-center gap-2 text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-sm h-10 px-3 font-light focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
              >
                <option value="">Todas as empresas</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por data inicial */}
            <div>
              <label className="flex items-center gap-2 text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4" />
                Data Inicial
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="border-gray-300 dark:border-gray-700 rounded-sm h-10 font-light"
              />
            </div>

            {/* Filtro por data final */}
            <div>
              <label className="flex items-center gap-2 text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4" />
                Data Final
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="border-gray-300 dark:border-gray-700 rounded-sm h-10 font-light"
              />
            </div>
          </div>

          {/* Botão limpar filtros */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="sm"
                className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm"
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Erro */}
      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-sm mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm">
          <p className="text-gray-600 dark:text-gray-400 font-light">
            {hasActiveFilters ? 'Nenhum produto encontrado com os filtros aplicados' : 'Nenhum produto cadastrado'}
          </p>
        </div>
      ) : (
        <>
          {/* Grid de produtos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCatalogCard
                key={product.id}
                product={product}
                onUpdateImage={handleUpdateImage}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6">
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
