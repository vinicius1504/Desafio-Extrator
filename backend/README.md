# Backend - Extrator de Planilhas

API Django REST Framework para upload, processamento e exportação de planilhas Excel.

## Tecnologias

- Python 3.11+
- Django 5.2
- Django REST Framework 3.16
- pandas + openpyxl para processamento de Excel
- drf-spectacular para documentação OpenAPI/Swagger

## Instalação

### 1. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 2. Executar Migrações

```bash
python manage.py migrate
```

### 3. Iniciar Servidor de Desenvolvimento

```bash
python manage.py runserver
```

O servidor iniciará em: `http://localhost:8000`

## Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Schema OpenAPI**: http://localhost:8000/api/schema/

## Estrutura do Projeto

```
backend/
├── backend/                # Configurações do Django
│   ├── settings/          # Settings por ambiente
│   │   ├── base.py       # Settings base
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py           # URLs principais
│   └── ...
├── extractor/            # App principal
│   ├── models.py        # Modelos de dados
│   ├── serializers.py   # Serializers DRF
│   ├── views.py         # Views/ViewSets
│   ├── urls.py          # URLs do app
│   └── services/        # Lógica de negócio
├── media/               # Arquivos enviados (uploads)
├── scripts/             # Scripts utilitários
├── manage.py            # CLI do Django
└── requirements.txt     # Dependências Python
```

## Endpoints Principais

### Upload de Planilha
```http
POST /api/spreadsheets/
Content-Type: multipart/form-data

file: <arquivo.xlsx>
```

### Preview da Planilha
```http
GET /api/spreadsheets/{id}/preview/
```

### Configurar Mapeamento de Colunas
```http
POST /api/column-mappings/create_or_update/
Content-Type: application/json
```

### Processar Planilha
```http
POST /api/spreadsheets/{id}/process/
```

### Listar Produtos Processados
```http
GET /api/products/?upload_id={id}
```

### Exportar Dados
```http
GET /api/spreadsheets/{id}/export/?format={json|csv|xml}
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
DJANGO_SECRET_KEY=sua-chave-secreta-aqui
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

## Testes

```bash
# Executar todos os testes
python manage.py test

# Executar testes de uma app específica
python manage.py test extractor

# Executar com coverage
coverage run manage.py test
coverage report
```

## Scripts Utilitários

### Exemplo de Uso da API
```bash
python scripts/exemplo_uso.py
```

## Comandos Úteis

```bash
# Criar superusuário
python manage.py createsuperuser

# Acessar shell interativo
python manage.py shell

# Criar nova migração
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic
```

## Troubleshooting

### Erro: ModuleNotFoundError
Certifique-se de que todas as dependências estão instaladas:
```bash
pip install -r requirements.txt
```

### Erro: No module named 'backend'
Certifique-se de estar executando os comandos na pasta `backend/`:
```bash
cd backend
python manage.py runserver
```

### Erro ao processar planilha
Verifique se:
- O mapeamento de colunas está correto
- A linha inicial de dados (`data_start_row`) está correta
- O arquivo Excel não está corrompido

## Produção

Para deploy em produção:

1. Configure as variáveis de ambiente adequadas
2. Use `backend.settings.production`
3. Configure um servidor WSGI (Gunicorn, uWSGI)
4. Use um servidor web reverso (Nginx, Apache)
5. Configure um banco de dados production (PostgreSQL, MySQL)
6. Use storage externo para media files (S3, etc.)

Exemplo com Gunicorn:
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

## Mais Informações

Consulte a documentação completa em `/docs/FRONTEND_API_GUIDE.md`
