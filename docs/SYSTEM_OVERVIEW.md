# Sistema de Extração de Planilhas - Visão Geral

## Descrição
Sistema backend Django para extração e processamento de dados de planilhas Excel com estrutura não padronizada. Permite mapeamento customizável de colunas e detecção automática de produtos com múltiplas variantes.

## Tecnologias
- **Django 5.2.7** - Framework web
- **Django REST Framework 3.16.1** - API REST
- **Pandas 2.3.3** - Manipulação de dados
- **OpenPyxl 3.1.5** - Leitura de arquivos Excel
- **Django CORS Headers 4.9.0** - Suporte CORS
- **SQLite** - Banco de dados

## Estrutura do Projeto

```
desafio_extrator/
├── backend/                    # Configurações Django
│   ├── settings/              # Settings modularizados
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py                # URLs principais
│   ├── wsgi.py
│   └── asgi.py
├── extractor/                  # App principal
│   ├── models.py              # Modelos de dados
│   ├── views.py               # ViewSets da API
│   ├── serializers.py         # Serializers DRF
│   ├── urls.py                # URLs do app
│   ├── admin.py               # Admin Django
│   └── migrations/
├── db.sqlite3                 # Banco de dados
├── manage.py                  # Gerenciador Django
├── requirements.txt           # Dependências
├── exemplo_uso.py            # Script de exemplo
├── Dona_Flor_Primeira_Pag.xlsx  # Planilha de teste
└── README.md                  # Documentação

```

## Modelos de Dados (extractor/models.py)

### 1. SpreadsheetUpload
Armazena informações sobre arquivos Excel enviados.

**Campos:**
- `file`: FileField (planilha Excel)
- `uploaded_at`: DateTime (data/hora do upload)
- `original_filename`: String (nome original do arquivo)
- `total_rows`: Integer (total de linhas)
- `total_columns`: Integer (total de colunas)

### 2. ColumnMapping
Define mapeamento de colunas customizável pelo usuário.

**Campos:**
- `upload`: OneToOne com SpreadsheetUpload
- `code_column`: Integer (índice da coluna de código)
- `description_column`: Integer (índice da coluna de descrição)
- `dimensions_column`: Integer (índice da coluna de dimensões)
- `cubic_column`: Integer (índice da coluna de cúbico)
- `weight_column`: Integer (índice da coluna de peso)
- `ncm_column`: Integer (índice da coluna de NCM)
- `price_columns`: JSONField (lista de colunas de preço)
- `data_start_row`: Integer (linha onde começam os dados)

### 3. Product
Produto principal (primeira ocorrência com descrição).

**Campos:**
- `upload`: ForeignKey para SpreadsheetUpload
- `description`: TextField (descrição do produto)
- `created_at`: DateTime

### 4. ProductVariant
Variações de produto (múltiplos códigos por produto).

**Campos:**
- `product`: ForeignKey para Product
- `upload`: ForeignKey para SpreadsheetUpload
- `code`: String (código do produto)
- `dimensions`: String (dimensões)
- `cubic`: Float (metragem cúbica)
- `weight`: Float (peso)
- `ncm`: String (código NCM)
- `prices`: JSONField (dicionário de preços)
- `raw_data`: JSONField (dados brutos da linha)
- `row_number`: Integer (número da linha original)

## API Endpoints (extractor/views.py)

### SpreadsheetUploadViewSet

#### POST /api/uploads/
Upload de planilha Excel.

**Request:** Form-data com arquivo
**Response:** Dados do upload (id, filename, total_rows, total_columns)

#### GET /api/uploads/{id}/preview/
Preview das primeiras 20 linhas.

**Response:** Array com row_number e data de cada linha

#### POST /api/uploads/{id}/process/
Processa a planilha baseado no mapeamento.

**Lógica:**
1. Linhas com descrição → criam novo Produto
2. Linhas sem descrição → criam Variante do último produto
3. Extrai código, dimensões, peso, cúbico, NCM e preços

**Response:** Quantidade de produtos e variantes criados

#### GET /api/uploads/{id}/export/?format={formato}
Exporta dados processados.

**Formatos:** json, csv, xml
**Response:** Arquivo ou JSON com dados exportados

### ColumnMappingViewSet

#### POST /api/mappings/create_or_update/
Cria ou atualiza mapeamento de colunas.

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
  "data_start_row": 12,
  "price_columns": [
    {"index": 8, "name": "Preço Fornecido"},
    {"index": 10, "name": "Tecido Fornecido"}
  ]
}
```

### ProductViewSet

#### GET /api/products/?upload_id={id}
Lista produtos com suas variantes.

**Response:** Array de produtos com variantes aninhadas

## Fluxo de Trabalho

```
1. UPLOAD
   POST /api/uploads/
   └─> Salva arquivo e retorna ID

2. PREVIEW
   GET /api/uploads/{id}/preview/
   └─> Usuário visualiza estrutura da planilha

3. MAPEAMENTO
   POST /api/mappings/create_or_update/
   └─> Define quais colunas contêm cada tipo de dado

4. PROCESSAMENTO
   POST /api/uploads/{id}/process/
   └─> Extrai produtos e variantes

5. VISUALIZAÇÃO
   GET /api/products/?upload_id={id}
   └─> Visualiza dados processados

6. EXPORTAÇÃO
   GET /api/uploads/{id}/export/?format=csv
   └─> Baixa dados em formato desejado
```

## Lógica de Detecção de Produtos/Variantes

O processamento identifica produtos e variantes baseado na presença de descrição:

```python
# Linha com descrição = novo produto
if description and description != 'nan':
    current_product = Product.create(description=description)

# Linha sem descrição = variante do último produto
ProductVariant.create(
    product=current_product,  # Último produto criado
    code=code,
    dimensions=dimensions,
    ...
)
```

**Exemplo:**
```
Linha 12: AC2  | "Almofada Decorativa" | 45x45 → Produto
Linha 13: AC3  | (vazio)               | 55x55 → Variante do AC2
Linha 14: AC33 | (vazio)               | 60x60 → Variante do AC2
Linha 15: BC1  | "Banqueta"            | 30x30 → Novo Produto
```

## Formatos de Exportação

### JSON
Array de objetos com todos os campos.

### CSV
Tabela plana com colunas:
- Código, Descrição, Dimensões, Cúbico, Peso, NCM
- Colunas de preços dinâmicas

### XML
```xml
<products>
  <product>
    <code>AC2</code>
    <description>Almofada</description>
    <prices>
      <price type="Fornecido">123.12</price>
    </prices>
  </product>
</products>
```

## Como Executar

### Instalação
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Teste com Script
```bash
python exemplo_uso.py
```

### Admin Django
```bash
python manage.py createsuperuser
# Acessar: http://localhost:8000/admin
```

## Arquivo de Exemplo

**Dona_Flor_Primeira_Pag.xlsx**
- Planilha com estrutura não padronizada
- Headers na linha 11
- Dados começam na linha 12
- Múltiplos códigos por produto
- 11 colunas de preços diferentes

## Próximos Passos

1. **Frontend React** para:
   - Upload de arquivos
   - Interface de mapeamento visual
   - Visualização de produtos
   - Exportação de dados

2. **Melhorias Backend:**
   - Validação de dados
   - Tratamento de erros aprimorado
   - Testes automatizados
   - Paginação de resultados

3. **Features Adicionais:**
   - Histórico de uploads
   - Comparação entre planilhas
   - Regras de validação customizáveis
   - Importação em batch

## Comandos Úteis

```bash
# Executar servidor
python manage.py runserver

# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Shell Django
python manage.py shell

# Testar API
python exemplo_uso.py
```

## Observações Importantes

1. **Índices baseados em 0**: Todas as colunas usam índice 0-based
2. **JSONField**: Usado para flexibilidade em preços e raw_data
3. **OneToOne**: ColumnMapping tem relação 1:1 com Upload
4. **Ordenação**: Variantes ordenadas por row_number
5. **Deletação em cascata**: Ao deletar Upload, remove produtos e variantes
6. **CORS habilitado**: Permite chamadas de frontend

## Status do Projeto

**Versão:** 1.0
**Status:** Funcional e testado
**Banco:** SQLite (db.sqlite3)
**Planilha de teste:** Dona_Flor_Primeira_Pag.xlsx

## Contato e Suporte

- Documentação completa: README.md
- Exemplos de uso: exemplo_uso.py
- Interface admin: http://localhost:8000/admin
