/**
 * Modal de catálogo de produtos - Design Minimalista
 */

import { useState, useEffect, useRef } from 'react'
import { exportHistoryAPI, type ProductDetail } from '@/lib/api'
import { Alert } from '@/components/ui/Alert'
import { ProductCatalogCard } from './ProductCatalogCard'
import { X, Building2, Edit2, Check, Loader2, Download, Upload, FileJson, FileText, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui'
import { toast } from 'sonner'

interface ProductCatalogModalProps {
  isOpen: boolean
  onClose: () => void
  uploadId: number
  initialCompanyName?: string | null
}

export function ProductCatalogModal({
  isOpen,
  onClose,
  uploadId,
  initialCompanyName,
}: ProductCatalogModalProps) {
  const [products, setProducts] = useState<ProductDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState(initialCompanyName || '')
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [savingCompany, setSavingCompany] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadProducts()
      setCompanyName(initialCompanyName || '')
    }
  }, [isOpen, uploadId, initialCompanyName])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await exportHistoryAPI.getExportProducts(uploadId)
      setProducts(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produtos')
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

  const handleSaveCompany = async () => {
    setSavingCompany(true)
    try {
      await exportHistoryAPI.linkCompany(uploadId, companyName)
      setIsEditingCompany(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao vincular empresa')
    } finally {
      setSavingCompany(false)
    }
  }

  const handleDownloadAll = async (format: 'json' | 'csv' | 'xml') => {
    setDownloading(true)
    try {
      const fileName = `produtos_${companyName || 'catalogo'}_${new Date().toISOString().split('T')[0]}`

      if (format === 'json') {
        // Exportar como JSON
        const dataToExport = products.map(product => ({
          code: product.code,
          description: product.description,
          cubic: product.cubic,
          weight: product.weight,
          ncm: product.ncm,
          variants: product.variants.map(v => v.fields)
        }))

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        // Exportar como CSV
        let csvContent = 'Código,Descrição,Cubagem,Peso,NCM,Variantes\n'

        products.forEach(product => {
          const variantsStr = product.variants
            .map(v => Object.entries(v.fields).map(([k, val]) => `${k}:${val}`).join(';'))
            .join(' | ')

          csvContent += `"${product.code || ''}","${product.description || ''}","${product.cubic || ''}","${product.weight || ''}","${product.ncm || ''}","${variantsStr}"\n`
        })

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else if (format === 'xml') {
        // Exportar como XML
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<products>\n'

        products.forEach(product => {
          xmlContent += '  <product>\n'
          xmlContent += `    <code>${product.code || ''}</code>\n`
          xmlContent += `    <description>${product.description || ''}</description>\n`
          xmlContent += `    <cubic>${product.cubic || ''}</cubic>\n`
          xmlContent += `    <weight>${product.weight || ''}</weight>\n`
          xmlContent += `    <ncm>${product.ncm || ''}</ncm>\n`

          if (product.variants.length > 0) {
            xmlContent += '    <variants>\n'
            product.variants.forEach(variant => {
              xmlContent += '      <variant>\n'
              Object.entries(variant.fields).forEach(([key, value]) => {
                xmlContent += `        <${key}>${value}</${key}>\n`
              })
              xmlContent += '      </variant>\n'
            })
            xmlContent += '    </variants>\n'
          }

          xmlContent += '  </product>\n'
        })

        xmlContent += '</products>'

        const blob = new Blob([xmlContent], { type: 'application/xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}.xml`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      setShowDownloadModal(false)
      toast.success('Produtos baixados com sucesso')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao baixar produtos')
    } finally {
      setDownloading(false)
    }
  }

  const handleUpdateFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUpdating(true)
    try {
      // Chamar endpoint de atualização
      const result = await exportHistoryAPI.updateProductsFromSpreadsheet(uploadId, file)

      toast.success(`Atualização concluída: ${result.updated} produtos atualizados, ${result.unchanged} inalterados, ${result.new} novos`)

      // Recarregar produtos
      await loadProducts()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar produtos')
    } finally {
      setUpdating(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 my-8">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">
                  Catálogo de Produtos
                </h2>

                {/* Company Name */}
                <div className="mt-3 flex items-center gap-3">
                  {!isEditingCompany ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-light text-gray-600 dark:text-gray-400">
                          {companyName || 'Nenhuma empresa vinculada'}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsEditingCompany(true)}
                        className="flex items-center gap-1 text-sm font-light text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Editar</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nome da empresa"
                        className="border-gray-300 dark:border-gray-700 rounded-sm h-9 w-64 text-sm font-light"
                      />
                      <Button
                        onClick={handleSaveCompany}
                        disabled={savingCompany}
                        size="sm"
                        className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-9 px-3 rounded-sm"
                      >
                        {savingCompany ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditingCompany(false)
                          setCompanyName(initialCompanyName || '')
                        }}
                        variant="outline"
                        size="sm"
                        className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 h-9 px-3 rounded-sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowDownloadModal(true)}
                  disabled={downloading || products.length === 0}
                  variant="outline"
                  size="sm"
                  className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm h-10 px-4"
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-light">Baixar Todos</span>
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleUpdateFromFile}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={updating}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-sm h-10 px-4"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-light">Atualizar</span>
                </Button>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                >
                  <X className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <Alert type="error" className="mb-6">
                {error}
              </Alert>
            )}

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
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 font-light">
                  Nenhum produto encontrado
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCatalogCard
                    key={product.id}
                    product={product}
                    onUpdateImage={handleUpdateImage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Download */}
      {showDownloadModal && (
        <Modal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          title="Baixar Produtos"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 font-light">
              Selecione o formato para download:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleDownloadAll('json')}
                disabled={downloading}
                className="w-full flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <FileJson className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">JSON</h4>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Formato estruturado ideal para APIs
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleDownloadAll('csv')}
                disabled={downloading}
                className="w-full flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">CSV</h4>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Formato tabular para Excel e planilhas
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleDownloadAll('xml')}
                disabled={downloading}
                className="w-full flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <FileCode className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">XML</h4>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Formato estruturado para integrações
                  </p>
                </div>
              </button>
            </div>

            {downloading && (
              <p className="text-center text-sm font-light text-gray-500 dark:text-gray-400">
                Gerando arquivo...
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
