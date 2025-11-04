# Guia de Testes - Extrator de Planilhas

## Resumo da Organizacao

Os arquivos foram organizados da seguinte forma:
- **docs/** - Documentacao tecnica (SYSTEM_OVERVIEW.md, TECHNICAL_REFERENCE.md)
- **examples/** - Planilhas de exemplo (Dona_Flor_Primeira_Pag.xlsx)
- **backend/** - Configuracoes Django
- **extractor/** - Aplicacao principal
- **media/** - Uploads de arquivos
- **scripts/** - Scripts auxiliares

## Correcoes Aplicadas

### 1. Leitura de Planilhas Excel
**Problema**: O pandas estava usando a primeira linha como header automaticamente.

**Solucao**: Adicionado `header=None` em todas as leituras Excel:
- `extractor/views.py` (linhas 36, 62, 101)
- `extractor/services/spreadsheet_processor.py` (linha 19)

### 2. Tratamento de Erros em Conversoes
**Problema**: Campos numericos (cubic, weight) falhavam ao encontrar valores nao numericos.

**Solucao**: Adicionado try/except nas conversoes float (views.py linhas 132-146)

## Status dos Testes

### ✓ Endpoints Funcionando

#### 1. Upload de Planilha
```bash
curl -X POST http://localhost:8000/api/uploads/ \
  -F "file=@examples/Dona_Flor_Primeira_Pag.xlsx"
```
**Resultado**: ✓ Sucesso - Retorna ID e informacoes do upload

#### 2. Preview da Planilha
```bash
curl http://localhost:8000/api/uploads/2/preview/
```
**Resultado**: ✓ Sucesso - Retorna 20 primeiras linhas

#### 3. Configurar Mapeamento
```bash
curl -X POST http://localhost:8000/api/mappings/create_or_update/ \
  -H "Content-Type: application/json" \
  -d '{
    "upload": 2,
    "code_column": 2,
    "description_column": 3,
    "dimensions_column": 4,
    "cubic_column": 5,
    "weight_column": 6,
    "ncm_column": 7,
    "data_start_row": 12,
    "price_columns": [
      {"index": 8, "name": "Preco Fornecido"},
      {"index": 10, "name": "Tecido Fornecido"},
      {"index": 11, "name": "Grupo 1"}
    ]
  }'
```
**Resultado**: ✓ Sucesso - Mapeamento criado

#### 4. Processar Planilha
```bash
curl -X POST http://localhost:8000/api/uploads/2/process/
```
**Resultado**: ✓ Sucesso
- Produtos criados: 567
- Variantes criadas: 766

#### 5. Listar Produtos
```bash
curl "http://localhost:8000/api/products/?upload_id=2"
```
**Resultado**: ✓ Sucesso - Lista paginada de produtos com variantes

#### 6. Exportacao JSON
```bash
curl "http://localhost:8000/api/uploads/2/export/?format=json"
```
**Resultado**: ✓ Sucesso - Exportacao em JSON funcionando

### ✓ Exportacao CSV e XML (Endpoint Separado)

**Importante**: CSV e XML usam endpoint diferente para evitar problemas com content negotiation do DRF

```bash
# CSV
curl "http://localhost:8000/api/uploads/2/download/?format=csv" -o export.csv

# XML
curl "http://localhost:8000/api/uploads/2/download/?format=xml" -o export.xml
```
**Resultado**: ✓ Sucesso
- CSV: 770 linhas exportadas
- XML: 9544 linhas exportadas (formatado)

**Observacao**: JSON ainda usa `/api/uploads/2/export/?format=json` (via DRF)

## Como Executar os Testes

### 1. Iniciar o Servidor
```bash
python manage.py runserver 8000
```

### 2. Executar Fluxo Completo
```bash
# Upload
curl -X POST http://localhost:8000/api/uploads/ \
  -F "file=@examples/Dona_Flor_Primeira_Pag.xlsx"

# Preview (use o ID retornado)
curl http://localhost:8000/api/uploads/[ID]/preview/

# Configurar mapeamento
curl -X POST http://localhost:8000/api/mappings/create_or_update/ \
  -H "Content-Type: application/json" \
  -d @mapping_config.json

# Processar
curl -X POST http://localhost:8000/api/uploads/[ID]/process/

# Visualizar produtos
curl "http://localhost:8000/api/products/?upload_id=[ID]"

# Exportar
curl "http://localhost:8000/api/uploads/[ID]/export/?format=json" > export.json
```

## Exemplo de Dados Processados

### Produto com Variantes
```json
{
  "id": 26,
  "description": "Almofada Decorativa Cushion...",
  "variants": [
    {
      "id": 32,
      "code": "AC2",
      "dimensions": "A15 * L45 * P45",
      "cubic": 0.037553,
      "weight": 0.55,
      "ncm": "94049000",
      "prices": {
        "Preco Fornecido": 123.12,
        "Tecido Fornecido": 136.0,
        "Grupo 1": 136.87
      },
      "row_number": 13
    },
    {
      "id": 33,
      "code": "AC3",
      "dimensions": "A15 * L55 * P55",
      "cubic": 0.055233,
      "weight": 0.85,
      "ncm": "94049000",
      "prices": {
        "Preco Fornecido": 157.15,
        "Tecido Fornecido": 173.0,
        "Grupo 1": 173.65
      },
      "row_number": 14
    }
  ]
}
```

## Proximos Passos

### Correcoes Necessarias
1. Investigar e corrigir exportacao CSV/XML (problema de content-type)
2. Filtrar header da linha 11 no processamento (atualmente sendo incluido como primeiro produto)
3. Adicionar validacao de encoding UTF-8 nos nomes de colunas de preco

### Melhorias Sugeridas
1. Adicionar paginacao nas exportacoes para planilhas grandes
2. Implementar cache para previews de planilhas grandes
3. Adicionar validacao de formato de arquivo no upload
4. Criar testes automatizados com pytest

## Servidor em Execucao

O servidor Django esta rodando em background e pode ser acessado em:
- **URL**: http://localhost:8000
- **Admin**: http://localhost:8000/admin (requer superuser)
- **API Root**: http://localhost:8000/api/

Para parar o servidor, use Ctrl+C no terminal onde foi iniciado.
