# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.0.0] - 2025-01-07

### 🤖 Nova Funcionalidade Principal: Integração com Google Gemini AI

#### Adicionado
- **Análise Inteligente de Colunas com IA**
  - Integração completa com Google Gemini AI (modelo gemini-1.5-flash)
  - Identificação automática de tipos de colunas (código, descrição, preços, peso, NCM, etc.)
  - Suporte para headers customizados e não-padrão
  - Detecção inteligente de múltiplas colunas de preço
  - Análise contextual dos dados (não apenas nome das colunas)

- **GeminiColumnAnalyzerService**
  - Service dedicado para interação com Gemini API
  - Geração automática de prompts otimizados
  - Parse inteligente de respostas da IA
  - Conversão automática para formato do sistema

- **Sistema de Cache**
  - Cache de 24 horas para análises realizadas
  - Redução de custos com API
  - Melhoria significativa de performance
  - Chave de cache baseada em hash MD5 de headers + dados

- **Fallback Automático**
  - Sistema tenta usar Gemini AI primeiro
  - Se falhar ou não configurado, usa método tradicional (fuzzy matching)
  - Zero impacto na experiência do usuário
  - Logs detalhados de qual método foi usado

- **Configuração**
  - Nova variável de ambiente: `GEMINI_API_KEY`
  - Configuração via `.env` para desenvolvimento
  - Suporte a variáveis de ambiente para produção
  - Documentação completa de setup

#### Modificado
- **ColumnMapperService**
  - Método `suggest_mapping()` agora usa IA como primeira opção
  - Novo método `_suggest_mapping_with_ai()`
  - Método tradicional renomeado para `_suggest_mapping_traditional()`
  - Novo parâmetro `use_ai` (default: True)
  - Campo `analysis_method` adicionado ao retorno

- **SpreadsheetUploadViewSet**
  - Endpoint `suggest_mapping` agora retorna campo `analysis_method`
  - Indica se análise foi feita por IA ("gemini_ai") ou método tradicional ("traditional")

#### Documentação
- **GEMINI_AI_INTEGRATION.md** - Documentação técnica completa
- **QUICK_START_GEMINI.md** - Guia rápido de configuração
- **test_gemini.py** - Script de testes automatizados
- **README.md** atualizado com seção sobre IA
- **.env.example** atualizado com GEMINI_API_KEY

#### Técnico
- Dependência adicionada: `google-generativeai==0.8.3`
- Lazy import do Gemini service para evitar erros se não configurado
- Logs estruturados com logging do Django
- Tratamento robusto de erros da API
- Validação de resposta JSON da IA

### 🎯 Benefícios da Versão 2.0

#### Antes (v1.x)
- ❌ Limitado a nomes de colunas conhecidos
- ❌ Baixa precisão com planilhas não-padrão
- ❌ Requer configuração manual frequente
- ❌ Dificuldade com múltiplos preços

#### Agora (v2.0)
- ✅ Funciona com qualquer formato de planilha
- ✅ Alta precisão mesmo com headers customizados
- ✅ Configuração automática na maioria dos casos
- ✅ Detecta automaticamente múltiplas colunas de preço
- ✅ Entende contexto, não apenas nomes
- ✅ Fallback garantido se IA falhar

### 📊 Exemplos de Melhoria

**Caso 1: Headers Customizados**
```
Antes: "VL_UNIT" → não reconhecido, requer mapeamento manual
Agora:  "VL_UNIT" → ✅ automaticamente identificado como PREÇO
```

**Caso 2: Múltiplos Preços**
```
Antes: Identifica apenas primeira coluna de preço
Agora:  Identifica TODAS as colunas de preço (Atacado, Varejo, Promocional, etc.)
```

**Caso 3: Abreviações**
```
Antes: "DESC_PROD" → não reconhecido
Agora:  "DESC_PROD" → ✅ identificado como DESCRIÇÃO
```

### 🔧 Configuração para Usar

1. Obtenha API key gratuita: https://makersuite.google.com/app/apikey
2. Adicione no `.env`: `GEMINI_API_KEY=sua-chave-aqui`
3. Reinicie o backend
4. ✅ Pronto! Sistema usa IA automaticamente

### 💰 Custos

- **Free Tier**: 15 requisições/minuto
- **Custo estimado**: ~10-20 análises = $0.01
- **Cache**: 24 horas (reduz custos drasticamente)

### 🧪 Como Testar

```bash
cd backend
python test_gemini.py
```

---

## [1.0.0] - 2025-01-06

### Lançamento Inicial

#### Adicionado
- Sistema completo de upload de planilhas
- Preview inteligente de dados
- Auto-detecção de estrutura (headers e dados)
- Mapeamento visual de colunas
- Remoção automática de colunas ocultas
- Suporte a múltiplos preços
- Exportação em JSON, CSV e XML
- Sistema de autenticação (JWT)
- Gerenciamento de usuários
- Interface moderna e responsiva
- Dark mode automático
- Suporte a Google Sheets

---

## Formato

Este changelog segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

### Tipos de Mudanças

- `Adicionado` para novas funcionalidades
- `Modificado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correções de bugs
- `Segurança` para vulnerabilidades corrigidas
