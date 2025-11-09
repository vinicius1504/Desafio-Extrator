/**
 * HomePage - Design moderno com upload integrado
 */

import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Alert, Button, Input } from '@/components/ui'
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  Download,
  ArrowRight,
  Link as LinkIcon,
  X,
  Loader2
} from 'lucide-react'
import { useUpload } from '@/hooks'
import { FILE_VALIDATION } from '@/constants'

export function HomePage() {
  const navigate = useNavigate()
  const { uploading, error, uploadFile, setError } = useUpload()
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      const uploadId = await uploadFile(file)

      if (uploadId) {
        navigate(`/mapping/${uploadId}`)
      }
    },
    [uploadFile, navigate]
  )

  const handleGoogleSheetsUpload = async () => {
    if (!googleSheetsUrl.trim()) {
      setError('Por favor, insira a URL do Google Sheets')
      return
    }

    if (!googleSheetsUrl.includes('docs.google.com/spreadsheets')) {
      setError('URL inválida. Por favor, insira um link válido do Google Sheets')
      return
    }

    const uploadId = await uploadFile(null, googleSheetsUrl)

    if (uploadId) {
      navigate(`/mapping/${uploadId}`)
    }
  }

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
    disabled: uploading || showUrlInput,
  })

  return (
    <div className="min-h-[calc(100vh-200px)] space-y-32">
      {/* Hero + Upload Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Título */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
              Processamento <span className="font-semibold">Inteligente</span>
              <br />
              de Planilhas
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
              Extraia, transforme e exporte dados com IA
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert type="error" closable onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Upload Area */}
          {!showUrlInput ? (
            <div className="max-w-2xl mx-auto">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-sm p-16 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragActive
                    ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-800'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                  }
                  ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getInputProps()} />
                <div className="space-y-6">
                  <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-sm flex items-center justify-center">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 text-gray-900 dark:text-gray-100 animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-900 dark:text-gray-100" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg text-gray-900 dark:text-gray-100 font-light">
                      {uploading
                        ? 'Processando arquivo...'
                        : isDragActive
                          ? 'Solte o arquivo aqui'
                          : 'Arraste um arquivo ou clique para selecionar'
                      }
                    </p>
                    {!uploading && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Formatos: Excel (.xlsx, .xls), CSV (.csv) ou ODS (.ods)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Google Sheets Option */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowUrlInput(true)}
                  disabled={uploading}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Ou importe do Google Sheets
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light text-gray-900 dark:text-gray-100">
                  Importar do Google Sheets
                </h3>
                <button
                  onClick={() => {
                    setShowUrlInput(false)
                    setGoogleSheetsUrl('')
                    setError(null)
                  }}
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <Input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={googleSheetsUrl}
                onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                disabled={uploading}
                className="w-full"
              />

              <Button
                onClick={handleGoogleSheetsUpload}
                disabled={uploading || !googleSheetsUrl.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-12 rounded-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    Importar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {/* Feature 1 */}
            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-sm">
                <Sparkles className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </div>
              <h3 className="text-xl font-light text-gray-900 dark:text-gray-100">
                Detecção Automática
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                IA identifica automaticamente todas as colunas da sua planilha
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-sm">
                <FileSpreadsheet className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </div>
              <h3 className="text-xl font-light text-gray-900 dark:text-gray-100">
                Múltiplas Abas
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Processe planilhas complexas com múltiplas abas e estruturas
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-sm">
                <Download className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </div>
              <h3 className="text-xl font-light text-gray-900 dark:text-gray-100">
                Exportação Flexível
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Exporte em JSON, CSV ou XML mantendo nomes originais
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-32">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-gray-100 mb-16 text-center">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="w-12 flex-shrink-0">
                <span className="text-sm font-mono text-gray-400 dark:text-gray-600">01</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-light text-gray-900 dark:text-gray-100">
                  Upload
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Envie sua planilha Excel, CSV ou ODS
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="w-12 flex-shrink-0">
                <span className="text-sm font-mono text-gray-400 dark:text-gray-600">02</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-light text-gray-900 dark:text-gray-100">
                  Análise com IA
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Gemini detecta colunas e tipos automaticamente
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="w-12 flex-shrink-0">
                <span className="text-sm font-mono text-gray-400 dark:text-gray-600">03</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-light text-gray-900 dark:text-gray-100">
                  Processamento
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Dados extraídos e organizados dinamicamente
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="w-12 flex-shrink-0">
                <span className="text-sm font-mono text-gray-400 dark:text-gray-600">04</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-light text-gray-900 dark:text-gray-100">
                  Exportação
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Baixe no formato desejado com nomes originais
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
