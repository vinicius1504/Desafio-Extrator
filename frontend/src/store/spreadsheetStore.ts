import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SpreadsheetUpload, SpreadsheetPreview, ColumnMapping, Product } from '@/types'

interface SpreadsheetState {
  // Upload atual
  currentUpload: SpreadsheetUpload | null
  preview: SpreadsheetPreview | null
  columnMapping: ColumnMapping | null
  products: Product[]

  // Loading states
  uploading: boolean
  loadingPreview: boolean
  loadingMapping: boolean
  loadingProducts: boolean

  // Errors
  error: string | null

  // Actions
  setCurrentUpload: (upload: SpreadsheetUpload | null) => void
  setPreview: (preview: SpreadsheetPreview | null) => void
  setColumnMapping: (mapping: ColumnMapping | null) => void
  setProducts: (products: Product[]) => void
  setUploading: (uploading: boolean) => void
  setLoadingPreview: (loading: boolean) => void
  setLoadingMapping: (loading: boolean) => void
  setLoadingProducts: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  currentUpload: null,
  preview: null,
  columnMapping: null,
  products: [],
  uploading: false,
  loadingPreview: false,
  loadingMapping: false,
  loadingProducts: false,
  error: null,
}

export const useSpreadsheetStore = create<SpreadsheetState>()(
  devtools(
    (set) => ({
      ...initialState,

      setCurrentUpload: (upload) => set({ currentUpload: upload }),
      setPreview: (preview) => set({ preview }),
      setColumnMapping: (mapping) => set({ columnMapping: mapping }),
      setProducts: (products) => set({ products }),
      setUploading: (uploading) => set({ uploading }),
      setLoadingPreview: (loading) => set({ loadingPreview: loading }),
      setLoadingMapping: (loading) => set({ loadingMapping: loading }),
      setLoadingProducts: (loading) => set({ loadingProducts: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    { name: 'SpreadsheetStore' }
  )
)
