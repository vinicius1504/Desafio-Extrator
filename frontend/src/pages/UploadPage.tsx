/**
 * Página de upload de planilhas - REFATORADA
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui'
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react'
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload de Planilha</h1>
        <p className="text-gray-600">
          Faça upload de uma planilha Excel (.xlsx, .xls), CSV ou ODS para começar
        </p>
      </div>

      {error && (
        <Alert type="error" title="Erro" closable onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Selecione um arquivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4">
              {uploading ? (
                <>
                  <Upload className="h-16 w-16 text-primary-500 animate-bounce" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">Fazendo upload...</p>
                    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">{progress}%</p>
                  </div>
                </>
              ) : uploadedFile ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload concluído!</p>
                    <p className="text-sm text-gray-500 mt-1">{uploadedFile.name}</p>
                  </div>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-16 w-16 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive
                        ? 'Solte o arquivo aqui'
                        : 'Arraste um arquivo ou clique para selecionar'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Formatos aceitos: .xlsx, .xls, .csv, .ods
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tamanho máximo: {FILE_VALIDATION.MAX_FILE_SIZE / 1024 / 1024}MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Dicas:</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Certifique-se de que a planilha contém dados tabulares</li>
              <li>A primeira linha pode ser usada como cabeçalho</li>
              <li>Evite células mescladas e formatação complexa</li>
              <li>Verifique se não há linhas ou colunas vazias no meio dos dados</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
