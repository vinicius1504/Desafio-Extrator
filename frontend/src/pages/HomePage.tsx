/**
 * HomePage - Design moderno e atraente
 */

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import {
  Upload,
  FileSpreadsheet,
  Database,
  Download,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react'

export function HomePage() {
  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-gray-900 rounded-3xl shadow-2xl mb-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>

        <div className="relative z-10 px-8 py-16 lg:py-24 lg:px-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Processamento Inteligente de Planilhas</span>
            </div>

            {/* Título */}
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Transforme suas planilhas em dados estruturados
            </h1>

            {/* Subtítulo */}
            <p className="text-xl lg:text-2xl text-blue-100 dark:text-blue-200 mb-10 leading-relaxed max-w-3xl mx-auto">
              Importe, mapeie e exporte seus dados de forma rápida, segura e eficiente
            </p>

            {/* CTA Button */}
            <Link to="/upload">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-gray-50 dark:bg-white dark:text-blue-800 dark:hover:bg-gray-50 h-14 px-8 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <Upload className="h-5 w-5 mr-3" />
                Começar Agora
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </Link>

            {/* Mini illustration */}
            <div className="mt-12 flex justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Database className="h-8 w-8" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Download className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona - 4 Steps */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Como Funciona
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Apenas 4 passos simples para processar suas planilhas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
              1
            </div>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Upload</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Faça upload da sua planilha Excel, CSV ou ODS
            </p>
          </div>

          {/* Step 2 */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-600 dark:bg-green-500 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
              2
            </div>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Mapeamento</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Mapeie as colunas da planilha de forma intuitiva
            </p>
          </div>

          {/* Step 3 */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 dark:bg-purple-500 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
              3
            </div>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Processamento</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Extraia e organize os dados automaticamente
            </p>
          </div>

          {/* Step 4 */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-orange-600 dark:bg-orange-500 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
              4
            </div>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Download className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Export</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Exporte seus dados em JSON, CSV ou XML
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid lg:grid-cols-2 gap-8 mb-16">
        {/* Formatos Suportados */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Formatos Suportados
            </h3>
          </div>
          <ul className="space-y-3">
            {[
              'Excel (.xlsx, .xls)',
              'CSV (.csv)',
              'OpenDocument (.ods)',
            ].map((format, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{format}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recursos */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 shadow-lg border border-purple-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 dark:bg-purple-500 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Recursos Principais
            </h3>
          </div>
          <ul className="space-y-3">
            {[
              'Mapeamento flexível de colunas',
              'Múltiplas colunas de preço',
              'Export em vários formatos',
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-6 h-6 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-10 lg:p-16 shadow-2xl text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Shield className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Seguro e Confiável</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Faça upload do seu arquivo e comece o processo de extração agora mesmo
          </p>

          <Link to="/upload">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 h-14 px-10 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Upload className="h-5 w-5 mr-3" />
              Fazer Upload Agora
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
