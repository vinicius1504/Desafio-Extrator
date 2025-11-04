/**
 * Utilitários para formatação de dados
 */

/**
 * Formata um preço com segurança
 * @param price - Preço a ser formatado (pode ser number ou string)
 * @returns Preço formatado como string com 2 casas decimais
 */
export function formatPrice(price: any): string {
  if (typeof price === 'number') {
    return price.toFixed(2)
  }
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) {
    return '0.00'
  }
  return numPrice.toFixed(2)
}

/**
 * Formata peso adicionando unidade
 * @param weight - Peso em kg
 * @returns Peso formatado com unidade
 */
export function formatWeight(weight: number | string | null | undefined): string {
  if (!weight) return '-'
  return `${weight}kg`
}

/**
 * Formata cubagem adicionando unidade
 * @param cubic - Cubagem em m³
 * @returns Cubagem formatada com unidade
 */
export function formatCubic(cubic: number | string | null | undefined): string {
  if (!cubic) return '-'
  return `${cubic}m³`
}

/**
 * Formata dimensões
 * @param dimensions - Dimensões do produto
 * @returns Dimensões formatadas
 */
export function formatDimensions(dimensions: string | null | undefined): string {
  if (!dimensions) return '-'
  return dimensions
}

/**
 * Formata um objeto de preços para string
 * @param prices - Objeto com preços nomeados
 * @returns String formatada com todos os preços
 */
export function formatPrices(prices: Record<string, number> | null | undefined): string {
  if (!prices || Object.keys(prices).length === 0) return '-'

  return Object.entries(prices)
    .map(([name, price]) => `${name}: R$ ${formatPrice(price)}`)
    .join(', ')
}

/**
 * Formata um array de preços para exibição
 * @param prices - Objeto com preços nomeados
 * @returns Array de strings formatadas
 */
export function formatPricesArray(prices: Record<string, number> | null | undefined): string[] {
  if (!prices || Object.keys(prices).length === 0) return []

  return Object.entries(prices)
    .map(([name, price]) => `${name}: R$ ${formatPrice(price)}`)
}

/**
 * Trunca texto longo
 * @param text - Texto a ser truncado
 * @param maxLength - Comprimento máximo
 * @returns Texto truncado com reticências se necessário
 */
export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Formata número de linhas
 * @param count - Número de linhas
 * @returns String formatada
 */
export function formatCount(count: number): string {
  if (count === 0) return 'Nenhum'
  if (count === 1) return '1'
  return count.toLocaleString('pt-BR')
}
