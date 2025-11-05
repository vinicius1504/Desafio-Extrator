# 🚀 GUIA DE DEPLOY - Railway + Vercel

Deploy completo da aplicação **Extrator de Planilhas** em produção.

---

## 📋 PRÉ-REQUISITOS

- [ ] Conta no [Railway](https://railway.app/) (grátis)
- [ ] Conta no [Vercel](https://vercel.com/) (grátis)
- [ ] Conta no GitHub (para conectar os repositórios)
- [ ] Git instalado localmente
- [ ] Código commitado no GitHub

---

## 🎯 ARQUITETURA DE DEPLOY

```
┌─────────────────────────────────────────┐
│  USUÁRIO                                │
└────────────┬────────────────────────────┘
             │
             ├─── Frontend (Vercel)
             │    ├─ React + Vite
             │    ├─ https://seu-app.vercel.app
             │    └─ Deploy automático via GitHub
             │
             └─── Backend (Railway)
                  ├─ Django + PostgreSQL
                  ├─ https://seu-app.railway.app
                  └─ Deploy automático via GitHub
```

---

## 🔧 PARTE 1: PREPARAR O PROJETO

### 1.1 Criar Repositório no GitHub

```bash
# Se ainda não tem repositório, criar:
git init
git add .
git commit -m "Preparar para deploy"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

### 1.2 Verificar Arquivos de Configuração

Certifique-se que os seguintes arquivos existem:

```
✅ backend/Dockerfile
✅ backend/requirements.txt
✅ backend/backend/settings/production.py
✅ railway.json
✅ frontend/vercel.json
✅ .env.production.example
```

---

## 🚂 PARTE 2: DEPLOY DO BACKEND (Railway)

### 2.1 Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app/)
2. Clique em **"Start a New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Autorize o Railway a acessar seu GitHub
5. Selecione o repositório do projeto
6. Railway vai detectar automaticamente o Dockerfile

### 2.2 Adicionar PostgreSQL

1. No seu projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Railway vai criar o banco e gerar a variável `DATABASE_URL` automaticamente

### 2.3 Configurar Variáveis de Ambiente

No Railway, vá em **Settings** → **Variables** e adicione:

```bash
# Django
DJANGO_SETTINGS_MODULE=backend.settings.production
DEBUG=False

# SECRET KEY - Gerar nova chave segura
SECRET_KEY=cole-uma-chave-super-secreta-de-50-caracteres-aqui

# Hosts (Railway fornece automaticamente RAILWAY_PUBLIC_DOMAIN)
ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}},*.railway.app

# CORS - Atualizar depois com URL da Vercel
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173

# Security (desabilitar SSL redirect até ter HTTPS)
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
```

**⚠️ IMPORTANTE:** Depois de fazer deploy do frontend na Vercel, você vai atualizar as variáveis `CORS_ALLOWED_ORIGINS` e `CSRF_TRUSTED_ORIGINS`.

### 2.4 Gerar SECRET_KEY Segura

Execute localmente para gerar uma chave:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2.5 Deploy

1. Commit e push qualquer alteração para o GitHub
2. Railway vai fazer deploy automaticamente
3. Aguarde o build terminar (2-3 minutos)
4. Copie a URL pública (algo como `https://seu-app.up.railway.app`)

### 2.6 Verificar Logs

No Railway, vá em **"Deployments"** → **"View Logs"** para acompanhar.

### 2.7 Criar Usuário Admin

No Railway, vá em **"Settings"** → **"CLI"** e execute:

```bash
python manage.py createsuperuser
```

Ou use o comando one-liner:

```bash
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@email.com', 'senha123', is_admin=True)" | python manage.py shell
```

---

## ▲ PARTE 3: DEPLOY DO FRONTEND (Vercel)

### 3.1 Criar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com/)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Autorize a Vercel a acessar seu GitHub
5. Selecione o repositório do projeto

### 3.2 Configurar Build Settings

Vercel vai detectar automaticamente que é um projeto Vite. Configure:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: frontend
```

### 3.3 Configurar Variáveis de Ambiente

Na Vercel, vá em **"Settings"** → **"Environment Variables"** e adicione:

```bash
VITE_API_BASE_URL=https://seu-app.up.railway.app/api
```

**⚠️ SUBSTITUA** `https://seu-app.up.railway.app` pela URL real do Railway (Parte 2.5).

### 3.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build terminar (1-2 minutos)
3. Copie a URL pública (algo como `https://seu-app.vercel.app`)

---

## 🔄 PARTE 4: CONECTAR FRONTEND E BACKEND

### 4.1 Atualizar CORS no Railway

Agora que você tem a URL da Vercel, volte ao Railway e atualize as variáveis:

```bash
CORS_ALLOWED_ORIGINS=https://seu-app.vercel.app,https://seu-dominio-custom.com
CSRF_TRUSTED_ORIGINS=https://seu-app.vercel.app,https://seu-dominio-custom.com
```

Se estiver usando HTTPS (Railway fornece por padrão):

```bash
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### 4.2 Testar a Aplicação

1. Acesse `https://seu-app.vercel.app`
2. Tente fazer login
3. Se funcionar, está tudo OK! 🎉

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Erro CORS

**Sintoma:** Erro no console do navegador: `blocked by CORS policy`

**Solução:**
1. Verificar `CORS_ALLOWED_ORIGINS` no Railway
2. Certificar que inclui a URL da Vercel (com HTTPS)
3. Reiniciar o deploy no Railway

### Erro de Database

**Sintoma:** `FATAL: database does not exist`

**Solução:**
1. Verificar se PostgreSQL está rodando no Railway
2. Verificar se `DATABASE_URL` está configurado
3. Rodar migrations manualmente:

```bash
# No Railway CLI
python manage.py migrate
```

### Build Falhou no Railway

**Sintoma:** Build falha com erro de dependências

**Solução:**
1. Verificar `requirements.txt`
2. Verificar logs de build
3. Garantir que `Dockerfile` está correto

### Frontend não conecta ao Backend

**Sintoma:** Requests retornam 404 ou timeout

**Solução:**
1. Verificar `VITE_API_BASE_URL` na Vercel
2. Garantir que backend está rodando (acessar URL diretamente)
3. Verificar CORS

---

## 📊 MONITORAMENTO

### Railway (Backend)

- **Logs:** Settings → View Logs
- **Métricas:** Dashboard mostra CPU, RAM, Requests
- **Database:** Metrics → PostgreSQL usage

### Vercel (Frontend)

- **Analytics:** Analytics → Web Vitals
- **Logs:** Deployments → Function Logs
- **Bandwidth:** Settings → Usage

---

## 🔄 ATUALIZAÇÕES FUTURAS

### Deploy Automático

Ambos Railway e Vercel fazem **deploy automático** quando você faz push para o GitHub:

```bash
git add .
git commit -m "Nova feature"
git push origin main
```

- Railway vai fazer rebuild do backend
- Vercel vai fazer rebuild do frontend

### Rollback

Se algo der errado:

**Railway:**
1. Deployments → Selecionar deploy anterior → "Redeploy"

**Vercel:**
1. Deployments → Deploy anterior → "Promote to Production"

---

## 💰 CUSTOS

### Plano Gratuito (Suficiente para começar)

**Railway:**
- ✅ 500 horas/mês grátis
- ✅ PostgreSQL incluído
- ✅ 100GB bandwidth

**Vercel:**
- ✅ Deploy ilimitado
- ✅ 100GB bandwidth
- ✅ Serverless functions

### Quando Escalar?

- Railway cobra $0.000463/GB-s após limite
- Vercel Pro: $20/mês (mais recursos)

---

## ✅ CHECKLIST FINAL

- [ ] Backend rodando no Railway
- [ ] PostgreSQL conectado
- [ ] Migrations executadas
- [ ] Usuário admin criado
- [ ] Frontend rodando na Vercel
- [ ] CORS configurado corretamente
- [ ] Login funcionando
- [ ] Upload de planilha funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS habilitado (automático)

---

## 🎉 PARABÉNS!

Sua aplicação está no ar! 🚀

**URLs:**
- Frontend: `https://seu-app.vercel.app`
- Backend API: `https://seu-app.railway.app/api`
- Admin Django: `https://seu-app.railway.app/admin`

---

## 📚 RECURSOS ÚTEIS

- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
