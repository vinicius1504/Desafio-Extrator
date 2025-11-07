# Deploy no Fly.io via Interface Web (GitHub)

Guia para fazer deploy do backend Django no Fly.io usando a interface web e integração com GitHub.

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Repositório com o código (público ou privado)
- ✅ Conta no Fly.io (gratuita): https://fly.io/signup

## 🚀 Passo a Passo

### 1. Criar Conta no Fly.io

1. Acesse: https://fly.io/signup
2. Escolha **"Sign in with GitHub"** (recomendado)
3. Autorize o Fly.io a acessar sua conta do GitHub
4. Complete o cadastro (pode pedir cartão de crédito, mas não cobra no plano gratuito)

### 2. Preparar o Repositório

Certifique-se de que seu repositório tem os arquivos necessários:

```
seu-repo/
├── backend/
│   ├── Dockerfile ✅
│   ├── fly.toml ✅
│   ├── requirements.txt ✅
│   ├── manage.py
│   └── backend/
│       └── settings/
│           └── production.py ✅
```

**Commit e push** para o GitHub se ainda não fez:
```bash
git add .
git commit -m "Add Fly.io configuration"
git push origin main
```

### 3. Criar App no Fly.io Dashboard

#### Opção A: Via Dashboard (Recomendado para iniciantes)

1. **Acesse o Dashboard**: https://fly.io/dashboard
2. **Clique em "Create App"** ou "New App"
3. **Configure a aplicação**:
   - **App Name**: `desafio-extrator-backend` (ou outro nome único)
   - **Region**: Escolha `São Paulo (gru)` ou `Rio de Janeiro (gig)`
   - **Organization**: Deixe a padrão (personal)

#### Opção B: Via GitHub Actions (Deploy Automático)

Vamos configurar para fazer deploy automático quando você fizer push:

1. **No Dashboard do Fly.io**:
   - Vá em https://fly.io/user/personal_access_tokens
   - Clique em "Create token"
   - Dê um nome: `github-actions`
   - Copie o token gerado (só aparece uma vez!)

2. **No seu repositório GitHub**:
   - Vá em **Settings** → **Secrets and variables** → **Actions**
   - Clique em **"New repository secret"**
   - Nome: `FLY_API_TOKEN`
   - Value: Cole o token do Fly.io
   - Clique em **"Add secret"**

### 4. Configurar PostgreSQL

#### Via Dashboard do Fly.io:

1. No menu lateral, clique em **"Postgres"**
2. Clique em **"Create Postgres cluster"**
3. Configure:
   - **App name**: `desafio-extrator-db` (ou outro nome)
   - **Region**: Mesma região do backend (gru ou gig)
   - **Configuration**: Escolha **"Development - Single node"** (plano gratuito)
   - **Postgres version**: Deixe a mais recente
4. Clique em **"Create Postgres cluster"**
5. **Copie a DATABASE_URL** que aparecerá (formato: `postgres://user:pass@host:5432/dbname`)

#### Conectar o banco ao app:

1. Volte para o dashboard do seu app backend
2. Vá em **Settings** → **Secrets**
3. Adicione a secret `DATABASE_URL` com o valor copiado

### 5. Configurar Variáveis de Ambiente (Secrets)

No Dashboard do Fly.io, no seu app:

1. Vá em **Settings** → **Secrets**
2. Clique em **"Add secret"** para cada variável:

```bash
# Obrigatórias
SECRET_KEY = "sua-secret-key-super-segura-aqui"
DEBUG = False
DATABASE_URL = postgres://user:pass@host:5432/dbname

# Hosts e CORS
ALLOWED_HOSTS = desafio-extrator-backend.fly.dev
CORS_ALLOWED_ORIGINS = https://seu-frontend.vercel.app,http://localhost:5173
CSRF_TRUSTED_ORIGINS = https://seu-frontend.vercel.app,https://desafio-extrator-backend.fly.dev

# Email (Gmail)
EMAIL_HOST_USER = seu-email@gmail.com
EMAIL_HOST_PASSWORD = sua-senha-de-app-gmail
DEFAULT_FROM_EMAIL = seu-email@gmail.com

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

**Dica**: Para gerar SECRET_KEY segura:
```python
# Execute localmente
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 6. Deploy Manual (Primeira vez)

Você tem 2 opções:

#### Opção A: Via Fly.io CLI (Mais Simples)

Se preferir instalar o CLI apenas para o primeiro deploy:

```bash
# Instalar CLI (Windows PowerShell como Admin)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Login
fly auth login

# Deploy
cd backend
fly deploy
```

#### Opção B: Via GitHub Actions (Totalmente Web)

Crie o arquivo de workflow no seu repositório:

**Criar arquivo**: `.github/workflows/fly-deploy.yml`

```yaml
name: Deploy to Fly.io

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Fly.io
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Fly.io CLI
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Fly.io
        run: flyctl deploy --remote-only
        working-directory: ./backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**Commit e push**:
```bash
git add .github/workflows/fly-deploy.yml
git commit -m "Add Fly.io auto-deploy workflow"
git push origin main
```

Agora toda vez que você fizer push na branch `main`, o deploy será automático!

### 7. Verificar Deploy

1. **Ver logs do deploy**:
   - Dashboard → Seu App → **Monitoring** → **Logs**

2. **Ver status**:
   - Dashboard → Seu App → **Overview**

3. **Acessar a aplicação**:
   - API: `https://seu-app.fly.dev/api/`
   - Admin: `https://seu-app.fly.dev/admin/`

### 8. Criar Super Usuário (Admin)

Via Dashboard (Console SSH):

1. Dashboard → Seu App → **Console**
2. Execute:
```bash
python manage.py createsuperuser
```

Ou via CLI:
```bash
fly ssh console -a desafio-extrator-backend
python manage.py createsuperuser
```

### 9. Configurar Deploy Automático no GitHub

Se criou o workflow do GitHub Actions (Opção B), agora qualquer push fará deploy automático:

```bash
# Faça uma mudança no código
git add .
git commit -m "Update: minha mudança"
git push origin main

# O GitHub Actions fará o deploy automaticamente!
# Veja o progresso em: github.com/seu-user/seu-repo/actions
```

## 🔧 Estrutura dos Arquivos

### `backend/fly.toml`

Este arquivo já está criado e configurado:
- Define região (São Paulo)
- Configura health checks
- Define recursos (CPU, memória)
- Configura porta e HTTPS

### `backend/Dockerfile`

Já configurado para:
- Instalar dependências
- Coletar arquivos estáticos
- Rodar migrações automaticamente
- Usar Gunicorn em produção

### `.github/workflows/fly-deploy.yml`

Workflow para deploy automático via GitHub Actions.

## 📊 Monitoramento

### Via Dashboard:

1. **Logs em tempo real**:
   - Dashboard → Seu App → **Monitoring** → **Logs**

2. **Métricas de uso**:
   - Dashboard → Seu App → **Metrics**

3. **Health checks**:
   - Dashboard → Seu App → **Overview** (ver status)

### Via CLI (se instalou):

```bash
# Ver logs
fly logs -a desafio-extrator-backend

# Ver status
fly status -a desafio-extrator-backend

# Abrir app no navegador
fly open -a desafio-extrator-backend
```

## 🔄 Atualizações

### Deploy Automático (com GitHub Actions):
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Deploy automático! 🎉
```

### Deploy Manual (com CLI):
```bash
cd backend
fly deploy
```

## 🐛 Troubleshooting

### App não inicia

1. **Verificar logs**: Dashboard → Logs
2. **Comum**: Falta variável `DATABASE_URL`
   - Vá em Settings → Secrets
   - Adicione `DATABASE_URL`

### Erro 502 Bad Gateway

- App ainda está inicializando (aguarde 1-2 minutos)
- Veja os logs para erros

### Banco de dados não conecta

1. Verifique se o banco PostgreSQL está rodando:
   - Dashboard → Postgres → Seu banco → Status
2. Verifique se a `DATABASE_URL` está correta
3. Teste conexão via console:
```bash
fly ssh console
python manage.py dbshell
```

### Migrações não aplicadas

Execute manualmente:
```bash
fly ssh console
python manage.py migrate
```

### Static files não carregam

```bash
fly ssh console
python manage.py collectstatic --noinput
```

## 💰 Custos (Plano Gratuito)

### Fly.io Free Tier:
- ✅ **3 VMs** compartilhadas (256MB RAM cada)
- ✅ **160GB** de tráfego de saída/mês
- ✅ **3GB** de armazenamento persistente

### PostgreSQL Free:
- ✅ **1 banco Development** (256MB RAM, 1GB disk)

**Nota**: Cartão de crédito é necessário mas **não cobra** se ficar no plano gratuito.

## 🔒 Segurança

Já configurado no projeto:
- ✅ HTTPS forçado
- ✅ Cookies seguros
- ✅ HSTS habilitado
- ✅ Proteção XSS
- ✅ Whitenoise para estáticos
- ✅ Gunicorn como servidor WSGI

## 🌐 Próximo Passo: Frontend

Depois do backend no ar, faça deploy do frontend:

### Opções:
1. **Vercel** (Recomendado para React/Vite)
   - Conecta com GitHub
   - Deploy automático
   - HTTPS gratuito

2. **Netlify**
   - Similar ao Vercel
   - Interface amigável

3. **Cloudflare Pages**
   - CDN global
   - Muito rápido

**Lembre-se**: Atualize a `VITE_API_URL` no frontend:
```env
VITE_API_URL=https://desafio-extrator-backend.fly.dev/api
```

## 📚 Recursos

- **Fly.io Docs**: https://fly.io/docs/
- **Dashboard**: https://fly.io/dashboard
- **Status**: https://status.fly.io/
- **Community**: https://community.fly.io/
- **Pricing**: https://fly.io/docs/about/pricing/

---

## ✅ Checklist Final

- [ ] Conta no Fly.io criada via GitHub
- [ ] Repositório com código commitado
- [ ] `fly.toml` configurado no backend
- [ ] App criado no Fly.io
- [ ] PostgreSQL criado e conectado
- [ ] Todas as secrets configuradas
- [ ] GitHub Actions configurado (opcional)
- [ ] Primeiro deploy realizado
- [ ] Super usuário criado
- [ ] API funcionando (teste em /api/)
- [ ] Frontend atualizado com nova URL

**Pronto!** Seu backend está no ar! 🚀
