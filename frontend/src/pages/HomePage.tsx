import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { Upload, FileSpreadsheet, Database, Download } from 'lucide-react'

export function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Bem-vindo ao Extrator de Planilhas
        </h1>
        <p className="text-xl text-gray-600">
          Importe, mapeie e processe suas planilhas de forma eficiente
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Upload</h3>
              <p className="text-sm text-gray-600">
                Faça upload da sua planilha Excel ou CSV
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">2. Mapeamento</h3>
              <p className="text-sm text-gray-600">
                Mapeie as colunas da sua planilha
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Database className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">3. Processamento</h3>
              <p className="text-sm text-gray-600">
                Extraia e organize os dados automaticamente
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Download className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">4. Export</h3>
              <p className="text-sm text-gray-600">
                Exporte em JSON, CSV ou XML
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comece Agora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-gray-600 flex-1">
              Pronto para processar suas planilhas? Faça upload do seu arquivo e comece o processo de extração.
            </p>
            <Link to="/upload" className="shrink-0">
              <Button size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Fazer Upload
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Formatos Suportados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Excel (.xlsx, .xls)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>CSV (.csv)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>OpenDocument (.ods)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recursos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Mapeamento flexível de colunas</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Múltiplas colunas de preço</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Export em vários formatos</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
