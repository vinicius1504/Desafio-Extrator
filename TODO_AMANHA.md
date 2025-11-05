# 📋 TODO - Continuar Amanhã

## ✅ O que foi feito hoje (05/11/2025)

### Backend - Sistema de Autenticação Completo
- ✅ Instalado `djangorestframework-simplejwt`
- ✅ Criado app `authentication`
- ✅ Models: `User` (customizado) e `RefreshToken`
- ✅ Serializers completos para auth e admin
- ✅ Views: Login, Logout, Register, Profile, ChangePassword, CheckSession
- ✅ Views Admin: UserList, UserCreate, UserDetail, UserToggleActive
- ✅ URLs configuradas em `/api/auth/`
- ✅ Settings configurados (JWT, timeout 10min)
- ✅ Admin Django configurado
- ✅ Migrations criadas e aplicadas

### Frontend - Login e Proteção de Rotas
- ✅ authAPI completo com interceptors JWT
- ✅ AuthContext e AuthProvider
- ✅ Hook useAuth
- ✅ Página de Login (design moderno)
- ✅ PrivateRoute para proteger rotas
- ✅ Layout atualizado (logout, user info, badge admin)
- ✅ Todas as rotas protegidas
- ✅ Sistema de tratamento de rotas (404, ErrorBoundary)

---

## 🚀 O que fazer AMANHÃ

### 1. **Criar Superusuário no Backend** (PRIMEIRO PASSO!)
```bash
cd backend
python manage.py createsuperuser

# Preencher:
# Username: admin
# Email: admin@example.com
# Password: (sua senha)
# Password (again): (confirmar senha)
```

### 2. **Testar Sistema de Login**
1. Iniciar backend: `cd backend && python manage.py runserver`
2. Iniciar frontend: `cd frontend && npm run dev`
3. Acessar: `http://localhost:5173`
4. Fazer login com superusuário criado
5. Verificar se:
   - Login funciona
   - Token é salvo
   - Rotas protegidas funcionam
   - Logout funciona
   - Badge "Admin" aparece

### 3. **Criar Página de Perfil/Admin** (PRIORIDADE ALTA)

#### 3.1. Criar `ProfilePage.tsx`
**Localização:** `frontend/src/pages/ProfilePage.tsx`

**Funcionalidades:**
- Ver perfil do usuário logado
- Editar dados pessoais (nome, email)
- Trocar senha
- **SE for admin:** Mostrar painel de gerenciamento de usuários

**Seções:**
1. **Informações Pessoais**
   - Nome, email, username
   - Botão "Editar Perfil"

2. **Alterar Senha**
   - Senha atual
   - Nova senha
   - Confirmar nova senha
   - Botão "Alterar Senha"

3. **Painel Admin** (só se `user.is_admin === true`)
   - Listar todos os usuários
   - Criar novo usuário
   - Editar usuário
   - Ativar/Desativar usuário
   - Deletar usuário (com confirmação)

#### 3.2. Componentes a criar

**`components/features/admin/UserList.tsx`**
- Tabela com todos os usuários
- Colunas: Username, Email, Admin, Ativo, Criado em, Ações
- Ações: Editar, Ativar/Desativar, Deletar

**`components/features/admin/UserForm.tsx`**
- Formulário para criar/editar usuário
- Campos: username, email, senha, nome, sobrenome
- Checkbox: É administrador?
- Botões: Salvar, Cancelar

**`components/features/admin/UserDeleteModal.tsx`**
- Modal de confirmação para deletar usuário
- Aviso de que não pode desfazer

**`components/features/profile/ProfileInfoCard.tsx`**
- Card com informações do perfil
- Formulário de edição (toggle)

**`components/features/profile/ChangePasswordCard.tsx`**
- Card para alterar senha
- Formulário com validação

#### 3.3. Adicionar rota no App.tsx
```tsx
<Route
  path="/profile"
  element={
    <PrivateRoute>
      <ProfilePage />
    </PrivateRoute>
  }
/>
```

#### 3.4. Adicionar link no Layout
```tsx
<Link to="/profile" className="...">
  <User className="h-4 w-4" />
  Perfil
</Link>
```

### 4. **Criar Hooks Auxiliares**

**`hooks/useUsers.ts`** (para admin)
```typescript
// Hook para gerenciar lista de usuários
// - getUsers()
// - createUser()
// - updateUser()
// - deleteUser()
// - toggleActive()
```

**`hooks/useProfile.ts`**
```typescript
// Hook para gerenciar perfil
// - updateProfile()
// - changePassword()
```

### 5. **Ajustes e Melhorias**

- [ ] Adicionar toast/notificação de sucesso/erro
- [ ] Melhorar validação de formulários
- [ ] Adicionar confirmação antes de ações destrutivas
- [ ] Testar dark mode em todas as páginas novas
- [ ] Testar responsividade mobile
- [ ] Adicionar loading states em todas as ações

### 6. **Testes Finais**

1. **Fluxo de Admin:**
   - Login como admin
   - Criar novo usuário
   - Editar usuário
   - Ativar/Desativar usuário
   - Deletar usuário
   - Logout

2. **Fluxo de Usuário Normal:**
   - Login como usuário normal
   - Verificar que NÃO vê painel admin
   - Editar próprio perfil
   - Trocar senha
   - Logout

3. **Verificar Timeout:**
   - Fazer login
   - Ficar inativo por 10 minutos
   - Verificar se é deslogado automaticamente

4. **Testar Refresh Token:**
   - Fazer login
   - Aguardar access token expirar (10min)
   - Fazer uma ação (deve renovar automaticamente)

---

## 📁 Estrutura de Arquivos a Criar

```
frontend/src/
├── pages/
│   └── ProfilePage.tsx               ← CRIAR
├── components/
│   └── features/
│       ├── admin/
│       │   ├── UserList.tsx          ← CRIAR
│       │   ├── UserForm.tsx          ← CRIAR
│       │   ├── UserDeleteModal.tsx   ← CRIAR
│       │   └── index.ts              ← CRIAR
│       └── profile/
│           ├── ProfileInfoCard.tsx   ← CRIAR
│           ├── ChangePasswordCard.tsx← CRIAR
│           └── index.ts              ← CRIAR
└── hooks/
    ├── useUsers.ts                   ← CRIAR
    └── useProfile.ts                 ← CRIAR
```

---

## 🔧 Comandos Úteis

### Backend
```bash
# Criar superusuário
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver

# Ver usuários no admin Django
# http://localhost:8000/admin

# Criar novo usuário via shell (se necessário)
python manage.py shell
>>> from authentication.models import User
>>> user = User.objects.create_user('teste', 'teste@test.com', 'senha123')
>>> user.is_admin = False
>>> user.save()
```

### Frontend
```bash
# Instalar dependências (se necessário)
npm install

# Iniciar dev server
npm run dev

# Build para produção
npm run build

# Limpar localStorage (se bugs com token)
# No console do navegador:
localStorage.clear()
```

---

## 🐛 Possíveis Problemas e Soluções

### Problema: CORS error ao fazer login
**Solução:** Verificar `CORS_ALLOWED_ORIGINS` no backend settings

### Problema: 401 Unauthorized em todas as requests
**Solução:**
1. Verificar se token está no localStorage
2. Verificar se interceptor está funcionando
3. Limpar localStorage e fazer login novamente

### Problema: Sessão não expira após 10 minutos
**Solução:** Verificar lógica no `AuthContext` e endpoint `check-session`

### Problema: Refresh token não renova
**Solução:** Verificar interceptor de resposta no `api.ts`

### Problema: Database locked
**Solução:**
```bash
# Parar todos os processos do Django
# Deletar db.sqlite3
rm db.sqlite3
# Rodar migrations novamente
python manage.py migrate
python manage.py createsuperuser
```

---

## 📝 Notas Importantes

1. **NÃO deletar `db.sqlite3`** depois de criar o superusuário - você vai perder todos os dados!

2. **Sempre testar com 2 usuários:**
   - 1 admin (superusuário)
   - 1 usuário normal (criar via painel admin)

3. **Dark mode:** Todas as novas páginas devem suportar dark mode

4. **Validação:** Backend já valida, mas frontend também deve validar antes de enviar

5. **Loading states:** SEMPRE mostrar loading durante requisições

6. **Error handling:** SEMPRE tratar erros e mostrar mensagem ao usuário

---

## 🎯 Objetivo Final

Ter um sistema completo com:
- ✅ Login/Logout funcionando
- ✅ Proteção de rotas
- ✅ Timeout de 10 minutos
- 🔲 Página de perfil
- 🔲 Painel admin para gerenciar usuários
- 🔲 CRUD completo de usuários (apenas admin)

---

## 💡 Dicas para Amanhã

1. **Comece criando o superusuário** - sem isso você não consegue testar nada
2. **Teste o login primeiro** - garanta que está funcionando antes de continuar
3. **Crie a ProfilePage simples primeiro** - depois adiciona o painel admin
4. **Use os componentes existentes** - Card, Button, Input, Alert, Table
5. **Siga o padrão do sistema** - olhe MappingPage e ProductsPage como referência
6. **Teste cada feature antes de passar para próxima**

---

**Boa sorte amanhã! 🚀**
