# Frontend - Extrator de Planilhas

Interface web para upload, configuração e visualização de dados extraídos de planilhas Excel.

## Status

✅ **COMPLETO E FUNCIONAL** - Frontend implementado com React + TypeScript + Tailwind CSS!

## Tecnologias Utilizadas

Stack escolhida e implementada:

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento
- **Zustand** - State management
- **Axios** - HTTP client
- **React Dropzone** - Upload de arquivos
- **Lucide React** - Ícones

## 🚀 Como Rodar o Projeto

### 1. Instalar Dependências
```bash
cd frontend
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

### 4. Build para Produção
```bash
npm run build
npm run preview
```

## Documentação da API

Consulte `/docs/FRONTEND_API_GUIDE.md` para:
- Endpoints disponíveis
- Exemplos de requisições
- Modelos de dados (TypeScript)
- Fluxo completo de integração
- Exemplos em React e Vue

## ✅ Funcionalidades Implementadas

### Página 1: Upload de Planilha (`/upload`)
- ✅ Input de arquivo com suporte a .xlsx, .xls, .csv, .ods
- ✅ Drag and drop funcional
- ✅ Preview de informações do arquivo selecionado
- ✅ Loading state durante upload
- ✅ Redirecionamento automático para mapeamento

### Página 2: Mapeamento de Colunas (`/mapping/:uploadId`)
- ✅ Tabela com preview das primeiras 10 linhas
- ✅ Selects para mapear cada coluna:
  - Código
  - Descrição
  - Dimensões
  - Cubagem
  - Peso
  - NCM
- ✅ Múltiplas colunas de preço (adicionar/remover dinamicamente)
- ✅ Input para definir linha inicial de dados
- ✅ Salvar e processar planilha

### Página 3: Visualização de Produtos (`/products/:uploadId`)
- ✅ Lista de produtos processados
- ✅ Expandir/colapsar variantes de cada produto
- ✅ Modal de exportação com 3 formatos (CSV, XML, JSON)
- ✅ Download automático de arquivos exportados
- ✅ Contadores e estatísticas

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                     # Componentes UI reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── index.ts
│   │   └── layout/
│   │       └── Layout.tsx          # Layout principal
│   ├── lib/
│   │   └── api.ts                  # Cliente API com Axios
│   ├── hooks/                      # Custom hooks (futuro)
│   ├── pages/
│   │   ├── HomePage.tsx            # Página inicial
│   │   ├── UploadPage.tsx          # Upload de planilhas
│   │   ├── MappingPage.tsx         # Mapeamento de colunas
│   │   └── ProductsPage.tsx        # Visualização de produtos
│   ├── store/
│   │   └── spreadsheetStore.ts     # Zustand store
│   ├── styles/
│   │   └── index.css               # Estilos globais e Tailwind
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## API Base URL

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Exemplo de Serviço API

```javascript
// src/services/api.js
const API_BASE = 'http://localhost:8000/api';

export const spreadsheetAPI = {
  // Upload de planilha
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/spreadsheets/`, {
      method: 'POST',
      body: formData
    });

    return response.json();
  },

  // Preview
  preview: async (uploadId) => {
    const response = await fetch(`${API_BASE}/spreadsheets/${uploadId}/preview/`);
    return response.json();
  },

  // Configurar mapeamento
  configureMapping: async (uploadId, mapping) => {
    const response = await fetch(`${API_BASE}/column-mappings/create_or_update/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upload: uploadId, ...mapping })
    });
    return response.json();
  },

  // Processar
  process: async (uploadId) => {
    const response = await fetch(`${API_BASE}/spreadsheets/${uploadId}/process/`, {
      method: 'POST'
    });
    return response.json();
  },

  // Listar produtos
  getProducts: async (uploadId) => {
    const response = await fetch(`${API_BASE}/products/?upload_id=${uploadId}`);
    return response.json();
  },

  // Exportar
  export: async (uploadId, format) => {
    const response = await fetch(
      `${API_BASE}/spreadsheets/${uploadId}/export/?format=${format}`
    );

    if (format === 'json') {
      return response.json();
    } else {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export.${format}`;
      a.click();
    }
  }
};
```

## Fluxo da Aplicação

```
1. Upload
   ↓
2. Preview → Configurar Mapeamento
   ↓
3. Processar
   ↓
4. Visualizar Resultados → Exportar
```

## Estados da Aplicação

```javascript
const [currentStep, setCurrentStep] = useState('upload'); // 'upload' | 'mapping' | 'results'
const [uploadId, setUploadId] = useState(null);
const [preview, setPreview] = useState(null);
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

## Bibliotecas Úteis

### UI Components
- **Material-UI**: `npm install @mui/material @emotion/react @emotion/styled`
- **Ant Design**: `npm install antd`
- **Chakra UI**: `npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion`

### Tabelas
- **TanStack Table**: `npm install @tanstack/react-table`
- **AG Grid**: `npm install ag-grid-react`

### Gerenciamento de Estado
- **Zustand**: `npm install zustand`
- **Redux Toolkit**: `npm install @reduxjs/toolkit react-redux`

### Upload de Arquivos
- **React Dropzone**: `npm install react-dropzone`

### HTTP Client
- **Axios**: `npm install axios`
- **React Query**: `npm install @tanstack/react-query`

## 🎯 Fluxo da Aplicação Implementado

```
1. Página Inicial (/)
   ↓
2. Upload de Planilha (/upload)
   ↓ (após upload bem-sucedido)
3. Mapeamento de Colunas (/mapping/:uploadId)
   - Visualizar preview
   - Configurar mapeamento
   - Salvar e processar
   ↓
4. Visualização de Produtos (/products/:uploadId)
   - Ver produtos e variantes
   - Exportar em JSON, CSV ou XML
```

## 🎨 Componentes UI Criados

Todos os componentes foram desenvolvidos com Tailwind CSS e TypeScript:

- **Button** - Botão reutilizável com variantes (primary, secondary, outline, ghost) e loading state
- **Card** - Card flexível com header, title e content
- **Input** - Input com label, validação e helper text
- **Select** - Select customizado com validação
- **Alert** - Alertas com tipos (info, success, warning, error) e fechável
- **Modal** - Modal com backdrop, animações e responsivo
- **Table** - Tabela configurável com sorting, alignment e renderização customizada

## 🔄 Integração com Backend

O frontend está totalmente integrado com a API do backend Django:

- ✅ Upload de arquivos
- ✅ Preview de planilhas
- ✅ Criação/atualização de mapeamento
- ✅ Listagem de produtos
- ✅ Exportação em múltiplos formatos

## 🎨 Customização

### Cores (Tailwind)
As cores primárias podem ser ajustadas em `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',  // Azul principal
    600: '#0284c7',
    700: '#0369a1',
  }
}
```

### Animações
Animações customizadas adicionadas:
- `animate-fadeIn` - Fade in suave
- `animate-slideIn` - Slide in de cima para baixo
- `animate-scaleIn` - Scale in

## 🧪 Próximas Melhorias Opcionais

- [ ] Adicionar testes (Jest, React Testing Library)
- [ ] Breadcrumbs para navegação
- [ ] Toast notifications
- [ ] Modo escuro
- [ ] Filtros e busca avançada
- [ ] Paginação para grandes volumes
- [ ] Histórico de uploads

## Documentação Adicional

- `/docs/FRONTEND_API_GUIDE.md` - Guia completo de integração com a API
- `/docs/TECHNICAL_REFERENCE.md` - Referência técnica do projeto
- Backend README: `/backend/README.md`

## Dúvidas?

Consulte a documentação da API no Swagger: http://localhost:8000/api/docs/
