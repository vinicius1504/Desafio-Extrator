# 🚀 DEPLOY RÁPIDO - GUIA RESUMIDO

## 📦 PASSO 1: BACKEND (Railway)

1. **Acesse:** https://railway.app/
2. **New Project** → **Deploy from GitHub**
3. **Selecione** seu repositório
4. **Adicione** PostgreSQL: **+ New** → **Database** → **PostgreSQL**
5. **Configure Variáveis** (Settings → Variables):

```bash
DJANGO_SETTINGS_MODULE=backend.settings.production
SECRET_KEY=gerar-com-comando-abaixo
DEBUG=False
ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}},*.railway.app
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

6. **Gerar SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

7. **Copie** a URL pública do Railway (ex: `https://xxx.railway.app`)

---

## ▲ PASSO 2: FRONTEND (Vercel)

1. **Acesse:** https://vercel.com/
2. **Add New Project** → **Import Git Repository**
3. **Configure:**
   - Root Directory: `frontend`
   - Framework: Vite (auto-detectado)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Adicione Variável** (Settings → Environment Variables):
```bash
VITE_API_BASE_URL=https://SEU-APP.railway.app/api
```
*(Substitua pela URL do Railway do Passo 1.7)*

5. **Deploy** → Copie a URL da Vercel (ex: `https://xxx.vercel.app`)

---

## 🔄 PASSO 3: CONECTAR

1. **Volte ao Railway** → Settings → Variables
2. **Atualize:**
```bash
CORS_ALLOWED_ORIGINS=https://SEU-APP.vercel.app
CSRF_TRUSTED_ORIGINS=https://SEU-APP.vercel.app
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```
*(Substitua pela URL da Vercel do Passo 2.5)*

---

## 👤 PASSO 4: CRIAR ADMIN

No Railway → Settings → CLI:

```bash
python manage.py createsuperuser
```

Ou:

```bash
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@email.com', 'senha123', is_admin=True)" | python manage.py shell
```

---

## ✅ PRONTO!

🎉 **Acesse:** https://SEU-APP.vercel.app

**Admin Django:** https://SEU-APP.railway.app/admin

---

## 🐛 PROBLEMAS COMUNS

**CORS Error:**
- Verifique `CORS_ALLOWED_ORIGINS` no Railway
- Deve incluir URL da Vercel com HTTPS

**Build Failed:**
- Veja logs no Railway/Vercel
- Verifique `requirements.txt`

**Database Error:**
- Verifique se PostgreSQL está rodando
- Rode migrations: `python manage.py migrate`

---

📖 **GUIA COMPLETO:** Veja [DEPLOY.md](./DEPLOY.md) para instruções detalhadas
