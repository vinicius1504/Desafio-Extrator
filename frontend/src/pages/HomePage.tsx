/**
 * HomePage - Design moderno e atraente
 */

import { Link } from 'react-router-dom'
import { Button, AnimatedPage, AnimatedCard } from '@/components/ui'
import { motion } from 'framer-motion'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
}

export function HomePage() {
  return (
    <AnimatedPage className="min-h-[calc(100vh-200px)]">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-gray-900 rounded-3xl shadow-2xl mb-12"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>

        <div className="relative z-10 px-8 py-16 lg:py-24 lg:px-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Processamento Inteligente de Planilhas</span>
            </motion.div>

            {/* Título */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Transforme suas planilhas em dados estruturados
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              variants={itemVariants}
              className="text-xl lg:text-2xl text-blue-100 dark:text-blue-200 mb-10 leading-relaxed max-w-3xl mx-auto"
            >
              Importe, mapeie e exporte seus dados de forma rápida, segura e eficiente
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={itemVariants}>
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
            </motion.div>

            {/* Mini illustration */}
            <motion.div
              variants={itemVariants}
              className="mt-12 flex justify-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -4 }}
                className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <FileSpreadsheet className="h-8 w-8" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, y: -4 }}
                className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <Database className="h-8 w-8" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, y: -4 }}
                className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <Download className="h-8 w-8" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Como Funciona - 4 Steps */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="mb-16"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Como Funciona
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Apenas 4 passos simples para processar suas planilhas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <AnimatedCard index={0} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500">
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
          </AnimatedCard>

          {/* Step 2 */}
          <AnimatedCard index={1} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500">
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
          </AnimatedCard>

          {/* Step 3 */}
          <AnimatedCard index={2} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500">
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
          </AnimatedCard>

          {/* Step 4 */}
          <AnimatedCard index={3} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500">
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
          </AnimatedCard>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="grid lg:grid-cols-2 gap-8 mb-16"
      >
        {/* Formatos Suportados */}
        <AnimatedCard index={0} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-gray-700">
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
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
              >
                <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{format}</span>
              </motion.li>
            ))}
          </ul>
        </AnimatedCard>

        {/* Recursos */}
        <AnimatedCard index={1} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 shadow-lg border border-purple-200 dark:border-gray-700">
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
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
              >
                <div className="w-6 h-6 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </AnimatedCard>
      </motion.section>

      {/* CTA Final */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-10 lg:p-16 shadow-2xl text-center"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
          >
            <Shield className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Seguro e Confiável</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-white mb-4"
          >
            Pronto para começar?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 mb-8"
          >
            Faça upload do seu arquivo e comece o processo de extração agora mesmo
          </motion.p>

          <motion.div variants={itemVariants}>
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
          </motion.div>
        </div>
      </motion.section>
    </AnimatedPage>
  )
}
