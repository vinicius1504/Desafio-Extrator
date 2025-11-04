# Referência Técnica - Sistema de Extração de Planilhas

## Stack Tecnológico
```
Backend: Django 5.2.7 + DRF 3.16.1
Database: SQLite (db.sqlite3)
Data Processing: Pandas 2.3.3 + OpenPyxl 3.1.5
CORS: django-cors-headers 4.9.0
```

## Arquitetura de Dados

```
SpreadsheetUpload (1) ──┬── (1) ColumnMapping
                        ├── (*) Product (1) ──── (*) ProductVariant
                        └── (*) ProductVariant (todas, incluindo órfãs)
```

## Models Schema

```python
# SpreadsheetUpload
{
    id: Integer (PK),
    file: FileField (media/spreadsheets/),
    uploaded_at: DateTime,
    original_filename: String,
    total_rows: Integer,
    total_columns: Integer
}

# ColumnMapping (OneToOne com SpreadsheetUpload)
{
    id: Integer (PK),
    upload: ForeignKey,
    code_column: Integer (nullable),
    description_column: Integer (nullable),
    dimensions_column: Integer (nullable),
    cubic_column: Integer (nullable),
    weight_column: Integer (nullable),
    ncm_column: Integer (nullable),
    price_columns: JSONField [{"index": int, "name": str}],
    data_start_row: Integer (default=0)
}

# Product
{
    id: Integer (PK),
    upload: ForeignKey,
    description: TextField,
    created_at: DateTime
}

# ProductVariant
{
    id: Integer (PK),
    product: ForeignKey (nullable),
    upload: ForeignKey,
    code: String,
    dimensions: String,
    cubic: Float,
    weight: Float,
    ncm: String,
    prices: JSONField {"price_name": value},
    raw_data: JSONField,
    row_number: Integer
}
```

## API Routes (DRF Router)

```python
# Definido em extractor/urls.py
router.register(r'uploads', SpreadsheetUploadViewSet)
router.register(r'mappings', ColumnMappingViewSet)
router.register(r'products', ProductViewSet)

# URL principal em backend/urls.py
path('api/', include('extractor.urls'))
```

### Endpoints Gerados

```
GET    /api/uploads/                     # Lista uploads
POST   /api/uploads/                     # Upload arquivo
GET    /api/uploads/{id}/                # Detalhes upload
GET    /api/uploads/{id}/preview/        # Preview (custom action)
POST   /api/uploads/{id}/process/        # Processa (custom action)
GET    /api/uploads/{id}/export/?format= # Exporta (custom action)

GET    /api/mappings/                    # Lista mappings
POST   /api/mappings/                    # Cria mapping
POST   /api/mappings/create_or_update/  # Upsert (custom action)

GET    /api/products/?upload_id=         # Lista produtos
GET    /api/products/{id}/               # Detalhes produto
```

## Serializers

```python
# SpreadsheetUploadSerializer
fields = ['id', 'file', 'uploaded_at', 'original_filename', 'total_rows', 'total_columns']

# ColumnMappingSerializer
fields = ['id', 'upload', 'code_column', 'description_column', 'dimensions_column',
          'cubic_column', 'weight_column', 'ncm_column', 'price_columns', 'data_start_row']

# ProductSerializer (nested)
fields = ['id', 'description', 'variants', 'created_at']
variants = ProductVariantSerializer(many=True)

# ProductVariantSerializer
fields = ['id', 'code', 'dimensions', 'cubic', 'weight', 'ncm', 'prices', 'raw_data', 'row_number']

# ProductVariantExportSerializer (flat)
fields = ['code', 'product_description', 'dimensions', 'cubic', 'weight', 'ncm', 'prices', 'row_number']
product_description = source='product.description'
```

## Processamento de Dados (Algoritmo)

```python
# extractor/views.py:85 - process() action

df = pd.read_excel(upload.file.path)
current_product = None

for idx, row in df.iloc[mapping.data_start_row:].iterrows():
    code = row.iloc[mapping.code_column]
    description = row.iloc[mapping.description_column]

    # Lógica de detecção
    if description and description != 'nan':
        # Nova descrição = novo produto
        current_product = Product.create(description=description)

    # Extrair dados
    dimensions = row.iloc[mapping.dimensions_column]
    cubic = row.iloc[mapping.cubic_column]
    weight = row.iloc[mapping.weight_column]
    ncm = row.iloc[mapping.ncm_column]

    # Preços dinâmicos
    prices = {}
    for price_col in mapping.price_columns:
        prices[price_col['name']] = row.iloc[price_col['index']]

    # Criar variante (mesmo se for primeiro código do produto)
    ProductVariant.create(
        product=current_product,  # Pode ser None se linha sem descrição aparece primeiro
        code=code,
        dimensions=dimensions,
        prices=prices,
        row_number=idx
    )
```

## Exportação de Dados

```python
# JSON
serializer = ProductVariantExportSerializer(variants, many=True)
return Response(serializer.data)

# CSV
writer = csv.writer(response)
headers = ['Código', 'Descrição', ...] + price_keys
writer.writerow(headers)
for variant in variants:
    writer.writerow([variant.code, variant.product.description, ...])

# XML
root = Element('products')
for variant in variants:
    product_elem = SubElement(root, 'product')
    SubElement(product_elem, 'code').text = variant.code
    prices_elem = SubElement(product_elem, 'prices')
    for key, value in variant.prices.items():
        price_elem = SubElement(prices_elem, 'price')
        price_elem.set('type', key)
        price_elem.text = str(value)
```

## Settings Importantes

```python
# backend/settings.py

INSTALLED_APPS = [
    'rest_framework',
    'corsheaders',  # CORS habilitado
    'extractor',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 2º lugar
]

CORS_ALLOW_ALL_ORIGINS = True  # DESENVOLVIMENTO APENAS

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny']
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DATABASES = {'default': {'ENGINE': 'sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}
```

## Fluxo de Request/Response

### 1. Upload
```bash
curl -X POST http://localhost:8000/api/uploads/ -F "file=@planilha.xlsx"

Response: {id: 1, original_filename: "planilha.xlsx", total_rows: 970, total_columns: 19}
```

### 2. Preview
```bash
curl http://localhost:8000/api/uploads/1/preview/

Response: {
  total_rows: 970,
  preview: [
    {row_number: 0, data: [null, null, ...]},
    {row_number: 11, data: ["FOTO", "CÓD.", ...]}
  ]
}
```

### 3. Mapeamento
```bash
curl -X POST http://localhost:8000/api/mappings/create_or_update/ \
  -H "Content-Type: application/json" \
  -d '{
    "upload": 1,
    "code_column": 2,
    "description_column": 3,
    "data_start_row": 12,
    "price_columns": [{"index": 8, "name": "Fornecido"}]
  }'
```

### 4. Processamento
```bash
curl -X POST http://localhost:8000/api/uploads/1/process/

Response: {
  message: "Processamento concluído",
  products_created: 45,
  variants_created: 120
}
```

### 5. Listar Produtos
```bash
curl http://localhost:8000/api/products/?upload_id=1

Response: [
  {
    id: 1,
    description: "Almofada",
    variants: [
      {code: "AC2", dimensions: "45x45", prices: {"Fornecido": 123.12}},
      {code: "AC3", dimensions: "55x55", prices: {"Fornecido": 157.15}}
    ]
  }
]
```

### 6. Exportar
```bash
# JSON
curl http://localhost:8000/api/uploads/1/export/?format=json

# CSV
curl http://localhost:8000/api/uploads/1/export/?format=csv -o export.csv

# XML
curl http://localhost:8000/api/uploads/1/export/?format=xml -o export.xml
```

## Pandas Operations

```python
# Leitura
df = pd.read_excel(file_path)
rows, cols = df.shape

# Iteração
for idx, row in df.iterrows():
    value = row.iloc[column_index]

# Slicing
df.iloc[start_row:]  # A partir de start_row
df.head(20)          # Primeiras 20 linhas

# Checagem de valores nulos
pd.notna(value)
pd.isna(value)
```

## Comandos Django

```bash
# Desenvolvimento
python manage.py runserver              # Inicia servidor (localhost:8000)
python manage.py makemigrations         # Cria migrações
python manage.py migrate                # Aplica migrações
python manage.py createsuperuser        # Cria admin

# Shell interativo
python manage.py shell
>>> from extractor.models import *
>>> SpreadsheetUpload.objects.all()

# Teste
python exemplo_uso.py                   # Executa fluxo completo
```

## Estrutura de Arquivos

```
desafio_extrator/
├── backend/
│   ├── settings.py              # Config principal
│   ├── urls.py                  # URL raiz: /admin, /api
│   ├── wsgi.py
│   └── asgi.py
├── extractor/
│   ├── models.py                # 4 modelos: Upload, Mapping, Product, Variant
│   ├── views.py                 # 3 ViewSets com custom actions
│   ├── serializers.py           # 5 serializers
│   ├── urls.py                  # Router DRF
│   └── admin.py
├── media/spreadsheets/          # Arquivos enviados
├── db.sqlite3                   # Banco de dados
├── manage.py
├── requirements.txt
├── exemplo_uso.py               # Script de teste
└── Dona_Flor_Primeira_Pag.xlsx  # Planilha exemplo

```

## Exemplo de Dados (Dona Flor)

```
Linha 11: [FOTO | CÓD. | DESCRIÇÃO | DIMENSÕES | ...]  ← Headers
Linha 12: [img  | AC2  | "Almofada" | 45x45 | 0.03 | 0.55 | 94049000 | 123.12 | ...]
Linha 13: [img  | AC3  | (vazio)    | 55x55 | 0.05 | 0.85 | 94049000 | 157.15 | ...]
Linha 14: [img  | AC33 | (vazio)    | 60x60 | 0.06 | 1.20 | 94049000 | 189.00 | ...]

Resultado:
Product(id=1, description="Almofada")
  └─ Variant(code="AC2", dimensions="45x45")
  └─ Variant(code="AC3", dimensions="55x55")
  └─ Variant(code="AC33", dimensions="60x60")
```

## Índices (Zero-based)

```
Coluna 0: Foto/Imagem
Coluna 1: (vazia ou número)
Coluna 2: Código
Coluna 3: Descrição
Coluna 4: Dimensões
Coluna 5: Cúbico
Coluna 6: Peso
Coluna 7: NCM
Colunas 8-18: Preços (11 colunas diferentes)

data_start_row = 12 (linha onde começam os dados reais)
```

## Debug Tips

```python
# No shell Django
from extractor.models import *
upload = SpreadsheetUpload.objects.first()
upload.column_mapping  # Ver mapeamento
upload.products.count()  # Contar produtos
upload.variants.count()  # Contar variantes

# Ver primeiro produto com variantes
product = Product.objects.first()
product.variants.all()

# Ver dados brutos de uma variante
variant = ProductVariant.objects.first()
variant.raw_data
variant.prices

# Filtrar variantes sem produto
ProductVariant.objects.filter(product__isnull=True)
```

## Possíveis Problemas

1. **Variantes sem produto**: Se primeira linha não tem descrição
2. **Valores NaN**: Usar `pd.notna()` e checar `!= 'nan'`
3. **Índice errado**: Todos os índices são 0-based
4. **CORS em produção**: Mudar `CORS_ALLOW_ALL_ORIGINS` para lista específica
5. **SECRET_KEY**: Trocar em produção
6. **MEDIA_ROOT**: Configurar storage em produção (S3, etc)

## Performance

- Use `select_related('product')` ao buscar variantes
- Use `prefetch_related('variants')` ao buscar produtos
- Paginação não implementada (adicionar PageNumberPagination)
- Processamento síncrono (considerar Celery para arquivos grandes)

## Next Steps

1. Adicionar autenticação (JWT/Token)
2. Implementar paginação
3. Validações customizadas
4. Testes automatizados
5. Frontend React
6. Deploy (Docker/Heroku/AWS)
