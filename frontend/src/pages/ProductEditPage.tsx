/**
 * Página de edição completa de produto - Design Minimalista
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Upload, ImageIcon, Plus, Trash2, Edit2, Check, X, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { exportHistoryAPI, type ProductDetail } from '@/lib/api'
import { toast } from 'sonner'

interface VariantField {
  key: string
  value: string
}

export function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    cubic: '',
    weight: '',
    ncm: '',
  })

  const [variants, setVariants] = useState<Array<{ id: number; fields: VariantField[]; editing: boolean }>>([])
  const [companyName, setCompanyName] = useState('')
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [savingCompany, setSavingCompany] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    if (!productId) return

    try {
      setLoading(true)
      const foundProduct = await exportHistoryAPI.getProduct(parseInt(productId))

      setProduct(foundProduct)
      setCompanyName(foundProduct.company_name || '')
      setFormData({
        code: foundProduct.code || '',
        description: foundProduct.description || '',
        cubic: foundProduct.cubic || '',
        weight: foundProduct.weight || '',
        ncm: foundProduct.ncm || '',
      })

      // Converter variantes para formato editável
      if (foundProduct.variants) {
        setVariants(foundProduct.variants.map((v, idx) => ({
          id: idx,
          fields: Object.entries(v.fields || {}).map(([key, value]) => ({
            key,
            value: String(value)
          })),
          editing: false
        })))
      }
    } catch (err) {
      console.error('Erro ao carregar produto:', err)
      toast.error('Produto não encontrado')
      navigate('/profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!productId) return

    try {
      setSaving(true)
      await exportHistoryAPI.updateProduct(parseInt(productId), formData)
      toast.success('Produto atualizado com sucesso')
      navigate('/profile') // Navegar para perfil/histórico
    } catch (err) {
      console.error('Erro ao salvar:', err)
      toast.error('Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    navigate('/profile') // Voltar para perfil/histórico
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !productId) return

    try {
      setUploadingImage(true)
      const updated = await exportHistoryAPI.updateProductImage(parseInt(productId), file)
      setProduct(updated)
      toast.success('Imagem atualizada com sucesso')
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      toast.error('Erro ao atualizar imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddVariantField = (variantId: number) => {
    setVariants(variants.map(v =>
      v.id === variantId
        ? { ...v, fields: [...v.fields, { key: '', value: '' }] }
        : v
    ))
  }

  const handleRemoveVariantField = (variantId: number, fieldIndex: number) => {
    setVariants(variants.map(v =>
      v.id === variantId
        ? { ...v, fields: v.fields.filter((_, idx) => idx !== fieldIndex) }
        : v
    ))
  }

  const handleVariantFieldChange = (variantId: number, fieldIndex: number, field: 'key' | 'value', value: string) => {
    setVariants(variants.map(v =>
      v.id === variantId
        ? {
            ...v,
            fields: v.fields.map((f, idx) =>
              idx === fieldIndex ? { ...f, [field]: value } : f
            )
          }
        : v
    ))
  }

  const toggleVariantEdit = (variantId: number) => {
    setVariants(variants.map(v =>
      v.id === variantId ? { ...v, editing: !v.editing } : v
    ))
  }

  const handleSaveCompany = async () => {
    if (!product?.upload_id) return

    setSavingCompany(true)
    try {
      await exportHistoryAPI.linkCompany(product.upload_id, companyName)
      setIsEditingCompany(false)
      toast.success('Nome da empresa atualizado')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar empresa')
    } finally {
      setSavingCompany(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400 font-light">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-light text-gray-900 dark:text-gray-100">
                  Editar Produto
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  {!isEditingCompany ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-light text-gray-600 dark:text-gray-400">
                          {companyName || 'Nenhuma empresa vinculada'}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsEditingCompany(true)}
                        className="text-xs font-light text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                      >
                        Editar
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nome da empresa"
                        className="border-gray-300 dark:border-gray-700 rounded-sm h-8 w-48 text-sm font-light"
                      />
                      <Button
                        onClick={handleSaveCompany}
                        disabled={savingCompany}
                        size="sm"
                        className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-8 px-2 rounded-sm"
                      >
                        {savingCompany ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditingCompany(false)
                          setCompanyName(product?.company_name || '')
                        }}
                        variant="outline"
                        size="sm"
                        className="border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 h-8 px-2 rounded-sm"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-10 rounded-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda - Imagem */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-6">
              <h2 className="text-sm font-light text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
                Imagem do Produto
              </h2>

              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden group">
                {product?.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.description || product.code || 'Produto'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-24 w-24 text-gray-400 dark:text-gray-600" />
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Upload className={`h-8 w-8 ${uploadingImage ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-light">
                      {uploadingImage ? 'Enviando...' : 'Alterar imagem'}
                    </span>
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Coluna direita - Dados do produto */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações básicas */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-6">
              <h2 className="text-sm font-light text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
                Informações do Produto
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-light text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
                    Código
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="border-gray-300 dark:border-gray-700 rounded-sm h-10 text-sm font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-sm text-sm font-light focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-light text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
                      Cubagem
                    </label>
                    <Input
                      value={formData.cubic}
                      onChange={(e) => setFormData({ ...formData, cubic: e.target.value })}
                      className="border-gray-300 dark:border-gray-700 rounded-sm h-10 text-sm font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-light text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
                      Peso
                    </label>
                    <Input
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="border-gray-300 dark:border-gray-700 rounded-sm h-10 text-sm font-light"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-light text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
                    NCM
                  </label>
                  <Input
                    value={formData.ncm}
                    onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                    className="border-gray-300 dark:border-gray-700 rounded-sm h-10 text-sm font-light"
                  />
                </div>
              </div>
            </div>

            {/* Variantes */}
            {variants.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-6">
                <h2 className="text-sm font-light text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
                  Variantes ({variants.length})
                </h2>

                <div className="space-y-4">
                  {variants.map((variant, variantIdx) => (
                    <div
                      key={variant.id}
                      className="border border-gray-200 dark:border-gray-800 rounded-sm p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Variante {variantIdx + 1}
                        </h3>
                        <Button
                          onClick={() => toggleVariantEdit(variant.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm h-8"
                        >
                          {variant.editing ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Salvar
                            </>
                          ) : (
                            <>
                              <Edit2 className="h-3 w-3 mr-1" />
                              Editar
                            </>
                          )}
                        </Button>
                      </div>

                      {!variant.editing ? (
                        <div className="space-y-2">
                          {variant.fields.map((field, fieldIdx) => (
                            <div key={fieldIdx} className="flex items-center gap-2">
                              <span className="text-xs font-light text-gray-600 dark:text-gray-400">
                                {field.key}:
                              </span>
                              <span className="text-sm font-light text-gray-900 dark:text-gray-100">
                                {field.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {variant.fields.map((field, fieldIdx) => (
                            <div key={fieldIdx} className="flex gap-2">
                              <Input
                                placeholder="Campo"
                                value={field.key}
                                onChange={(e) => handleVariantFieldChange(variant.id, fieldIdx, 'key', e.target.value)}
                                className="border-gray-300 dark:border-gray-700 rounded-sm h-9 text-sm font-light"
                              />
                              <Input
                                placeholder="Valor"
                                value={field.value}
                                onChange={(e) => handleVariantFieldChange(variant.id, fieldIdx, 'value', e.target.value)}
                                className="border-gray-300 dark:border-gray-700 rounded-sm h-9 text-sm font-light"
                              />
                              <Button
                                onClick={() => handleRemoveVariantField(variant.id, fieldIdx)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm h-9 w-9 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}

                          <Button
                            onClick={() => handleAddVariantField(variant.id)}
                            variant="outline"
                            size="sm"
                            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-sm h-9"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar campo
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
