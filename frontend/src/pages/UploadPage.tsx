import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Card, CardHeader, CardTitle, CardContent, Button, Alert } from '@/components/ui'
import { Upload, File, CheckCircle2 } from 'lucide-react'
import { useSpreadsheetStore } from '@/store/spreadsheetStore'
import { spreadsheetAPI } from '@/lib/api'

export function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const { uploading, error, setUploading, setError, setCurrentUpload } = useSpreadsheetStore()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
        setError(null)
      }
    },
  })

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const upload = await spreadsheetAPI.uploadFile(file)
      setCurrentUpload(upload)
      setFile(null)
      // Redirecionar para página de mapeamento
      navigate(`/mapping/${upload.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload do arquivo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload de Planilha</h1>
        <p className="text-gray-600">
          Faça upload da sua planilha para começar o processo de extração
        </p>
      </div>

      {error && (
        <Alert type="error" title="Erro no Upload" closable onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Selecione um Arquivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>
              {isDragActive ? (
                <p className="text-lg font-medium text-primary-600">
                  Solte o arquivo aqui
                </p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700">
                    Arraste e solte seu arquivo aqui
                  </p>
                  <p className="text-sm text-gray-500">
                    ou clique para selecionar
                  </p>
                </>
              )}
              <p className="text-xs text-gray-400">
                Formatos suportados: .xlsx, .xls, .csv, .ods
              </p>
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <File className="h-8 w-8 text-primary-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              isLoading={uploading}
              size="lg"
              className="flex-1"
            >
              {uploading ? 'Enviando...' : 'Fazer Upload'}
            </Button>
            {file && (
              <Button
                onClick={() => setFile(null)}
                variant="outline"
                size="lg"
                disabled={uploading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal list-inside text-gray-600">
            <li>Selecione ou arraste sua planilha para a área acima</li>
            <li>Aguarde o upload ser concluído</li>
            <li>Você será redirecionado para a página de mapeamento de colunas</li>
            <li>Configure o mapeamento das colunas conforme necessário</li>
            <li>Visualize e exporte os dados processados</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
