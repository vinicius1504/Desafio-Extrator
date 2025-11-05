/**
 * Página de Login - Split Screen Design
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Alert } from '@/components/ui'
import { Eye, EyeOff, Sun, Moon, FileSpreadsheet, BarChart3, Upload, Download } from 'lucide-react'
import { useAuth, useDarkMode } from '@/hooks'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark, toggle: toggleDarkMode } = useDarkMode()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username || !password) {
      setError('Preencha todos os campos')
      return
    }

    try {
      setLoading(true)
      await login({ username, password })
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col lg:flex-row">
      {/* Left Side - Illustration & Info */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-gray-900 flex-col justify-center items-center text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mb-32 -mr-32"></div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -mt-24 -ml-24"></div>

        {/* Content */}
        <div className="relative z-10 px-12 py-8 w-full max-w-md space-y-6">
          {/* Illustration */}
          <div className="flex justify-center mb-6">
            <div className="relative w-72 h-56">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Computer/Dashboard */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-64 h-44 border-2 border-white/30 shadow-xl">
                    <div className="flex items-end justify-around h-full gap-3">
                      <div className="bg-blue-200 dark:bg-blue-300 w-10 h-16 rounded-t shadow-md"></div>
                      <div className="bg-blue-200 dark:bg-blue-300 w-10 h-24 rounded-t shadow-md"></div>
                      <div className="bg-blue-200 dark:bg-blue-300 w-10 h-12 rounded-t shadow-md"></div>
                      <div className="bg-blue-200 dark:bg-blue-300 w-10 h-20 rounded-t shadow-md"></div>
                    </div>
                  </div>

                  {/* Person */}
                  <div className="absolute -bottom-6 -left-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-300 to-blue-400 dark:from-blue-400 dark:to-blue-500 rounded-full shadow-lg"></div>
                    <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 rounded-lg mt-1 mx-auto shadow-lg"></div>
                  </div>

                  {/* Floating icon */}
                  <div className="absolute -top-6 -right-6 bg-white/20 backdrop-blur-sm p-3 rounded-xl border-2 border-white/40 shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                    <FileSpreadsheet className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-5">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight">
                Extrator de Planilhas
              </h1>
              <p className="text-blue-100 dark:text-blue-200 text-lg leading-relaxed">
                Gerencie e processe suas planilhas Excel de forma simples e eficiente
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-white/30">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                  <Upload className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium text-blue-100">Upload</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium text-blue-100">Análise</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                  <Download className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium text-blue-100">Exportar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 relative bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 lg:p-12">
        {/* Theme Toggle - Top Right Corner */}
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-600" />
            )}
          </button>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Olá!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Faça login para continuar
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <Alert type="error" title="Erro" closable onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Usuário
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    className="h-12 pr-12 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
