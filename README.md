# Extrator de Planilhas - Monorepo

Sistema completo para extração, processamento e visualização de dados de planilhas Excel com estrutura não padronizada.

## 🏗️ Estrutura do Monorepo

```
desafio_extrator/
├── backend/                    # API Django REST Framework
│   ├── backend/               # Configurações do Django
│   ├── extractor/             # App principal
│   ├── media/                 # Arquivos enviados
│   ├── scripts/               # Scripts utilitários
│   ├── manage.py              # CLI do Django
│   ├── requirements.txt       # Dependências Python
│   └── README.md             # Documentação do backend
│
├── frontend/                  # Interface web (React/Vue/Next.js)
│   └── README.md             # Instruções para inicializar
│
├── docs/                      # Documentação compartilhada
│   ├── FRONTEND_API_GUIDE.md # Guia completo de integração
│   └── TECHNICAL_REFERENCE.md # Referência técnica
│
├── examples/                  # Exemplos de uso
│
└── README.md                 # Este arquivo
```

## 🚀 Quick Start

### Backend (API)

```bash
# Entrar na pasta backend
cd backend

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py migrate

# Iniciar servidor
python manage.py runserver
```

**API disponível em:** `http://localhost:8000`

**Documentação Swagger:** `http://localhost:8000/api/docs/`

[📖 Ver documentação completa do backend](./backend/README.md)

### Frontend

🚧 **Em desenvolvimento** - Aguardando implementação

```bash
cd frontend
# Seguir instruções no README do frontend
```

[📖 Ver instruções do frontend](./frontend/README.md)

## ✨ Características

### Backend
- ✅ Upload de planilhas Excel (.xlsx)
- ✅ **🤖 Mapeamento automático inteligente de colunas** (NOVO!)
- ✅ Mapeamento customizável de colunas pelo usuário
- ✅ Detecção automática de produtos com múltiplos códigos/variantes
- ✅ Processamento inteligente de dados não padronizados
- ✅ Exportação em múltiplos formatos: JSON, CSV, XML
- ✅ API REST completa com Django REST Framework
- ✅ Documentação OpenAPI/Swagger integrada
- ✅ Suporte a múltiplas colunas de preços

### Frontend (Planejado)
- 🚧 Interface para upload de arquivos
- 🚧 Preview interativo da planilha
- 🚧 Configuração visual de mapeamento de colunas
- 🚧 Visualização de produtos processados
- 🚧 Exportação de dados
- 🚧 Filtros e busca

## 📚 Documentação

### Para Desenvolvedores Frontend

Se você vai desenvolver o frontend, consulte:

1. **[Guia de Integração da API](./docs/FRONTEND_API_GUIDE.md)** - Documentação completa com:
   - Todos os endpoints disponíveis
   - Exemplos de requisições em JavaScript/Fetch
   - Modelos de dados TypeScript
   - Exemplos completos em React e Vue
   - Fluxo completo de integração
   - Tratamento de erros

2. **[Swagger UI](http://localhost:8000/api/docs/)** - Documentação interativa (após iniciar o backend)

3. **[Frontend README](./frontend/README.md)** - Instruções para inicializar o projeto frontend

### Para Desenvolvedores Backend

- **[Backend README](./backend/README.md)** - Documentação completa do backend
- **[Referência Técnica](./docs/TECHNICAL_REFERENCE.md)** - Detalhes técnicos do sistema

## 🔄 Fluxo de Uso

### Fluxo Tradicional (Manual)
```
1. Upload da Planilha
   ↓
2. Preview e Análise
   ↓
3. Configuração Manual de Mapeamento
   ↓
4. Processamento
   ↓
5. Visualização de Resultados
   ↓
6. Exportação (CSV/XML/JSON)
```

### 🤖 Fluxo com Mapeamento Automático (Recomendado - NOVO!)
```
1. Upload da Planilha
   ↓
2. Sistema Identifica Colunas Automaticamente ⚡
   ↓
3. (Opcional) Revisão e Ajustes
   ↓
4. Processamento
   ↓
5. Visualização de Resultados
   ↓
6. Exportação (CSV/XML/JSON)
```

**Vantagens do Mapeamento Automático:**
- ⚡ **Rápido**: Identifica colunas instantaneamente
- 🎯 **Inteligente**: Usa análise de nomes + conteúdo
- 🔄 **Flexível**: Funciona com diferentes estruturas de planilhas
- 💯 **Confiável**: Mostra score de confiança para cada campo

[📖 Ver documentação completa do Mapeamento Automático](./docs/MAPEAMENTO_AUTOMATICO.md)

## 📋 Endpoints Principais da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/spreadsheets/` | Upload de planilha |
| `GET` | `/api/spreadsheets/{id}/preview/` | Preview das primeiras 20 linhas |
| `GET` | `/api/spreadsheets/{id}/suggest_mapping/` | 🤖 **Sugestão automática de mapeamento** (NOVO!) |
| `POST` | `/api/spreadsheets/{id}/apply_suggested_mapping/` | 🤖 **Aplicar mapeamento automático** (NOVO!) |
| `POST` | `/api/column-mappings/create_or_update/` | Configurar mapeamento manual |
| `POST` | `/api/spreadsheets/{id}/process/` | Processar planilha |
| `GET` | `/api/products/?upload_id={id}` | Listar produtos |
| `GET` | `/api/spreadsheets/{id}/export/?format={formato}` | Exportar dados |

[📖 Ver documentação completa da API](./docs/FRONTEND_API_GUIDE.md)
[🤖 Ver documentação do Mapeamento Automático](./docs/MAPEAMENTO_AUTOMATICO.md)

## 🛠️ Tecnologias

### Backend
- Python 3.11+
- Django 5.2
- Django REST Framework 3.16
- pandas + openpyxl (processamento de Excel)
- drf-spectacular (documentação OpenAPI)

### Frontend (Sugerido)
- React 18+ / Vue 3 / Next.js
- Vite / Next.js
- Axios / Fetch API
- Material-UI / Ant Design / Chakra UI

## 🗂️ Estrutura de Dados

### SpreadsheetUpload
Armazena informações sobre o arquivo enviado.

### ColumnMapping
Define como as colunas da planilha devem ser interpretadas.

### Product
Produto principal (primeira ocorrência com descrição).

### ProductVariant
Variação de produto (múltiplos códigos por produto com diferentes tamanhos, preços, etc).

## 🎯 Lógica de Processamento

O sistema processa planilhas com estrutura não padronizada:

1. **Produto principal**: Linhas com descrição criam um novo produto
2. **Variantes**: Linhas seguintes sem descrição são variantes do último produto
3. **Múltiplos preços**: Suporta quantas colunas de preço forem necessárias
4. **Dados flexíveis**: Campos opcionais podem ser deixados vazios

**Exemplo:**
```
Linha 12: AC2 | "Almofada Decorativa" | 45x45 | ...  → Produto principal
Linha 13: AC3 | (vazio)                | 55x55 | ...  → Variante do AC2
Linha 14: AC4 | (vazio)                | 60x60 | ...  → Variante do AC2
Linha 15: BC1 | "Mesa de Centro"      | 80x40 | ...  → Novo produto
```

## 🧪 Testes

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Deploy

### Backend
```bash
# Produção com Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000

# Ou com Docker
docker-compose up
```

### Frontend
```bash
# Build para produção
npm run build

# Servir arquivos estáticos
npm run preview
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Próximos Passos

- [ ] Implementar frontend React/Vue
- [ ] Adicionar autenticação de usuários
- [ ] Implementar histórico de uploads
- [ ] Adicionar validações avançadas de dados
- [ ] Criar dashboard com estatísticas
- [ ] Implementar testes E2E
- [ ] Configurar CI/CD
- [ ] Deploy em produção

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para facilitar o trabalho com planilhas Excel não padronizadas**
