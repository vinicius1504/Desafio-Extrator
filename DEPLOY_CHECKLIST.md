# ✅ CHECKLIST DE DEPLOY

Use esta checklist para garantir que tudo está configurado corretamente.

---

## 📋 PRÉ-DEPLOY

- [ ] Código commitado no GitHub
- [ ] Conta Railway criada
- [ ] Conta Vercel criada
- [ ] `.env.production.example` revisado
- [ ] Arquivos de configuração verificados:
  - [ ] `railway.json`
  - [ ] `Procfile`
  - [ ] `backend/Dockerfile`
  - [ ] `backend/requirements.txt`
  - [ ] `frontend/vercel.json`

---

## 🚂 RAILWAY (Backend)

### Configuração Inicial
- [ ] Projeto criado no Railway
- [ ] Repositório GitHub conectado
- [ ] PostgreSQL adicionado ao projeto
- [ ] Build bem-sucedido

### Variáveis de Ambiente
- [ ] `DJANGO_SETTINGS_MODULE=backend.settings.production`
- [ ] `SECRET_KEY` gerada (50+ caracteres)
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` configurado
- [ ] `DATABASE_URL` (automático do Railway)
- [ ] `CORS_ALLOWED_ORIGINS` configurado
- [ ] `CSRF_TRUSTED_ORIGINS` configurado
- [ ] Security flags configurados:
  - [ ] `SECURE_SSL_REDIRECT=True`
  - [ ] `SESSION_COOKIE_SECURE=True`
  - [ ] `CSRF_COOKIE_SECURE=True`

### Deploy e Verificação
- [ ] Deploy concluído com sucesso
- [ ] Logs verificados (sem erros)
- [ ] Migrations executadas
- [ ] URL pública copiada
- [ ] API acessível: `https://seu-app.railway.app/api/`
- [ ] Admin acessível: `https://seu-app.railway.app/admin/`

### Usuário Admin
- [ ] Superuser criado
- [ ] Login no admin funcionando
- [ ] Usuário tem `is_admin=True`

---

## ▲ VERCEL (Frontend)

### Configuração Inicial
- [ ] Projeto criado na Vercel
- [ ] Repositório GitHub conectado
- [ ] Root directory: `frontend`
- [ ] Framework detectado: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Variáveis de Ambiente
- [ ] `VITE_API_BASE_URL` configurado com URL do Railway

### Deploy e Verificação
- [ ] Build concluído com sucesso
- [ ] Deploy concluído
- [ ] URL pública copiada
- [ ] Site acessível: `https://seu-app.vercel.app`
- [ ] Assets carregando (CSS, JS, imagens)

---

## 🔗 INTEGRAÇÃO

### CORS e Comunicação
- [ ] Frontend consegue acessar backend
- [ ] Sem erros de CORS no console
- [ ] Requests autenticados funcionando
- [ ] Tokens JWT sendo salvos

### Funcionalidades
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Upload de planilha funciona
- [ ] Mapeamento de colunas funciona
- [ ] Visualização de produtos funciona
- [ ] Export funciona (JSON, CSV, XML)
- [ ] Profile page funciona
- [ ] Admin panel (se for admin) funciona

---

## 🔒 SEGURANÇA

- [ ] `DEBUG=False` em produção
- [ ] SECRET_KEY única e segura (não usar a do .env.example)
- [ ] HTTPS habilitado (Railway fornece automaticamente)
- [ ] CORS configurado apenas para domínios permitidos
- [ ] Cookies seguros (Secure, HttpOnly)
- [ ] Headers de segurança configurados

---

## 📊 MONITORAMENTO

### Railway
- [ ] Logs acessíveis
- [ ] Métricas de uso visíveis
- [ ] PostgreSQL metrics visíveis
- [ ] Alerts configurados (opcional)

### Vercel
- [ ] Analytics habilitado
- [ ] Logs de função acessíveis
- [ ] Métricas de performance visíveis

---

## 🧪 TESTES EM PRODUÇÃO

### Fluxo de Usuário Normal
- [ ] Registrar novo usuário
- [ ] Login com novo usuário
- [ ] Upload de planilha .xlsx
- [ ] Mapear colunas
- [ ] Ver produtos extraídos
- [ ] Exportar JSON
- [ ] Exportar CSV
- [ ] Logout

### Fluxo de Admin
- [ ] Login como admin
- [ ] Acessar gerenciar usuários
- [ ] Criar novo usuário
- [ ] Editar usuário
- [ ] Desativar/ativar usuário
- [ ] Ver perfil
- [ ] Alterar senha

---

## 🐛 TROUBLESHOOTING

### Problemas Comuns Checados
- [ ] CORS funcionando
- [ ] Database conectado
- [ ] Migrations rodadas
- [ ] Static files servindo
- [ ] Media uploads funcionando
- [ ] JWT tokens funcionando
- [ ] Session/cookies funcionando

---

## 📝 DOCUMENTAÇÃO

- [ ] URLs de produção documentadas
- [ ] Credenciais de admin salvas (local seguro)
- [ ] Variáveis de ambiente documentadas
- [ ] Processo de rollback documentado

---

## 🎉 DEPLOY FINALIZADO

Quando todos os itens acima estiverem ✅:

**PARABÉNS! Seu aplicativo está no ar!** 🚀

**URLs:**
- Frontend: `_________________`
- Backend: `_________________`
- Admin: `_________________`

**Próximos Passos:**
- Configurar domínio custom (opcional)
- Configurar monitoring/alertas
- Configurar backups do banco
- Documentar processo de atualização
