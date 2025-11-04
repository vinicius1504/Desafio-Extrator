/**
 * Hook para gerenciar produtos
 */

import { useState, useEffect } from 'react'
import { productsAPI } from '@/lib/api'
import type { Product } from '@/types'
import { filterProducts, paginateProducts } from '@/lib/utils'
import { PAGINATION, ERROR_MESSAGES } from '@/constants'

export interface UseProductsOptions {
  uploadId?: number
  initialLimit?: number
}

export interface UseProductsReturn {
  // Estado
  products: Product[]
  loading: boolean
  error: string | null

  // Produtos filtrados e visíveis
  filteredProducts: Product[]
  visibleProducts: Product[]

  // Pesquisa
  searchTerm: string
  setSearchTerm: (term: string) => void

  // Seleção
  selectedProducts: Set<number>
  selectProduct: (productId: number) => void
  unselectProduct: (productId: number) => void
  toggleSelectProduct: (productId: number) => void
  selectAll: (products: Product[]) => void
  clearSelection: () => void
  isSelected: (productId: number) => boolean

  // Paginação
  displayLimit: number
  hasMore: boolean
  loadMore: () => void
  resetPagination: () => void

  // Expand/Collapse
  expandedProducts: Set<number>
  toggleExpand: (productId: number) => void
  isExpanded: (productId: number) => boolean

  // Actions
  loadProducts: () => Promise<void>
  refreshProducts: () => Promise<void>
  setError: (error: string | null) => void
}

/**
 * Hook para gerenciar produtos
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { uploadId, initialLimit = PAGINATION.INITIAL_LIMIT } = options

  // Estado
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pesquisa e filtros
  const [searchTerm, setSearchTerm] = useState('')

  // Seleção
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())

  // Paginação
  const [displayLimit, setDisplayLimit] = useState(initialLimit)

  // Expand/Collapse
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set())

  // Produtos filtrados
  const filteredProducts = filterProducts(products, searchTerm)

  // Produtos visíveis (com paginação)
  const visibleProducts = paginateProducts(filteredProducts, displayLimit)

  // Verificar se há mais produtos
  const hasMore = filteredProducts.length > displayLimit

  // Resetar paginação quando pesquisa mudar
  useEffect(() => {
    setDisplayLimit(initialLimit)
  }, [searchTerm, initialLimit])

  // Carregar produtos
  const loadProducts = async () => {
    if (!uploadId) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await productsAPI.getProductsByUpload(uploadId)

      // Tratar resposta paginada ou array direto
      let productsArray: Product[] = []

      if (Array.isArray(data)) {
        productsArray = data
      } else if (data && typeof data === 'object' && 'results' in data) {
        productsArray = (data as any).results || []
      }

      setProducts(productsArray)
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_PRODUCTS_FAILED)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Carregar produtos quando uploadId mudar
  useEffect(() => {
    loadProducts()
  }, [uploadId])

  // Funções de seleção
  const selectProduct = (productId: number) => {
    setSelectedProducts(prev => new Set(prev).add(productId))
  }

  const unselectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
  }

  const toggleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const selectAll = (productsToSelect: Product[]) => {
    const visibleIds = productsToSelect.map(p => p.id)
    const allVisibleSelected = visibleIds.every(id => selectedProducts.has(id))

    if (allVisibleSelected) {
      // Desmarcar os visíveis
      setSelectedProducts(prev => {
        const newSet = new Set(prev)
        visibleIds.forEach(id => newSet.delete(id))
        return newSet
      })
    } else {
      // Marcar os visíveis
      setSelectedProducts(prev => {
        const newSet = new Set(prev)
        visibleIds.forEach(id => newSet.add(id))
        return newSet
      })
    }
  }

  const clearSelection = () => {
    setSelectedProducts(new Set())
  }

  const isSelected = (productId: number) => {
    return selectedProducts.has(productId)
  }

  // Funções de paginação
  const loadMore = () => {
    setDisplayLimit(prev => prev + PAGINATION.LOAD_MORE_INCREMENT)
  }

  const resetPagination = () => {
    setDisplayLimit(initialLimit)
  }

  // Funções de expand/collapse
  const toggleExpand = (productId: number) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const isExpanded = (productId: number) => {
    return expandedProducts.has(productId)
  }

  // Refresh products
  const refreshProducts = async () => {
    await loadProducts()
  }

  return {
    // Estado
    products,
    loading,
    error,

    // Produtos filtrados e visíveis
    filteredProducts,
    visibleProducts,

    // Pesquisa
    searchTerm,
    setSearchTerm,

    // Seleção
    selectedProducts,
    selectProduct,
    unselectProduct,
    toggleSelectProduct,
    selectAll,
    clearSelection,
    isSelected,

    // Paginação
    displayLimit,
    hasMore,
    loadMore,
    resetPagination,

    // Expand/Collapse
    expandedProducts,
    toggleExpand,
    isExpanded,

    // Actions
    loadProducts,
    refreshProducts,
    setError,
  }
}
