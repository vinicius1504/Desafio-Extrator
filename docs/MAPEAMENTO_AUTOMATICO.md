# 🤖 Mapeamento Automático de Colunas

## Visão Geral

O sistema agora possui **detecção inteligente de colunas** que identifica automaticamente os campos da planilha, mesmo que tenham nomes diferentes ou estejam em posições variadas.

### Como Funciona?

O sistema usa duas estratégias combinadas:

1. **Análise de Nomes de Colunas (60%)**
   - Compara os headers da planilha com sinônimos conhecidos
   - Usa fuzzy matching para encontrar similaridades
   - Exemplos: "Código" → encontra "cod", "cod.", "código", "referência", "SKU"

2. **Análise de Conteúdo (40%)**
   - Examina as primeiras linhas de cada coluna
   - Identifica padrões de dados (numéricos, alfanuméricos, dimensões, NCM, etc)
   - Exemplos: "45x45" → identifica como dimensão, "0201.10.00" → identifica como NCM

### Score de Confiança

Cada mapeamento sugerido tem um score de confiança:

- **High (≥ 0.8)**: Alta confiança - o sistema está muito seguro
- **Medium (0.6 - 0.79)**: Média confiança - provável, mas revise
- **Low (< 0.6)**: Baixa confiança - recomenda-se revisão manual

## 🚀 Como Usar

### Método 1: Fluxo Automático (Recomendado)

```python
import requests

# 1. Upload da planilha
with open('planilha.xlsx', 'rb') as f:
    response = requests.post('http://localhost:8000/api/spreadsheets/', files={'file': f})
    upload_id = response.json()['id']

# 2. Aplicar mapeamento automático (um único passo!)
response = requests.post(
    f'http://localhost:8000/api/spreadsheets/{upload_id}/apply_suggested_mapping/'
)

# 3. Processar
response = requests.post(f'http://localhost:8000/api/spreadsheets/{upload_id}/process/')

# Pronto! ✅
```

### Método 2: Revisar Antes de Aplicar

```python
# 1. Upload (mesmo do anterior)

# 2. Obter sugestões primeiro
response = requests.get(
    f'http://localhost:8000/api/spreadsheets/{upload_id}/suggest_mapping/',
    params={'min_confidence': 0.6}  # Apenas sugestões com 60%+ de confiança
)

suggestions = response.json()
print("Sugestões:", suggestions['suggestions'])
print("Confiança:", suggestions['confidence_scores'])

# 3. Revisar e ajustar se necessário
mapping = suggestions['suggestions']
mapping['code_column'] = 2  # Ajustar manualmente se necessário

# 4. Aplicar mapeamento (com ou sem ajustes)
response = requests.post(
    f'http://localhost:8000/api/spreadsheets/{upload_id}/apply_suggested_mapping/',
    json={'suggested_mapping': mapping}
)

# 5. Processar
response = requests.post(f'http://localhost:8000/api/spreadsheets/{upload_id}/process/')
```

## 📋 Novos Endpoints

### 1. Sugerir Mapeamento

**Endpoint:** `GET /api/spreadsheets/{id}/suggest_mapping/`

**Parâmetros de Query:**
- `header_row` (int, padrão: 0): Linha que contém os cabeçalhos
- `sample_rows` (int, padrão: 10): Quantas linhas analisar
- `min_confidence` (float, padrão: 0.5): Confiança mínima (0.0 a 1.0)
- `debug` (bool): Se true, retorna análise detalhada de todas as colunas

**Exemplo de Response:**

```json
{
  "success": true,
  "message": "Mapeamento sugerido com sucesso",
  "suggestions": {
    "code_column": 0,
    "description_column": 1,
    "dimensions_column": 2,
    "cubic_column": 3,
    "weight_column": 4,
    "ncm_column": 5,
    "price_columns": [
      {
        "index": 8,
        "name": "Preço Fornecido",
        "confidence": 0.85
      },
      {
        "index": 9,
        "name": "Grupo 1",
        "confidence": 0.78
      }
    ],
    "data_start_row": 1
  },
  "confidence_scores": {
    "code": {
      "score": 0.92,
      "confidence": "high"
    },
    "description": {
      "score": 0.88,
      "confidence": "high"
    },
    "dimensions": {
      "score": 0.75,
      "confidence": "medium"
    }
  },
  "headers": ["Código", "Descrição", "Dimensões", "Cubagem", "Peso", "NCM", ...],
  "analysis": {
    "total_columns": 12,
    "columns_mapped": 6,
    "price_columns_found": 2
  }
}
```

### 2. Aplicar Mapeamento Sugerido

**Endpoint:** `POST /api/spreadsheets/{id}/apply_suggested_mapping/`

**Body (opcional):**

```json
{
  "suggested_mapping": {
    "code_column": 0,
    "description_column": 1,
    ...
  }
}
```

Se não enviar o body, o sistema gera e aplica automaticamente.

**Parâmetros opcionais no body (se não enviar suggested_mapping):**
- `header_row` (int)
- `sample_rows` (int)
- `min_confidence` (float)

**Response:**

```json
{
  "success": true,
  "message": "Mapeamento automático aplicado com sucesso",
  "mapping": {
    "id": 123,
    "code_column": 0,
    "description_column": 1,
    ...
  },
  "action": "created"  // ou "updated"
}
```

## 🎯 Campos Reconhecidos

### Campos Principais

| Campo | Sinônimos Reconhecidos |
|-------|------------------------|
| **Código** | codigo, código, cod, cod., code, item, sku, referencia, referência, ref, ref., produto, product |
| **Descrição** | descricao, descrição, description, desc, desc., produto, product, nome, name, item, denominacao |
| **Dimensões** | dimensoes, dimensões, dimensions, dim, medidas, tamanho, size, altura, height, largura, width, comprimento, length, tam, tam. |
| **Cubagem** | cubagem, cubico, cúbico, cubic, volume, m3, m³, metro cubico, metros cúbicos, vol, vol. |
| **Peso** | peso, weight, kg, kilos, quilos, massa, mass, peso liquido, peso líquido, peso bruto |
| **NCM** | ncm, n.c.m, n.c.m., nomenclatura, classificacao, classificação fiscal, codigo ncm, código ncm |
| **Preço** | preco, preço, price, valor, value, custo, cost, tabela, table, grupo, group, fornecido, supplied, varejo, atacado, wholesale, retail |

### Padrões de Dados Reconhecidos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| **NCM** | `^\d{4}\.?\d{2}\.?\d{2}$` | 0201.10.00, 02011000 |
| **Código** | `^[A-Z]{1,3}\d+[A-Z]?$` | AC2, BC10, XYZ123A |
| **Dimensões** | `\d+\s*[xX×]\s*\d+` | 45x45, 30 X 40, 100×200 |
| **Numérico** | `^[\d\.,]+$` | 123.45, 1,234.56 |

## 💡 Dicas de Uso

### 1. Planilhas com Estrutura Consistente

Se suas planilhas sempre têm a mesma estrutura, use **templates**:

```python
# 1. Criar template a partir do mapeamento automático
response = requests.post(
    'http://localhost:8000/api/spreadsheets/{id}/apply_suggested_mapping/'
)
mapping_id = response.json()['mapping']['id']

# 2. Criar template
response = requests.post(
    'http://localhost:8000/api/templates/',
    json={
        'name': 'Fornecedor X',
        'description': 'Template para planilhas do Fornecedor X',
        'code_column': 0,
        'description_column': 1,
        ...
    }
)

# 3. Reutilizar em uploads futuros
response = requests.post(
    'http://localhost:8000/api/mappings/apply_template/',
    json={
        'upload_id': new_upload_id,
        'template_id': template_id
    }
)
```

### 2. Ajustar Confiança Mínima

Para planilhas muito diferentes, diminua o `min_confidence`:

```python
# Aceitar sugestões com 40% de confiança
response = requests.get(
    f'/api/spreadsheets/{id}/suggest_mapping/',
    params={'min_confidence': 0.4}
)
```

### 3. Analisar Mais Linhas

Para planilhas com dados irregulares, aumente `sample_rows`:

```python
# Analisar 50 linhas em vez de 10
response = requests.get(
    f'/api/spreadsheets/{id}/suggest_mapping/',
    params={'sample_rows': 50}
)
```

### 4. Debug Mode

Para entender por que uma coluna foi ou não identificada:

```python
response = requests.get(
    f'/api/spreadsheets/{id}/suggest_mapping/',
    params={'debug': 'true'}
)

# Retorna análise completa de cada coluna
debug_info = response.json()['debug']['all_columns_analysis']
```

## 🔧 Casos Especiais

### Múltiplas Colunas de Preço

O sistema identifica automaticamente todas as colunas que parecem ser preços:

```json
"price_columns": [
  {"index": 8, "name": "Preço Fornecido", "confidence": 0.85},
  {"index": 9, "name": "Grupo 1", "confidence": 0.82},
  {"index": 10, "name": "Grupo 2", "confidence": 0.80}
]
```

### Headers em Linha Diferente

Se os headers não estão na primeira linha:

```python
response = requests.get(
    f'/api/spreadsheets/{id}/suggest_mapping/',
    params={'header_row': 2}  # Headers estão na linha 3 (índice 2)
)
```

### Colunas Sem Nome

Se a coluna não tem header, o sistema ainda tenta identificar pelo conteúdo:

```python
# Análise de conteúdo identifica mesmo sem nome da coluna
{
  "index": 5,
  "header": "coluna_5",  # Nome automático
  "content_analysis": {
    "has_ncm_pattern": true,  # ← Sistema identifica pelo padrão!
    "sample_values": ["0201.10.00", "0202.20.00", ...]
  }
}
```

## 📊 Algoritmo de Detecção

### Score Final

```
score_final = (score_nome × 0.6) + (score_conteúdo × 0.4)
```

### Exemplo Prático

Coluna: "Ref."

**Análise de Nome:**
- Similaridade com "referencia": 0.7
- Similaridade com "ref": 0.9
- Score de nome: **0.9**

**Análise de Conteúdo:**
- Valores: ["AC2", "AC3", "BC1"]
- Padrão de código detectado: 100%
- Score de conteúdo: **0.9**

**Score Final:**
```
(0.9 × 0.6) + (0.9 × 0.4) = 0.54 + 0.36 = 0.90 → HIGH confidence ✅
```

## 🎯 Fluxo Completo Frontend

```javascript
// 1. Upload
const formData = new FormData();
formData.append('file', file);
const uploadResponse = await fetch('/api/spreadsheets/', {
  method: 'POST',
  body: formData
});
const { id: uploadId } = await uploadResponse.json();

// 2. Obter sugestões
const suggestionsResponse = await fetch(
  `/api/spreadsheets/${uploadId}/suggest_mapping/`
);
const { suggestions, confidence_scores } = await suggestionsResponse.json();

// 3. Mostrar para o usuário revisar
// (Interface visual onde usuário pode ajustar)

// 4. Aplicar mapeamento
await fetch(`/api/spreadsheets/${uploadId}/apply_suggested_mapping/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ suggested_mapping: suggestions })
});

// 5. Processar
await fetch(`/api/spreadsheets/${uploadId}/process/`, { method: 'POST' });

// 6. Mostrar resultados
const products = await fetch(`/api/products/?upload_id=${uploadId}`);
```

## 🧪 Testando

Execute o exemplo incluído:

```bash
cd examples
python exemplo_mapeamento_automatico.py

# Ou apenas para ver as sugestões
python exemplo_mapeamento_automatico.py --simple
```

## ⚠️ Limitações Conhecidas

1. **Colunas muito similares**: Se houver duas colunas com nomes e conteúdos similares, o sistema pode se confundir
2. **Dados irregulares**: Se as primeiras linhas não são representativas, aumente `sample_rows`
3. **Nomes completamente diferentes**: Se os nomes das colunas não têm relação com os sinônimos conhecidos, o sistema dependerá apenas da análise de conteúdo

## 🔮 Próximas Melhorias

- [ ] Aprendizado com histórico do usuário
- [ ] Suporte a mais idiomas (inglês, espanhol)
- [ ] Detecção de unidades de medida (kg, cm, m³)
- [ ] Machine Learning para melhorar detecção
- [ ] Sugestão de correção de dados inconsistentes

---

**Desenvolvido para facilitar o trabalho com planilhas não padronizadas! 🚀**
