/**
 * Hook para gerenciar exportação de produtos
 */

import { useState } from 'react'
import type { Product, ExportFormat } from '@/types'
import { productsAPI } from '@/lib/api'
import {
  exportProducts as exportProductsUtil,
  exportSingleProduct,
  downloadBlob,
  generateExportFilename,
} from '@/lib/utils'
import { ERROR_MESSAGES } from '@/constants'

export interface UseExportOptions {
  uploadId?: number
}

export interface UseExportReturn {
  // Estado
  exporting: boolean
  exportingProductId: number | null
  exportModalOpen: boolean
  error: string | null

  // Modal
  openExportModal: () => void
  closeExportModal: () => void
  setExportModalOpen: (open: boolean) => void

  // Exportação
  exportAll: (format: ExportFormat) => Promise<void>
  exportSelected: (products: Product[], format: ExportFormat) => Promise<void>
  exportSingle: (product: Product, format: ExportFormat) => Promise<void>
  handleExport: (
    format: ExportFormat,
    options?: { products?: Product[]; selectedIds?: Set<number>; allProducts?: Product[] }
  ) => Promise<void>

  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
}

/**
 * Hook para gerenciar exportação
 */
export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const { uploadId } = options

  const [exporting, setExporting] = useState(false)
  const [exportingProductId, setExportingProductId] = useState<number | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openExportModal = () => setExportModalOpen(true)
  const closeExportModal = () => setExportModalOpen(false)
  const clearError = () => setError(null)

  /**
   * Exporta todos os produtos via API
   */
  const exportAll = async (format: ExportFormat) => {
    if (!uploadId) return

    try {
      setExporting(true)
      setError(null)

      const blob = await productsAPI.exportProducts(uploadId, format)

      const filename = generateExportFilename('produtos', format, uploadId)
      downloadBlob(blob, filename)

      closeExportModal()
    } catch (err) {
      console.error('Erro ao exportar todos os produtos:', err)
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.EXPORT_FAILED)
    } finally {
      setExporting(false)
    }
  }

  /**
   * Exporta produtos selecionados (no cliente)
   */
  const exportSelected = async (products: Product[], format: ExportFormat) => {
    try {
      setExporting(true)
      setError(null)

      const blob = exportProductsUtil(products, format)

      const filename = generateExportFilename('produtos_selecionados', format)
      downloadBlob(blob, filename)

      closeExportModal()
    } catch (err) {
      console.error('Erro ao exportar produtos selecionados:', err)
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.EXPORT_FAILED)
    } finally {
      setExporting(false)
    }
  }

  /**
   * Exporta um único produto (no cliente)
   */
  const exportSingle = async (product: Product, format: ExportFormat) => {
    try {
      setExportingProductId(product.id)
      setError(null)

      const blob = exportSingleProduct(product, format)

      const filename = generateExportFilename(`produto`, format, product.id)
      downloadBlob(blob, filename)
    } catch (err) {
      console.error('Erro ao exportar produto:', err)
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.EXPORT_FAILED)
    } finally {
      setExportingProductId(null)
    }
  }

  /**
   * Handler genérico de exportação
   * Decide automaticamente se deve exportar todos, selecionados ou usar API
   */
  const handleExport = async (
    format: ExportFormat,
    options: { products?: Product[]; selectedIds?: Set<number>; allProducts?: Product[] } = {}
  ) => {
    const { products, selectedIds, allProducts } = options

    // Se foi passado array de produtos específico, exportar eles
    if (products && products.length > 0) {
      await exportSelected(products, format)
      return
    }

    // Se há seleção e todos os produtos foram passados
    if (selectedIds && selectedIds.size > 0 && allProducts) {
      const selectedProducts = allProducts.filter(p => selectedIds.has(p.id))
      await exportSelected(selectedProducts, format)
      return
    }

    // Caso contrário, exportar todos via API
    await exportAll(format)
  }

  return {
    // Estado
    exporting,
    exportingProductId,
    exportModalOpen,
    error,

    // Modal
    openExportModal,
    closeExportModal,
    setExportModalOpen,

    // Exportação
    exportAll,
    exportSelected,
    exportSingle,
    handleExport,

    // Error handling
    setError,
    clearError,
  }
}
