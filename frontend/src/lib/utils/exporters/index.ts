/**
 * Factory para exportadores
 */

import type { Product, ExportFormat } from '@/types'
import { exportToJson, exportSingleProductToJson } from './jsonExporter'
import { exportToCsv, exportSingleProductToCsv } from './csvExporter'
import { exportToXml, exportSingleProductToXml } from './xmlExporter'
import { EXPORT_FORMAT_METADATA } from '@/constants'

/**
 * Exporta produtos no formato especificado
 * @param products - Array de produtos a exportar
 * @param format - Formato de exportação (json, csv, xml)
 * @returns Blob com o conteúdo exportado
 */
export function exportProducts(products: Product[], format: ExportFormat): Blob {
  switch (format) {
    case 'json':
      return exportToJson(products)
    case 'csv':
      return exportToCsv(products)
    case 'xml':
      return exportToXml(products)
    default:
      throw new Error(`Formato de exportação não suportado: ${format}`)
  }
}

/**
 * Exporta um único produto no formato especificado
 * @param product - Produto a exportar
 * @param format - Formato de exportação (json, csv, xml)
 * @returns Blob com o conteúdo exportado
 */
export function exportSingleProduct(product: Product, format: ExportFormat): Blob {
  switch (format) {
    case 'json':
      return exportSingleProductToJson(product)
    case 'csv':
      return exportSingleProductToCsv(product)
    case 'xml':
      return exportSingleProductToXml(product)
    default:
      throw new Error(`Formato de exportação não suportado: ${format}`)
  }
}

/**
 * Faz download de um blob
 * @param blob - Blob a fazer download
 * @param filename - Nome do arquivo
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Gera nome de arquivo para exportação
 * @param prefix - Prefixo do nome do arquivo
 * @param format - Formato de exportação
 * @param uploadId - ID do upload (opcional)
 * @returns Nome do arquivo
 */
export function generateExportFilename(
  prefix: string,
  format: ExportFormat,
  uploadId?: number | string
): string {
  const extension = EXPORT_FORMAT_METADATA[format].extension
  const id = uploadId ? `_${uploadId}` : ''
  return `${prefix}${id}${extension}`
}

// Re-export individual exporters
export { exportToJson, exportSingleProductToJson } from './jsonExporter'
export { exportToCsv, exportSingleProductToCsv } from './csvExporter'
export { exportToXml, exportSingleProductToXml } from './xmlExporter'
