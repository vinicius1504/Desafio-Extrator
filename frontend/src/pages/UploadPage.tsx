/**
 * Página de upload de planilhas - Design Moderno
 * Suporta upload de arquivos e importação do Google Sheets
 */

import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Alert, Button, Input } from '@/components/ui'
import { Upload, FileSpreadsheet, CheckCircle, File, AlertCircle, Sparkles, Zap, Link as LinkIcon, X } from 'lucide-react'
import { useUpload } from '@/hooks'
import { FILE_VALIDATION } from '@/constants'

export function UploadPage() {
  const navigate = useNavigate()
  const { uploading, progress, error, uploadedFile, uploadFile, setError } = useUpload()
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('')

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

  const handleGoogleSheetsUpload = async () => {
    if (!googleSheetsUrl.trim()) {
      setError('Por favor, insira a URL do Google Sheets')
      return
    }

    // Validar se é uma URL do Google Sheets
    if (!googleSheetsUrl.includes('docs.google.com/spreadsheets')) {
      setError('URL inválida. Por favor, insira um link válido do Google Sheets')
      return
    }

    const uploadId = await uploadFile(null, googleSheetsUrl)

    if (uploadId) {
      // Navegar para página de mapeamento
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

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant={!showUrlInput ? 'primary' : 'outline'}
          onClick={() => {
            setShowUrlInput(false)
            setGoogleSheetsUrl('')
            setError(null)
          }}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload de Arquivo
        </Button>
        <Button
          variant={showUrlInput ? 'primary' : 'outline'}
          onClick={() => {
            setShowUrlInput(true)
            setError(null)
          }}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          Google Sheets
        </Button>
      </div>

      {/* Upload Area or URL Input */}
      {!showUrlInput ? (
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
      ) : (
        /* Google Sheets URL Input */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center shadow-lg">
              <LinkIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>

            <div className="space-y-3 text-center max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Importar do Google Sheets
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Cole o link da sua planilha do Google Sheets abaixo
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2 justify-center">
                <AlertCircle className="h-4 w-4" />
                A planilha precisa estar pública ou com permissão "Qualquer pessoa com o link pode visualizar"
              </p>
            </div>

            <div className="w-full max-w-2xl space-y-4">
              <div className="relative">
                <Input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={googleSheetsUrl}
                  onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                  disabled={uploading}
                  className="pr-10"
                />
                {googleSheetsUrl && !uploading && (
                  <button
                    onClick={() => setGoogleSheetsUrl('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                onClick={handleGoogleSheetsUpload}
                disabled={uploading || !googleSheetsUrl.trim()}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Importando... {progress}%
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Importar Planilha
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar para Google Sheets */}
            {uploading && (
              <div className="w-full max-w-2xl">
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Como obter o link */}
            <div className="w-full max-w-2xl mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Como obter o link do Google Sheets?
              </h3>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Abra sua planilha no Google Sheets</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Clique em "Compartilhar" no canto superior direito</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Em "Acesso geral", selecione "Qualquer pessoa com o link"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Copie o link e cole aqui</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

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
