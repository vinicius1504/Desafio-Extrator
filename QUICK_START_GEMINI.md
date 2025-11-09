# 🚀 Guia Rápido - Ativando Gemini AI

## Passo 1: Obter API Key (2 minutos)

1. Acesse: **https://makersuite.google.com/app/apikey**
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave gerada (começa com `AIza...`)

## Passo 2: Configurar no Projeto (1 minuto)

### Opção A: Arquivo `.env` (Recomendado para desenvolvimento)

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
GEMINI_API_KEY=AIzaSy...sua-chave-aqui
```

### Opção B: Variável de Ambiente (Para produção)

**Windows:**
```cmd
set GEMINI_API_KEY=AIzaSy...sua-chave-aqui
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY=AIzaSy...sua-chave-aqui
```

## Passo 3: Testar (1 minuto)

### Teste Rápido via Shell

```bash
cd backend
python manage.py shell
```

```python
from extractor.services.gemini_analyzer_service import get_gemini_analyzer

# Verificar se está configurado
analyzer = get_gemini_analyzer()
print(f"✅ IA Habilitada: {analyzer.is_enabled()}")

# Testar análise
headers = ['COD', 'DESCRIÇÃO', 'PREÇO', 'PESO']
dados = [
    ['ABC123', 'Produto A', 19.90, 0.5],
    ['XYZ456', 'Produto B', 29.90, 0.8]
]

resultado = analyzer.analyze_columns(headers, dados)
print(f"✅ Análise concluída!")
print(f"Colunas identificadas: {len(resultado['columns'])}")
```

### Teste via API

1. **Faça upload de uma planilha** via interface
2. **Obtenha o ID** do upload (ex: `1`)
3. **Teste o endpoint:**

```http
GET http://localhost:8000/api/uploads/1/suggest_mapping/
```

**Resposta esperada:**
```json
{
  "success": true,
  "analysis_method": "gemini_ai",  // ✅ IA funcionando!
  "suggestions": {
    "code_column": 0,
    "description_column": 1,
    ...
  }
}
```

## ✅ Como Saber se Está Funcionando?

### 1. Logs do Django

Ao fazer análise, você deve ver:

```
INFO: Gemini AI inicializado com sucesso
INFO: Tentando análise com Gemini AI...
INFO: Enviando requisição para Gemini AI...
INFO: Análise do Gemini concluída com sucesso. 8 colunas analisadas.
```

### 2. Response da API

No campo `analysis_method`:
- `"gemini_ai"` = ✅ **IA ATIVADA**
- `"traditional"` = ❌ IA não usada (fallback)

## 🐛 Problemas Comuns

### "IA não está habilitada"

**Causa:** API key não configurada

**Solução:**
1. Verifique se adicionou no `.env`
2. Reinicie o servidor Django
3. Confirme que a chave está correta

### "Erro ao chamar Gemini API"

**Causa:** API key inválida ou limite excedido

**Solução:**
1. Gere nova API key
2. Aguarde 1 minuto (limite: 15 req/min)
3. Sistema usa fallback automático

### "ModuleNotFoundError"

**Causa:** Pacote não instalado

**Solução:**
```bash
pip install google-generativeai==0.8.3
```

## 📊 Teste Comparativo

### Teste com Planilha Não-Padrão

Crie uma planilha com headers customizados:

| VL_COD | DESC_PROD | VL_UNIT | PESAGEM |
|--------|-----------|---------|---------|
| P001   | Item A    | 15.50   | 250     |
| P002   | Item B    | 22.00   | 380     |

**Sem IA (método tradicional):**
- ❌ Não identifica "VL_UNIT" como preço
- ❌ Não identifica "DESC_PROD" como descrição
- ⚠️ Requer mapeamento manual

**Com IA (Gemini):**
- ✅ Identifica "VL_UNIT" = preço
- ✅ Identifica "DESC_PROD" = descrição
- ✅ Identifica "PESAGEM" = peso
- ✅ **100% automático!**

## 🎯 Próximos Passos

1. ✅ Configurou API Key
2. ✅ Testou e funciona
3. 🔄 Teste com suas planilhas reais
4. 🔄 Ajuste o prompt se necessário
5. 🚀 Deploy em produção

## 💡 Dicas

1. **Free Tier:** 15 requisições/min é suficiente para uso normal
2. **Cache:** Sistema guarda análises por 24h automaticamente
3. **Fallback:** Se IA falhar, sistema usa método tradicional
4. **Segurança:** Nunca commite `.env` no git

---

**Dúvidas?** Veja a documentação completa em `GEMINI_AI_INTEGRATION.md`
