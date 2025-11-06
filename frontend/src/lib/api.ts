import axios from 'axios'
import type { SpreadsheetUpload, SpreadsheetPreview, ColumnMapping, MappingData, Product, ExportFormat } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Interceptor para adicionar token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para refresh token automático
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Se erro 401 e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          localStorage.setItem('access_token', access)

          originalRequest.headers.Authorization = `Bearer ${access}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Token refresh falhou, limpar tudo e redirecionar para login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Spreadsheet API
export const spreadsheetAPI = {
  uploadFile: async (file: File): Promise<SpreadsheetUpload> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<SpreadsheetUpload>('/uploads/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  uploadFromGoogleSheets: async (url: string): Promise<SpreadsheetUpload> => {
    const response = await apiClient.post<SpreadsheetUpload>('/uploads/', {
      google_sheets_url: url
    })
    return response.data
  },

  getUploads: async (): Promise<SpreadsheetUpload[]> => {
    const response = await apiClient.get<SpreadsheetUpload[]>('/uploads/')
    return response.data
  },

  getUpload: async (uploadId: number): Promise<SpreadsheetUpload> => {
    const response = await apiClient.get<SpreadsheetUpload>(`/uploads/${uploadId}/`)
    return response.data
  },

  getPreview: async (uploadId: number): Promise<SpreadsheetPreview> => {
    const response = await apiClient.get<SpreadsheetPreview>(`/uploads/${uploadId}/preview/`)
    return response.data
  },

  processSpreadsheet: async (uploadId: number): Promise<{
    success: boolean
    message: string
    statistics: {
      total_rows: number
      rows_processed: number
      products_created: number
      variants_created: number
      rows_skipped: number
      errors_count: number
    }
    warnings?: string[]
  }> => {
    const response = await apiClient.post(`/uploads/${uploadId}/process/`)
    return response.data
  },

  deleteUpload: async (uploadId: number): Promise<void> => {
    await apiClient.delete(`/uploads/${uploadId}/`)
  },
}

// Column Mapping API
export const columnMappingAPI = {
  createMapping: async (mappingData: MappingData): Promise<ColumnMapping> => {
    const response = await apiClient.post<ColumnMapping>('/mappings/create_or_update/', mappingData)
    return response.data
  },

  getMappingByUpload: async (uploadId: number): Promise<ColumnMapping> => {
    const response = await apiClient.get<ColumnMapping[]>(`/mappings/?upload=${uploadId}`)
    // A API retorna um array, pegamos o primeiro elemento
    if (response.data && response.data.length > 0) {
      return response.data[0]
    }
    throw new Error('Nenhum mapeamento encontrado')
  },

  updateMapping: async (mappingId: number, mappingData: MappingData): Promise<ColumnMapping> => {
    const response = await apiClient.put<ColumnMapping>(`/mappings/${mappingId}/`, mappingData)
    return response.data
  },

  deleteMapping: async (mappingId: number): Promise<void> => {
    await apiClient.delete(`/mappings/${mappingId}/`)
  },
}

// Products API
export const productsAPI = {
  getProductsByUpload: async (uploadId: number): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(`/products/?upload_id=${uploadId}`)
    return response.data
  },

  getProduct: async (productId: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${productId}/`)
    return response.data
  },

  exportProducts: async (uploadId: number, format: ExportFormat = 'json'): Promise<Blob> => {
    try {
      // Para CSV e XML, usar o endpoint /download/
      // Para JSON, usar o endpoint /export/
      const endpoint = format === 'json'
        ? `/uploads/${uploadId}/export/?format=${format}`
        : `/uploads/${uploadId}/download/?format=${format}`

      const response = await apiClient.get(endpoint, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      // Se for um erro 500, tentar ler a resposta do blob
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text()
        console.error('Erro do servidor (500):', text)
        try {
          const errorData = JSON.parse(text)
          throw new Error(errorData.error || 'Erro ao exportar dados')
        } catch {
          throw new Error(text || 'Erro ao exportar dados')
        }
      }
      throw error
    }
  },
}

// Authentication API
export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  last_activity: string | null
}

export interface AuthResponse {
  user: User
  access: string
  refresh: string
  message: string
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login/`, credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<{ user: User; message: string }> => {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, data)
    return response.data
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout/', { refresh: refreshToken })
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile/')
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<User>('/auth/profile/', data)
    return response.data
  },

  changePassword: async (data: {
    old_password: string
    new_password: string
    new_password_confirm: string
  }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/change-password/', data)
    return response.data
  },

  checkSession: async (): Promise<{ valid: boolean; user: User; message?: string }> => {
    const response = await apiClient.get('/auth/check-session/')
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
      refresh: refreshToken,
    })
    return response.data
  },
}

// Admin User Management API
export const adminAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<any>('/auth/users/')
    // A API retorna um objeto paginado: {count, next, previous, results}
    // Precisamos extrair apenas o array 'results'
    return response.data.results || response.data
  },

  createUser: async (data: RegisterData & { is_admin?: boolean }): Promise<{ user: User; message: string }> => {
    const response = await apiClient.post('/auth/users/create/', data)
    return response.data
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/auth/users/${userId}/`)
    return response.data
  },

  updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<User>(`/auth/users/${userId}/`, data)
    return response.data
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/auth/users/${userId}/`)
  },

  toggleUserActive: async (userId: number): Promise<{ message: string; user: User }> => {
    const response = await apiClient.post(`/auth/users/${userId}/toggle-active/`)
    return response.data
  },
}
