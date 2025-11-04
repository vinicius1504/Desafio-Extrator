# Guia de Integração API - Frontend

## Índice
1. [Inicializando o Backend](#inicializando-o-backend)
2. [URLs Base](#urls-base)
3. [Fluxo Completo de Uso](#fluxo-completo-de-uso)
4. [Endpoints Detalhados](#endpoints-detalhados)
5. [Modelos de Dados](#modelos-de-dados)
6. [Exemplos de Integração](#exemplos-de-integração)
7. [Tratamento de Erros](#tratamento-de-erros)

---

## Inicializando o Backend

### Instalação de Dependências
```bash
pip install -r requirements.txt
```

### Migrações do Banco de Dados
```bash
python manage.py migrate
```

### Iniciar Servidor de Desenvolvimento
```bash
python manage.py runserver
```

O servidor iniciará em: `http://localhost:8000`

### Documentação Interativa (Swagger)
Acesse: `http://localhost:8000/api/docs/`

---

## URLs Base

- **API Base:** `http://localhost:8000/api/`
- **Documentação Swagger:** `http://localhost:8000/api/docs/`
- **Documentação ReDoc:** `http://localhost:8000/api/redoc/`
- **Schema OpenAPI:** `http://localhost:8000/api/schema/`

---

## Fluxo Completo de Uso

### Passo 1: Upload da Planilha
**Endpoint:** `POST /api/spreadsheets/`

Faça upload de um arquivo Excel (.xlsx).

### Passo 2: Visualizar Preview
**Endpoint:** `GET /api/spreadsheets/{id}/preview/`

Visualize as primeiras 20 linhas da planilha para identificar:
- Em qual linha começam os dados reais
- Quais colunas contêm cada informação

### Passo 3: Configurar Mapeamento de Colunas
**Endpoint:** `POST /api/column-mappings/create_or_update/`

Defina qual coluna corresponde a cada campo (código, descrição, dimensões, etc.).

### Passo 4: Processar Dados
**Endpoint:** `POST /api/spreadsheets/{id}/process/`

Processa a planilha com base no mapeamento configurado.

### Passo 5: Visualizar Produtos Processados
**Endpoint:** `GET /api/products/?upload_id={id}`

Liste todos os produtos extraídos com suas variantes.

### Passo 6: Exportar Dados (Opcional)
**Endpoint:** `GET /api/spreadsheets/{id}/export/?format={json|csv|xml}`

Exporte os dados processados no formato desejado.

---

## Endpoints Detalhados

### 1. Spreadsheet Upload

#### 1.1. Upload de Planilha
```http
POST /api/spreadsheets/
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <arquivo.xlsx>
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "file": "/media/spreadsheets/arquivo.xlsx",
  "uploaded_at": "2025-10-24T14:30:00Z",
  "original_filename": "arquivo.xlsx",
  "total_rows": 150,
  "total_columns": 12
}
```

**Exemplo JavaScript/Fetch:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8000/api/spreadsheets/', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('Upload ID:', data.id);
```

---

#### 1.2. Preview da Planilha
```http
GET /api/spreadsheets/{id}/preview/
```

**Response:** `200 OK`
```json
{
  "total_rows": 150,
  "total_columns": 12,
  "column_count": 12,
  "preview": [
    {
      "row_number": 0,
      "data": [null, null, null, "TABELA DE PREÇOS", null, ...]
    },
    {
      "row_number": 11,
      "data": ["Foto", "Num", "Código", "Descrição", "Dimensões", "Cúbico", "Peso", "NCM", "Preço 1", "Preço 2"]
    },
    {
      "row_number": 12,
      "data": ["img", "1", "AC001", "Almofada Decorativa", "45x45", "0.03", "0.55", "94049000", "123.50", "145.00"]
    }
  ]
}
```

**Exemplo JavaScript/Fetch:**
```javascript
const response = await fetch(`http://localhost:8000/api/spreadsheets/${uploadId}/preview/`);
const preview = await response.json();

// Usar preview.preview para montar tabela visual no frontend
preview.preview.forEach(row => {
  console.log(`Linha ${row.row_number}:`, row.data);
});
```

---

#### 1.3. Listar Uploads
```http
GET /api/spreadsheets/
```

**Response:** `200 OK`
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "file": "/media/spreadsheets/arquivo.xlsx",
      "uploaded_at": "2025-10-24T14:30:00Z",
      "original_filename": "arquivo.xlsx",
      "total_rows": 150,
      "total_columns": 12
    }
  ]
}
```

---

#### 1.4. Obter Detalhes de Upload
```http
GET /api/spreadsheets/{id}/
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "file": "/media/spreadsheets/arquivo.xlsx",
  "uploaded_at": "2025-10-24T14:30:00Z",
  "original_filename": "arquivo.xlsx",
  "total_rows": 150,
  "total_columns": 12
}
```

---

### 2. Column Mapping

#### 2.1. Criar ou Atualizar Mapeamento
```http
POST /api/column-mappings/create_or_update/
Content-Type: application/json
```

**Request Body:**
```json
{
  "upload": 1,
  "code_column": 2,
  "description_column": 3,
  "dimensions_column": 4,
  "cubic_column": 5,
  "weight_column": 6,
  "ncm_column": 7,
  "price_columns": [
    {"index": 8, "name": "Preço Fornecido"},
    {"index": 9, "name": "Grupo 1"},
    {"index": 10, "name": "Grupo 2"}
  ],
  "data_start_row": 12
}
```

**Campos:**
- `upload`: ID do upload da planilha
- `code_column`: Índice da coluna de código (baseado em 0)
- `description_column`: Índice da coluna de descrição
- `dimensions_column`: Índice da coluna de dimensões
- `cubic_column`: Índice da coluna de volume cúbico
- `weight_column`: Índice da coluna de peso
- `ncm_column`: Índice da coluna de NCM
- `price_columns`: Array de objetos com índice e nome de cada coluna de preço
- `data_start_row`: Linha onde começam os dados (após cabeçalhos)

**Response:** `200 OK`
```json
{
  "id": 1,
  "upload": 1,
  "code_column": 2,
  "description_column": 3,
  "dimensions_column": 4,
  "cubic_column": 5,
  "weight_column": 6,
  "ncm_column": 7,
  "price_columns": [
    {"index": 8, "name": "Preço Fornecido"},
    {"index": 9, "name": "Grupo 1"},
    {"index": 10, "name": "Grupo 2"}
  ],
  "data_start_row": 12,
  "created_at": "2025-10-24T14:35:00Z"
}
```

**Exemplo JavaScript/Fetch:**
```javascript
const mapping = {
  upload: uploadId,
  code_column: 2,
  description_column: 3,
  dimensions_column: 4,
  cubic_column: 5,
  weight_column: 6,
  ncm_column: 7,
  price_columns: [
    { index: 8, name: "Preço Fornecido" },
    { index: 9, name: "Grupo 1" }
  ],
  data_start_row: 12
};

const response = await fetch('http://localhost:8000/api/column-mappings/create_or_update/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(mapping)
});

const result = await response.json();
```

---

#### 2.2. Listar Mapeamentos
```http
GET /api/column-mappings/
```

---

#### 2.3. Obter Mapeamento Específico
```http
GET /api/column-mappings/{id}/
```

---

### 3. Processar Dados

#### 3.1. Processar Planilha
```http
POST /api/spreadsheets/{id}/process/
```

**Response:** `200 OK`
```json
{
  "message": "Processamento concluído",
  "products_created": 45,
  "variants_created": 150
}
```

**Exemplo JavaScript/Fetch:**
```javascript
const response = await fetch(`http://localhost:8000/api/spreadsheets/${uploadId}/process/`, {
  method: 'POST'
});

const result = await response.json();
console.log(`${result.products_created} produtos criados`);
console.log(`${result.variants_created} variantes criadas`);
```

---

### 4. Produtos

#### 4.1. Listar Produtos com Variantes
```http
GET /api/products/?upload_id={upload_id}
```

**Response:** `200 OK`
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/products/?page=2&upload_id=1",
  "previous": null,
  "results": [
    {
      "id": 1,
      "description": "Almofada Decorativa",
      "created_at": "2025-10-24T14:40:00Z",
      "variants": [
        {
          "id": 1,
          "code": "AC001",
          "dimensions": "45x45",
          "cubic": 0.03,
          "weight": 0.55,
          "ncm": "94049000",
          "prices": {
            "Preço Fornecido": 123.50,
            "Grupo 1": 145.00,
            "Grupo 2": 160.00
          },
          "raw_data": {...},
          "row_number": 12,
          "created_at": "2025-10-24T14:40:00Z"
        },
        {
          "id": 2,
          "code": "AC002",
          "dimensions": "50x50",
          "cubic": 0.04,
          "weight": 0.75,
          "ncm": "94049000",
          "prices": {
            "Preço Fornecido": 145.00,
            "Grupo 1": 170.00,
            "Grupo 2": 185.00
          },
          "raw_data": {...},
          "row_number": 13,
          "created_at": "2025-10-24T14:40:00Z"
        }
      ]
    }
  ]
}
```

**Exemplo JavaScript/Fetch:**
```javascript
const response = await fetch(`http://localhost:8000/api/products/?upload_id=${uploadId}`);
const data = await response.json();

data.results.forEach(product => {
  console.log('Produto:', product.description);
  product.variants.forEach(variant => {
    console.log(`  - ${variant.code}: ${variant.dimensions}`);
  });
});
```

---

#### 4.2. Obter Produto Específico
```http
GET /api/products/{id}/
```

---

### 5. Exportar Dados

#### 5.1. Exportar em JSON
```http
GET /api/spreadsheets/{id}/export/?format=json
```

**Response:** `200 OK`
```json
[
  {
    "code": "AC001",
    "product_description": "Almofada Decorativa",
    "dimensions": "45x45",
    "cubic": 0.03,
    "weight": 0.55,
    "ncm": "94049000",
    "prices": {
      "Preço Fornecido": 123.50,
      "Grupo 1": 145.00
    },
    "row_number": 12
  }
]
```

---

#### 5.2. Exportar em CSV
```http
GET /api/spreadsheets/{id}/export/?format=csv
```

**Response:** `200 OK`
```csv
Código,Descrição,Dimensões,Cúbico,Peso,NCM,Preço Fornecido,Grupo 1
AC001,Almofada Decorativa,45x45,0.03,0.55,94049000,123.50,145.00
AC002,Almofada Decorativa,50x50,0.04,0.75,94049000,145.00,170.00
```

**Headers da Response:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="arquivo_export.csv"
```

---

#### 5.3. Exportar em XML
```http
GET /api/spreadsheets/{id}/export/?format=xml
```

**Response:** `200 OK`
```xml
<?xml version="1.0" ?>
<products>
  <product>
    <code>AC001</code>
    <description>Almofada Decorativa</description>
    <dimensions>45x45</dimensions>
    <cubic>0.03</cubic>
    <weight>0.55</weight>
    <ncm>94049000</ncm>
    <prices>
      <price type="Preço Fornecido">123.5</price>
      <price type="Grupo 1">145.0</price>
    </prices>
  </product>
</products>
```

**Headers da Response:**
```
Content-Type: application/xml
Content-Disposition: attachment; filename="arquivo_export.xml"
```

**Exemplo JavaScript/Fetch para Download:**
```javascript
// Para CSV ou XML (download direto)
const response = await fetch(`http://localhost:8000/api/spreadsheets/${uploadId}/export/?format=csv`);
const blob = await response.blob();

// Criar link de download
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'dados_exportados.csv';
document.body.appendChild(a);
a.click();
a.remove();
```

---

## Modelos de Dados

### SpreadsheetUpload
```typescript
interface SpreadsheetUpload {
  id: number;
  file: string;                    // URL do arquivo
  uploaded_at: string;             // ISO 8601 datetime
  original_filename: string;
  total_rows: number;
  total_columns: number;
}
```

### ColumnMapping
```typescript
interface PriceColumn {
  index: number;
  name: string;
}

interface ColumnMapping {
  id: number;
  upload: number;                  // ID do SpreadsheetUpload
  code_column: number | null;
  description_column: number | null;
  dimensions_column: number | null;
  cubic_column: number | null;
  weight_column: number | null;
  ncm_column: number | null;
  price_columns: PriceColumn[];
  data_start_row: number;
  created_at: string;              // ISO 8601 datetime
}
```

### Product
```typescript
interface Product {
  id: number;
  description: string;
  created_at: string;              // ISO 8601 datetime
  variants: ProductVariant[];
}
```

### ProductVariant
```typescript
interface ProductVariant {
  id: number;
  code: string;
  dimensions: string | null;
  cubic: number | null;
  weight: number | null;
  ncm: string | null;
  prices: Record<string, number>;  // Chave: nome da coluna, Valor: preço
  raw_data: Record<string, any>;   // Dados brutos da linha
  row_number: number;
  created_at: string;              // ISO 8601 datetime
}
```

---

## Exemplos de Integração

### Exemplo Completo - React
```javascript
import React, { useState } from 'react';

const API_BASE = 'http://localhost:8000/api';

function SpreadsheetUploader() {
  const [uploadId, setUploadId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [products, setProducts] = useState([]);

  // Passo 1: Upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/spreadsheets/`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    setUploadId(data.id);
    loadPreview(data.id);
  };

  // Passo 2: Preview
  const loadPreview = async (id) => {
    const response = await fetch(`${API_BASE}/spreadsheets/${id}/preview/`);
    const data = await response.json();
    setPreview(data);
  };

  // Passo 3: Configurar Mapeamento
  const configureMapping = async () => {
    const mapping = {
      upload: uploadId,
      code_column: 2,
      description_column: 3,
      dimensions_column: 4,
      cubic_column: 5,
      weight_column: 6,
      ncm_column: 7,
      price_columns: [
        { index: 8, name: "Preço Fornecido" }
      ],
      data_start_row: 12
    };

    await fetch(`${API_BASE}/column-mappings/create_or_update/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapping)
    });

    processSpreadsheet();
  };

  // Passo 4: Processar
  const processSpreadsheet = async () => {
    await fetch(`${API_BASE}/spreadsheets/${uploadId}/process/`, {
      method: 'POST'
    });

    loadProducts();
  };

  // Passo 5: Carregar Produtos
  const loadProducts = async () => {
    const response = await fetch(`${API_BASE}/products/?upload_id=${uploadId}`);
    const data = await response.json();
    setProducts(data.results);
  };

  // Passo 6: Exportar
  const exportData = async (format) => {
    const response = await fetch(
      `${API_BASE}/spreadsheets/${uploadId}/export/?format=${format}`
    );

    if (format === 'json') {
      const data = await response.json();
      console.log(data);
    } else {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export.${format}`;
      a.click();
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept=".xlsx" />

      {preview && (
        <div>
          <h3>Preview</h3>
          <button onClick={configureMapping}>Configurar e Processar</button>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h3>Produtos Processados: {products.length}</h3>
          <button onClick={() => exportData('csv')}>Exportar CSV</button>
          <button onClick={() => exportData('xml')}>Exportar XML</button>
          <button onClick={() => exportData('json')}>Exportar JSON</button>
        </div>
      )}
    </div>
  );
}
```

---

### Exemplo - Vue.js
```vue
<template>
  <div>
    <input type="file" @change="handleFileUpload" accept=".xlsx" />

    <div v-if="preview">
      <h3>Preview da Planilha</h3>
      <table>
        <tr v-for="row in preview.preview" :key="row.row_number">
          <td>{{ row.row_number }}</td>
          <td v-for="(cell, idx) in row.data" :key="idx">{{ cell }}</td>
        </tr>
      </table>
      <button @click="processData">Processar Dados</button>
    </div>

    <div v-if="products.length">
      <h3>Produtos: {{ products.length }}</h3>
      <div v-for="product in products" :key="product.id">
        <h4>{{ product.description }}</h4>
        <ul>
          <li v-for="variant in product.variants" :key="variant.id">
            {{ variant.code }} - {{ variant.dimensions }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      uploadId: null,
      preview: null,
      products: []
    };
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/spreadsheets/', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      this.uploadId = data.id;
      await this.loadPreview();
    },

    async loadPreview() {
      const response = await fetch(
        `http://localhost:8000/api/spreadsheets/${this.uploadId}/preview/`
      );
      this.preview = await response.json();
    },

    async processData() {
      // Configurar mapeamento
      const mapping = {
        upload: this.uploadId,
        code_column: 2,
        description_column: 3,
        dimensions_column: 4,
        cubic_column: 5,
        weight_column: 6,
        ncm_column: 7,
        price_columns: [{ index: 8, name: "Preço" }],
        data_start_row: 12
      };

      await fetch('http://localhost:8000/api/column-mappings/create_or_update/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapping)
      });

      // Processar
      await fetch(`http://localhost:8000/api/spreadsheets/${this.uploadId}/process/`, {
        method: 'POST'
      });

      // Carregar produtos
      const response = await fetch(
        `http://localhost:8000/api/products/?upload_id=${this.uploadId}`
      );
      const data = await response.json();
      this.products = data.results;
    }
  }
};
</script>
```

---

## Tratamento de Erros

### Códigos de Status HTTP

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Dados inválidos ou faltando
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro no servidor

### Exemplos de Erros

#### Arquivo não enviado
```json
{
  "error": "Nenhum arquivo foi enviado"
}
```

#### Mapeamento não definido
```json
{
  "error": "Nenhum mapeamento de colunas definido"
}
```

#### Upload não encontrado
```json
{
  "error": "Upload não encontrado"
}
```

#### Erro ao processar arquivo
```json
{
  "error": "Erro ao processar arquivo: [detalhes do erro]",
  "traceback": "[stack trace para debug]"
}
```

### Tratamento no Frontend
```javascript
try {
  const response = await fetch(`${API_BASE}/spreadsheets/${id}/process/`, {
    method: 'POST'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro desconhecido');
  }

  const data = await response.json();
  console.log('Sucesso:', data);
} catch (error) {
  console.error('Erro:', error.message);
  alert(`Erro ao processar: ${error.message}`);
}
```

---

## Notas Importantes

### CORS
O backend está configurado com `django-cors-headers`. Para produção, configure as origens permitidas em `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    # Adicione suas origens aqui
]
```

### Paginação
Todos os endpoints de listagem são paginados (50 itens por página). Use os campos `next` e `previous` para navegar:

```javascript
let allProducts = [];
let url = `${API_BASE}/products/?upload_id=${uploadId}`;

while (url) {
  const response = await fetch(url);
  const data = await response.json();
  allProducts = [...allProducts, ...data.results];
  url = data.next;
}
```

### Arquivos de Mídia
Os arquivos enviados são salvos em `media/spreadsheets/`. Em produção, configure um storage adequado (S3, etc.).

### Validação de Dados
- Todos os índices de colunas são baseados em **0**
- A linha inicial de dados (`data_start_row`) também é baseada em **0**
- Campos numéricos (cubic, weight) aceitam `null` se a célula estiver vazia
- O campo `prices` é um dicionário flexível que aceita qualquer quantidade de preços

---

## Estrutura Recomendada do Frontend

### Telas Sugeridas

1. **Tela de Upload**
   - Input de arquivo
   - Botão de upload
   - Exibir informações básicas após upload

2. **Tela de Preview e Mapeamento**
   - Tabela com preview das primeiras linhas
   - Interface para selecionar colunas (dropdowns por campo)
   - Input para definir linha inicial de dados
   - Botão para processar

3. **Tela de Resultados**
   - Lista/tabela de produtos processados
   - Expandir para ver variantes
   - Botões de exportação (CSV, XML, JSON)
   - Filtros e busca

### Estados da Aplicação

```typescript
interface AppState {
  currentStep: 'upload' | 'mapping' | 'results';
  uploadId: number | null;
  preview: PreviewData | null;
  mapping: ColumnMapping | null;
  products: Product[];
  loading: boolean;
  error: string | null;
}
```

---

## Questões Frequentes

**Q: Posso fazer múltiplos uploads simultaneamente?**
A: Sim, cada upload é independente e tem seu próprio ID.

**Q: Os dados são salvos permanentemente?**
A: Sim, os dados ficam salvos no banco SQLite (desenvolvimento) ou PostgreSQL (produção).

**Q: Posso reprocessar uma planilha com mapeamento diferente?**
A: Sim, atualize o mapeamento e chame o endpoint de processamento novamente.

**Q: Como limpar dados antigos?**
A: Use os métodos DELETE dos endpoints ou implemente no frontend uma funcionalidade de exclusão.

---

Pronto! Com este guia você tem todas as informações necessárias para criar um frontend completo que se integra perfeitamente com o backend.
