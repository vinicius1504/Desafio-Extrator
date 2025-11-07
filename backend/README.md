# 🔧 Backend - Sistema Extrator de Planilhas

API REST construída com Django e Django REST Framework para processamento e extração de dados de planilhas Excel.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Aplicações Django](#aplicações-django)
- [Modelos de Dados](#modelos-de-dados)
- [Endpoints da API](#endpoints-da-api)
- [Configuração](#configuração)
- [Arquivos Importantes](#arquivos-importantes)

---

## 🛠 Tecnologias

- **Django 5.2.7** - Framework web Python
- **Django REST Framework 3.16** - API REST
- **PostgreSQL** - Banco de dados (produção)
- **SQLite** - Banco de dados (desenvolvimento)
- **JWT** - Autenticação com tokens
- **Pandas 2.3.3** - Processamento de planilhas
- **OpenPyXL 3.1.5** - Leitura de arquivos Excel
- **Gunicorn** - Servidor WSGI
- **WhiteNoise** - Servir arquivos estáticos

---

## 📁 Estrutura do Projeto

```
backend/
├── authentication/          # App de autenticação e usuários
│   ├── models.py           # User e RefreshToken
│   ├── views.py            # Login, registro, perfil, admin
│   ├── serializers.py      # Validação de dados
│   ├── permissions.py      # Permissões customizadas
│   └── email_utils.py      # Envio de emails
│
├── extractor/              # App de extração de planilhas
│   ├── models.py           # Upload, Product, ProductVariant, ColumnMapping
│   ├── views.py            # Upload, mapeamento, processamento, export
│   ├── serializers.py      # Validação e serialização
│   ├── services/           # Lógica de negócio
│   │   └── spreadsheet_processor.py
│   └── utils/              # Utilitários
│       └── spreadsheet_detector.py
│
├── backend/                # Configurações do projeto
│   ├── settings/           # Settings por ambiente
│   │   ├── base.py        # Configurações base
│   │   ├── development.py # Desenvolvimento
│   │   ├── production.py  # Produção
│   │   └── docker.py      # Docker
│   ├── urls.py            # Rotas principais
│   └── wsgi.py            # WSGI application
│
├── scripts/                # Scripts utilitários
├── media/                  # Uploads de usuários
├── manage.py              # CLI do Django
├── requirements.txt       # Dependências Python
└── Dockerfile            # Container Docker
```

---

## 🎯 Aplicações Django

### 1. **Authentication** (`authentication/`)

Gerenciamento completo de usuários e autenticação.

**Principais arquivos:**

- **`models.py`**
  - `User` - Modelo de usuário customizado com campos `is_admin`, `last_activity`
  - `RefreshToken` - Gerenciamento de tokens JWT com blacklist

- **`views.py`**
  - `RegisterView` - Registro público de usuários
  - `LoginView` - Login com geração de JWT
  - `LogoutView` - Logout com invalidação de token
  - `UserProfileView` - Visualizar/editar perfil
  - `ChangePasswordView` - Alteração de senha
  - `CheckSessionView` - Verificação de sessão ativa
  - **Admin Views:**
    - `UserListView` - Listar usuários (admin)
    - `UserCreateView` - Criar usuário (admin)
    - `UserDetailView` - Ver/editar/deletar usuário (admin)
    - `UserToggleActiveView` - Ativar/desativar usuário (admin)

- **`serializers.py`**
  - `UserSerializer` - Dados do usuário
  - `RegisterSerializer` - Validação de registro
  - `LoginSerializer` - Validação de login
  - `ChangePasswordSerializer` - Validação de senha
  - `AdminUserCreateSerializer` - Criação de usuário pelo admin

- **`permissions.py`**
  - `IsAdminUser` - Permissão customizada para admins

- **`email_utils.py`**
  - `send_credentials_email()` - Envia credenciais para novo usuário
  - `send_password_reset_email()` - Reset de senha (futuro)

### 2. **Extractor** (`extractor/`)

Processamento de planilhas Excel e extração de produtos.

**Principais arquivos:**

- **`models.py`**
  - `SpreadsheetUpload` - Upload de planilha
  - `Product` - Produto extraído
  - `ProductVariant` - Variações do produto (cores, tamanhos, etc)
  - `ColumnMapping` - Mapeamento de colunas

- **`views.py`**
  - `SpreadsheetUploadViewSet` - CRUD de uploads
    - `upload/` - Upload de arquivo
    - `preview/` - Visualizar preview da planilha
  - `ColumnMappingViewSet` - Gerenciar mapeamentos
    - `process/` - Processar planilha com mapeamento
  - `ProductViewSet` - Gerenciar produtos extraídos
    - Filtros por upload_id
  - `ProductExportView` - Exportar produtos
    - Formatos: JSON, CSV, XML
    - Exportar todos, selecionados ou individual

- **`services/spreadsheet_processor.py`**
  - `SpreadsheetProcessor` - Classe principal de processamento
    - `load_spreadsheet()` - Carrega planilha filtrando colunas ocultas
    - `process()` - Extrai produtos da planilha
    - `_extract_product_data()` - Extrai dados de um produto
    - `_extract_variants()` - Extrai variações do produto

- **`utils/spreadsheet_detector.py`**
  - `find_header_row()` - Detecta linha de cabeçalho
  - `detect_variant_columns()` - Detecta colunas de variação
  - `get_hidden_columns()` - Detecta colunas ocultas no Excel
  - `remove_hidden_columns()` - Remove colunas ocultas do DataFrame

---

## 💾 Modelos de Dados

### Authentication

#### **User**
```python
{
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "is_admin": true,
    "is_active": true,
    "last_activity": "2025-11-07T12:00:00Z"
}
```

#### **RefreshToken**
```python
{
    "id": 1,
    "user": 1,
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "expires_at": "2025-11-08T12:00:00Z",
    "is_blacklisted": false,
    "created_at": "2025-11-07T12:00:00Z"
}
```

### Extractor

#### **SpreadsheetUpload**
```python
{
    "id": 1,
    "file": "/media/uploads/planilha.xlsx",
    "original_filename": "produtos.xlsx",
    "total_rows": 150,
    "total_columns": 12,
    "uploaded_at": "2025-11-07T12:00:00Z",
    "uploaded_by": 1
}
```

#### **Product**
```python
{
    "id": 1,
    "upload": 1,
    "code": "PROD-001",
    "name": "Camiseta Premium",
    "description": "Camiseta 100% algodão",
    "ncm": "6109.10.00",
    "created_at": "2025-11-07T12:00:00Z"
}
```

#### **ProductVariant**
```python
{
    "id": 1,
    "product": 1,
    "variant_code": "PROD-001-P-AZUL",
    "dimensions": {"altura": 30, "largura": 40, "profundidade": 2},
    "weight": 0.25,
    "cubic_weight": 0.5,
    "prices": {
        "Preço Atacado": 25.90,
        "Preço Varejo": 39.90,
        "Preço Revenda": 32.50
    },
    "additional_data": {"tamanho": "P", "cor": "Azul"}
}
```

#### **ColumnMapping**
```python
{
    "id": 1,
    "upload": 1,
    "code_column": 0,
    "name_column": 1,
    "description_column": 2,
    "ncm_column": 3,
    "dimensions_column": {"altura": 4, "largura": 5, "profundidade": 6},
    "weight_column": 7,
    "cubic_weight_column": 8,
    "price_columns": [
        {"index": 9, "name": "Preço Atacado"},
        {"index": 10, "name": "Preço Varejo"}
    ],
    "variant_columns": [11, 12],
    "created_at": "2025-11-07T12:00:00Z"
}
```

---

## 🌐 Endpoints da API

### **Autenticação** (`/api/auth/`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/register/` | Registrar novo usuário | Não |
| POST | `/login/` | Login (retorna JWT) | Não |
| POST | `/logout/` | Logout | Sim |
| GET/PUT/PATCH | `/profile/` | Ver/editar perfil | Sim |
| POST | `/change-password/` | Alterar senha | Sim |
| GET | `/check-session/` | Verificar sessão | Sim |

### **Admin de Usuários** (`/api/auth/users/`)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/` | Listar usuários | Admin |
| POST | `/create/` | Criar usuário | Admin |
| GET/PUT/PATCH/DELETE | `/{id}/` | CRUD de usuário | Admin |
| POST | `/{id}/toggle-active/` | Ativar/desativar | Admin |

### **Uploads** (`/api/uploads/`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/` | Listar uploads | Sim |
| POST | `/upload/` | Upload de planilha | Sim |
| GET | `/{id}/` | Detalhes do upload | Sim |
| GET | `/{id}/preview/` | Preview da planilha | Sim |
| DELETE | `/{id}/` | Deletar upload | Sim |

### **Mapeamentos** (`/api/mappings/`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/` | Listar mapeamentos | Sim |
| POST | `/` | Criar mapeamento | Sim |
| GET | `/{id}/` | Detalhes do mapeamento | Sim |
| PUT/PATCH | `/{id}/` | Atualizar mapeamento | Sim |
| POST | `/{id}/process/` | Processar planilha | Sim |
| DELETE | `/{id}/` | Deletar mapeamento | Sim |

### **Produtos** (`/api/products/`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/` | Listar produtos | Sim |
| GET | `/?upload_id={id}` | Filtrar por upload | Sim |
| GET | `/{id}/` | Detalhes do produto | Sim |
| DELETE | `/{id}/` | Deletar produto | Sim |

### **Exportação** (`/api/export/`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/` | Exportar produtos | Sim |

**Body da requisição:**
```json
{
  "format": "json|csv|xml",
  "upload_id": 1,
  "product_ids": [1, 2, 3]  // Opcional (vazio = todos)
}
```

---

## ⚙️ Configuração

### **Settings por Ambiente**

#### **base.py** - Configurações compartilhadas
- Apps instalados
- Middleware
- Templates
- REST Framework
- JWT settings
- Validação de senha
- Internacionalização

#### **development.py** - Desenvolvimento
```python
DEBUG = True
ALLOWED_HOSTS = ['*']
DATABASE = SQLite
EMAIL_BACKEND = console
```

#### **production.py** - Produção
```python
DEBUG = False
ALLOWED_HOSTS = ['.onrender.com', 'dominio.com']
DATABASE = PostgreSQL (via DATABASE_URL)
EMAIL_BACKEND = SMTP
HTTPS = Obrigatório
```

#### **docker.py** - Docker
```python
DEBUG = True
ALLOWED_HOSTS = ['*']
DATABASE = PostgreSQL (docker-compose)
```

### **Variáveis de Ambiente**

Arquivo `.env` (criar baseado em `.env.example`):

```env
# Django
DJANGO_SECRET_KEY=sua-chave-secreta
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-app

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://seu-frontend.com
```

---

## 📄 Arquivos Importantes

### **manage.py**
CLI do Django para comandos administrativos:
```bash
python manage.py runserver        # Servidor desenvolvimento
python manage.py makemigrations   # Criar migrações
python manage.py migrate          # Aplicar migrações
python manage.py createsuperuser  # Criar admin
python manage.py create_admin     # Criar admin automático
python manage.py shell            # Shell interativo
```

### **requirements.txt**
Todas as dependências Python do projeto. Instalar com:
```bash
pip install -r requirements.txt
```

### **Dockerfile**
Build da imagem Docker:
```bash
docker build -t extrator-backend .
docker run -p 8000:8000 extrator-backend
```

### **scripts/exemplo_uso.py**
Exemplo de uso da API com Python `requests`.

---

## 🔐 Autenticação JWT

### **Como funciona:**

1. **Login** - POST `/api/auth/login/`
   ```json
   {
     "username": "admin",
     "password": "senha123"
   }
   ```
   **Resposta:**
   ```json
   {
     "access": "eyJ0eXAiOiJKV1...",  // Válido por 10 minutos
     "refresh": "eyJ0eXAiOiJKV1...", // Válido por 1 dia
     "user": {...}
   }
   ```

2. **Usar Access Token**
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1...
   ```

3. **Renovar Token** - POST `/api/auth/token/refresh/`
   ```json
   {
     "refresh": "eyJ0eXAiOiJKV1..."
   }
   ```

4. **Logout** - POST `/api/auth/logout/`
   ```json
   {
     "refresh": "eyJ0eXAiOiJKV1..."
   }
   ```

---

## 🚀 Fluxo de Processamento

1. **Upload** - Usuário faz upload da planilha
2. **Preview** - Sistema detecta estrutura e mostra preview
3. **Mapeamento** - Usuário mapeia colunas (código, nome, preços, etc)
4. **Processamento** - Sistema extrai produtos e variações
5. **Exportação** - Usuário exporta em JSON, CSV ou XML

---

## 🧪 Testes

```bash
# Executar todos os testes
python manage.py test

# Testar app específico
python manage.py test authentication
python manage.py test extractor

# Com coverage
coverage run --source='.' manage.py test
coverage report
```

---

## 📦 Deploy

### **Render.com**

1. Criar Web Service no Render
2. Configurar build command: `pip install -r requirements.txt`
3. Configurar start command: `gunicorn backend.wsgi:application`
4. Adicionar variáveis de ambiente
5. Deploy automático a cada push

### **Docker**

```bash
docker-compose up -d
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ usando Django**
