# 🤖 Integração com Google Gemini AI

## Visão Geral

O sistema agora conta com análise inteligente de colunas usando **Google Gemini AI**, que identifica automaticamente o tipo de cada coluna em planilhas (preço, descrição, código, peso, etc.).

## 🎯 Benefícios

### Antes (Método Tradicional - Fuzzy Matching)
- ❌ Limitado a nomes de colunas conhecidos
- ❌ Dificuldade com nomes customizados ("VL UNIT", "Desc. Produto")
- ❌ Baixa precisão com planilhas não-padrão
- ❌ Requer configuração manual frequente

### Agora (Com Gemini AI)
- ✅ **Funciona com qualquer formato de planilha**
- ✅ **Identifica nomes customizados automaticamente**
- ✅ **Detecta múltiplas colunas de preço** (Atacado, Varejo, etc.)
- ✅ **Entende contexto**, não apenas nome da coluna
- ✅ **Aprende com dados reais** da planilha
- ✅ **Fallback automático** para método tradicional se IA falhar

## 📋 Pré-requisitos

### 1. Obter API Key do Google Gemini

1. Acesse: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 2. Configurar no Projeto

Adicione a API key no arquivo `.env`:

```env
# Google Gemini AI Configuration
GEMINI_API_KEY=sua-api-key-aqui
```

**⚠️ IMPORTANTE:**
- Nunca commite a API key no git
- Use `.env` local (não commitado)
- Para produção, configure via variáveis de ambiente

## 🚀 Como Funciona

### Fluxo Automático

```
1. Upload da Planilha
   ↓
2. Sistema tenta usar Gemini AI
   ├─ Se API key configurada → Análise com IA
   ├─ Se IA falhar → Fallback para método tradicional
   └─ Sem API key → Método tradicional
   ↓
3. Retorna mapeamento inteligente
```

### O que a IA Analisa

1. **Nomes das Colunas (Headers)**
   - Identifica padrões e variações
   - Entende abreviações e siglas

2. **Conteúdo das Células (Amostra de 10 linhas)**
   - Analisa formato dos dados
   - Identifica padrões numéricos
   - Detecta estruturas especiais (NCM, dimensões, etc.)

3. **Contexto Geral**
   - Relaciona colunas entre si
   - Identifica múltiplos preços automaticamente

## 📡 API Endpoints

### 1. Sugestão Automática (com IA)

```http
GET /api/uploads/{id}/suggest_mapping/
```

**Resposta:**
```json
{
  "success": true,
  "message": "Mapeamento sugerido com sucesso",
  "analysis_method": "gemini_ai",  // ou "traditional"
  "suggestions": {
    "code_column": 0,
    "description_column": 1,
    "dimensions_column": 3,
    "cubic_column": 4,
    "weight_column": 5,
    "ncm_column": 6,
    "price_columns": [
      {
        "index": 7,
        "name": "Preço Atacado",
        "confidence": 0.95
      },
      {
        "index": 8,
        "name": "Preço Varejo",
        "confidence": 0.92
      }
    ],
    "data_start_row": 1
  },
  "confidence_scores": {
    "code": {
      "score": 0.95,
      "confidence": "high"
    },
    "description": {
      "score": 0.88,
      "confidence": "high"
    }
  }
}
```

**Campo `analysis_method`:**
- `"gemini_ai"` - Análise feita pela IA do Gemini
- `"traditional"` - Análise feita por fuzzy matching

## 🔧 Configuração Avançada

### Desabilitar IA Temporariamente

No código, ao criar o mapper:

```python
# Força uso do método tradicional
mapper = ColumnMapperService(df, header_row=0, use_ai=False)
```

### Cache de Resultados

O sistema automaticamente faz cache das análises por 24 horas para:
- ✅ Reduzir custos com API
- ✅ Melhorar performance
- ✅ Evitar chamadas repetidas para mesma planilha

**Limpeza de cache:**
```python
from django.core.cache import cache
cache.clear()  # Limpa todo o cache
```

## 💰 Custos e Limites

### Google Gemini API (Free Tier)

- **Gratuito até:** 15 requisições/minuto
- **Modelo usado:** `gemini-1.5-flash` (mais rápido e econômico)
- **Custo estimado:** ~10-20 análises = 1 centavo de dólar

### Otimizações Implementadas

1. **Cache de 24h** - Evita análises repetidas
2. **Amostra limitada** - Envia apenas 10 linhas para análise
3. **Fallback automático** - Usa método gratuito se IA falhar
4. **Lazy loading** - IA só é carregada se configurada

## 🧪 Testando a Integração

### 1. Verificar se está funcionando

```bash
# No backend
cd backend
python manage.py shell
```

```python
from extractor.services.gemini_analyzer_service import get_gemini_analyzer

analyzer = get_gemini_analyzer()
print(f"IA habilitada: {analyzer.is_enabled()}")
# True = API key configurada
# False = API key não encontrada
```

### 2. Testar análise manual

```python
headers = ['COD', 'PRODUTO', 'PREÇO ATACADO', 'PREÇO VAREJO']
sample_data = [
    ['CAM001', 'Camiseta Branca', 25.90, 39.90],
    ['CAM002', 'Camiseta Preta', 27.50, 42.00],
]

result = analyzer.analyze_columns(headers, sample_data)
print(result)
```

## 🐛 Troubleshooting

### Problema: "IA não está sendo usada"

**Verificar:**
1. API key está configurada no `.env`?
2. Arquivo `.env` está sendo carregado?
3. Logs do sistema mostram erro?

```bash
# Ver logs
docker-compose logs backend | grep -i gemini
```

### Problema: "Erro ao chamar Gemini API"

**Possíveis causas:**
1. API key inválida ou expirada
2. Limite de requisições excedido (15/min)
3. Problema de conexão com internet

**Solução:**
- Sistema usa fallback automático
- Verifica nova API key
- Aguarda 1 minuto e tenta novamente

### Problema: "ModuleNotFoundError: google.generativeai"

```bash
cd backend
pip install -r requirements.txt
```

## 📊 Logs e Monitoramento

### Ver análises realizadas

```python
import logging
logging.basicConfig(level=logging.INFO)
```

**Logs gerados:**
```
INFO: Gemini AI inicializado com sucesso
INFO: Tentando análise com Gemini AI...
INFO: Enviando requisição para Gemini AI...
INFO: Análise do Gemini concluída com sucesso. 8 colunas analisadas.
INFO: Resultado armazenado no cache: gemini_analysis_abc123...
```

## 🔐 Segurança

### Boas Práticas

1. ✅ **Nunca commite** `.env` no git
2. ✅ **Use variáveis de ambiente** em produção
3. ✅ **Rotacione** API keys periodicamente
4. ✅ **Monitore** uso da API

### `.gitignore`

Certifique-se de ter:
```gitignore
.env
.env.local
*.env
```

## 📚 Documentação Adicional

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Pricing](https://ai.google.dev/pricing)
- [API Limits](https://ai.google.dev/docs/quota_limits)

## 🎯 Próximos Passos

1. ✅ IA integrada e funcionando
2. 🔄 Testar com planilhas diversas
3. 🔄 Ajustar prompt se necessário
4. 📊 Coletar métricas de precisão

---

**Desenvolvido com ❤️ usando Google Gemini AI**
