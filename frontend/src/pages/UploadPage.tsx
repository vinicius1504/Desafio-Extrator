/**
 * Página de upload de planilhas - Design Moderno
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Alert } from '@/components/ui'
import { Upload, FileSpreadsheet, CheckCircle, File, AlertCircle, Sparkles, Zap } from 'lucide-react'
import { useUpload } from '@/hooks'
import { FILE_VALIDATION } from '@/constants'

export function UploadPage() {
  const navigate = useNavigate()
  const { uploading, progress, error, uploadedFile, uploadFile, setError } = useUpload()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      const uploadId = await uploadFile(file)

      if (uploadId) {
        // Navegar para página de mapeamento
        navigate(`/mapping/${uploadId}`)
      }
    },
    [uploadFile, navigate]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
    },
    maxFiles: 1,
    maxSize: FILE_VALIDATION.MAX_FILE_SIZE,
    disabled: uploading,
  })

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-4">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Processamento Rápido</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Upload de Planilha</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Faça upload de uma planilha Excel, CSV ou ODS para começar o processamento
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Erro" closable onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div
          {...getRootProps()}
          className={`
            relative p-12 lg:p-16 text-center cursor-pointer transition-all duration-300
            border-4 border-dashed rounded-2xl m-6
            ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                : uploading
                ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-900/50'
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-6">
            {uploading ? (
              <>
                {/* Uploading State */}
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Upload className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-bounce" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3 w-full max-w-md">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fazendo upload...</p>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{progress}%</p>
                </div>
              </>
            ) : uploadedFile ? (
              <>
                {/* Success State */}
                <div className="relative">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload concluído!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 justify-center">
                    <File className="h-4 w-4" />
                    {uploadedFile.name}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Initial State */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center shadow-lg">
                    <FileSpreadsheet className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  {isDragActive && (
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {isDragActive ? 'Solte o arquivo aqui!' : 'Arraste ou clique para selecionar'}
                  </p>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Formatos aceitos: <span className="font-semibold">.xlsx, .xls, .csv, .ods</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Tamanho máximo: {FILE_VALIDATION.MAX_FILE_SIZE / 1024 / 1024}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Formatos Suportados */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Formatos Aceitos
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
              <span>Excel 2007+ (.xlsx)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
              <span>Excel 97-2003 (.xls)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
              <span>CSV (.csv)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
              <span>OpenDocument (.ods)</span>
            </li>
          </ul>
        </div>

        {/* Dicas */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-600 dark:bg-amber-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Dicas Importantes
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Use dados tabulares organizados</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Primeira linha como cabeçalho</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Evite células mescladas</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Sem linhas/colunas vazias no meio</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
