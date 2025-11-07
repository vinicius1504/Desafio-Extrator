# ⚛️ Frontend - Sistema Extrator de Planilhas

Interface moderna construída com React, TypeScript e Vite para gerenciamento e processamento de planilhas Excel.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Componentes](#componentes)
- [Hooks Customizados](#hooks-customizados)
- [Contextos](#contextos)
- [Páginas](#páginas)
- [Rotas](#rotas)
- [Configuração](#configuração)

---

## 🛠 Tecnologias

- **React 18.3** - Biblioteca UI
- **TypeScript 5.6** - Tipagem estática
- **Vite 5.4** - Build tool ultrarrápido
- **React Router 7.1** - Roteamento
- **Tailwind CSS 3.4** - Estilização
- **Framer Motion 11.15** - Animações
- **Lucide React** - Ícones
- **Axios** - HTTP client
- **Shadcn/ui** - Componentes base

---

## 📁 Estrutura do Projeto

```
frontend/
├── public/                 # Arquivos estáticos
│   └── vite.svg
│
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── common/       # Componentes comuns
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   └── AdminRoute.tsx
│   │   │
│   │   ├── features/     # Componentes por feature
│   │   │   ├── admin/   # Gerenciamento de usuários
│   │   │   ├── mapping/ # Mapeamento de colunas
│   │   │   ├── products/ # Listagem de produtos
│   │   │   ├── profile/ # Perfil do usuário
│   │   │   └── upload/  # Upload de arquivos
│   │   │
│   │   ├── layout/      # Layout e navegação
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   └── ui/          # Componentes UI base (shadcn)
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Alert.tsx
│   │       ├── AnimatedPage.tsx
│   │       ├── AnimatedCard.tsx
│   │       └── ...
│   │
│   ├── contexts/         # Context API
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/           # Hooks customizados
│   │   ├── useProducts.ts
│   │   ├── useExport.ts
│   │   ├── useUpload.ts
│   │   ├── usePreview.ts
│   │   └── useColumnMapping.ts
│   │
│   ├── lib/             # Configurações e utilitários
│   │   ├── api.ts       # Cliente Axios
│   │   └── utils.ts     # Funções utilitárias
│   │
│   ├── pages/           # Páginas da aplicação
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── MappingPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── AdminUsersPage.tsx
│   │
│   ├── types/           # Definições de tipos TypeScript
│   │   └── index.ts
│   │
│   ├── App.tsx          # Componente raiz
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais (Tailwind)
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---


## 🛣 Rotas

```tsx
/                    # Home (pública)
/login               # Login (pública)
/upload              # Upload (privada)
/mapping/:uploadId   # Mapeamento (privada)
/products/:uploadId  # Produtos (privada)
/profile             # Perfil (privada)
/admin/users         # Admin Usuários (admin)
```

## 🚀 Scripts

```bash
# Desenvolvimento
npm run dev

# Build produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 🎯 Boas Práticas

### **Componentes**

- ✅ Um componente por arquivo
- ✅ Props tipadas com TypeScript
- ✅ Usar componentes funcionais com hooks
- ✅ Memoizar componentes pesados (`React.memo`)
- ✅ Lazy loading para rotas (`React.lazy`)

### **Estado**

- ✅ Context API para estado global
- ✅ Hooks customizados para lógica reutilizável
- ✅ Estados locais para UI

### **Estilos**

- ✅ Tailwind CSS para estilização
- ✅ Classes utilitárias first
- ✅ Componentes do design system
- ✅ Dark mode support

### **Performance**

- ✅ Code splitting por rota
- ✅ Lazy loading de imagens
- ✅ Debounce em buscas
- ✅ Paginação (load more)

---

## 🧪 Testes

```bash
# Testes unitários (futuro)
npm run test

# Coverage
npm run test:coverage

# E2E (futuro)
npm run test:e2e
```

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

**Desenvolvido com ❤️ usando React + TypeScript**
