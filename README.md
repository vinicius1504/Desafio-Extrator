# Manual do Sistema Extrator de Planilhas

Sistema para transformar planilhas Excel em dados estruturados de forma rápida e intuitiva.

---

## Iniciando o Sistema

### Requisitos
- Docker e Docker Compose instalados
- Navegador moderno (Chrome, Firefox, Edge ou Safari)

### Passo 1: Iniciar o sistema
Abra o terminal na pasta do projeto e execute:

```bash
docker-compose up
```

Aguarde até ver as mensagens indicando que os serviços estão prontos.

### Passo 2: Acessar o sistema
Abra seu navegador e acesse:

**Frontend:** `http://localhost:5173`
**Backend:** `http://localhost:8000`

### Passo 3: Primeiro Acesso
Faça login com as credenciais padrão do administrador:
- **Usuário:** `admin`
- **Senha:** `admin123`

**IMPORTANTE:** Altere a senha após o primeiro login por segurança!

---

## Como Usar

### 1. Upload de Planilha

1. Clique em **"Começar Agora"** ou **"Upload"**
2. Arraste sua planilha Excel para a área indicada ou clique para selecionar
3. Aguarde o upload completar

**Formatos aceitos:** Excel (.xlsx, .xls), CSV (.csv), OpenDocument (.ods)

### 2. Mapeamento de Colunas

Após o upload, você verá a tela de mapeamento:

**Campos Obrigatórios:**
- **Código** - Identificador único do produto
- **Nome** - Nome/descrição do produto

**Campos Opcionais:**
- Descrição completa
- NCM (código fiscal)
- Dimensões (altura, largura, profundidade)
- Peso
- Peso cúbico

**Colunas de Preço:**
- Adicione quantas colunas de preço precisar
- Exemplo: "Atacado", "Varejo", "Promocional"

**Colunas de Variação:**
- Selecione colunas que diferenciam variações do produto
- Exemplo: Cor, Tamanho, Voltagem
- Produtos com mesmo código mas variações diferentes serão agrupados

**Dica:** O sistema tenta mapear automaticamente as colunas. Revise antes de processar!

### 3. Processar

1. Revise o mapeamento
2. Clique em **"Processar Planilha"**
3. Aguarde a extração (alguns segundos)
4. Você será redirecionado para visualizar os produtos

### 4. Visualizar Produtos

Na tela de produtos você pode:
- Ver todos os produtos extraídos
- Expandir para ver detalhes completos
- Ver tabela de variações (cores, tamanhos, etc)
- Buscar produtos por código ou nome
- Selecionar produtos para exportação

### 5. Exportar Dados

**Exportar Todos:**
1. Clique em **"Exportar Todos"**
2. Escolha o formato: **JSON**, **CSV** ou **XML**
3. Download automático

**Exportar Selecionados:**
1. Selecione os produtos desejados
2. Clique em **"Exportar (X)"**
3. Escolha o formato
4. Download automático

**Exportar Individual:**
1. Expanda um produto
2. Clique no ícone de download
3. Escolha o formato

---

## Gerenciamento de Perfil

### Visualizar Perfil
1. Clique no seu nome (canto superior direito)
2. Selecione **"Perfil"**

### Editar Dados
1. No perfil, clique em **"Editar"**
2. Altere nome, sobrenome ou email
3. Clique em **"Salvar Alterações"**

### Alterar Senha
1. No perfil, vá em **"Alterar Senha"**
2. Digite a senha atual
3. Digite a nova senha
4. Confirme a nova senha
5. Clique em **"Alterar Senha"**

Você será deslogado e precisará fazer login novamente.

---

## Gerenciamento de Usuários (Apenas Administradores)

### Criar Novo Usuário
1. Menu **"Usuários"**
2. Clique em **"Criar Novo Usuário"**
3. Preencha:
   - Nome de usuário (único)
   - Email
   - Nome e sobrenome
   - Senha
   - Permissão de admin (opcional)
4. Clique em **"Criar Usuário"**

### Editar Usuário
1. Clique no ícone de editar
2. Altere os dados
3. Clique em **"Salvar"**

### Ativar/Desativar
1. Clique no botão de status
2. Confirme a ação

Usuários inativos não conseguem fazer login.

### Deletar Usuário
1. Clique no ícone de deletar
2. Digite "CONFIRMAR"
3. Clique em **"Deletar Permanentemente"**

**Atenção:** Esta ação é irreversível!

---

## Inteligência Artificial (Gemini)

O sistema usa Google Gemini AI para identificar automaticamente o tipo de cada coluna da planilha!

**Como funciona:**
- Analisa os nomes das colunas
- Examina uma amostra dos dados
- Identifica automaticamente: código, descrição, preços, peso, dimensões, NCM
- Funciona com qualquer formato de planilha

**Vantagens:**
- Detecta múltiplas colunas de preço
- Entende headers customizados ("VL_UNIT", "DESC_PROD", etc)
- Fallback automático se IA não estiver disponível

---

## Dicas Importantes

### Preparação da Planilha
- Deixe os nomes de colunas na primeira linha
- Use códigos únicos para cada produto
- Mantenha o mesmo código para variações do mesmo produto
- Evite linhas vazias entre produtos
- Colunas ocultas no Excel são ignoradas automaticamente

### Exportação
- **JSON:** Para integrações e APIs
- **CSV:** Para Excel e Google Sheets
- **XML:** Para sistemas legados

### Segurança
- Altere senhas temporárias imediatamente
- Use senhas fortes
- Não compartilhe credenciais
- Faça logout em computadores compartilhados
- Sistema faz logout automático após 10 minutos de inatividade

---

## Exemplo Prático

**Planilha de entrada:**

| Código | Nome | Cor | Tamanho | Atacado | Varejo |
|--------|------|-----|---------|---------|--------|
| CAM001 | Camiseta Premium | Azul | P | 25.90 | 39.90 |
| CAM001 | Camiseta Premium | Azul | M | 25.90 | 39.90 |
| CAM001 | Camiseta Premium | Vermelho | P | 25.90 | 39.90 |

**Resultado:**
- **Produto:** CAM001 - Camiseta Premium
- **Variações:** 3 (Azul P, Azul M, Vermelho P)
- **Preços:** Atacado R$ 25,90 / Varejo R$ 39,90

---

## Perguntas Frequentes

**Qual o tamanho máximo de planilha?**
Não há limite rígido, mas planilhas muito grandes (>10.000 linhas) podem demorar mais.

**Posso processar a mesma planilha várias vezes?**
Sim! Cada upload é independente.

**Como funciona a detecção de variações?**
O sistema agrupa produtos com o mesmo código mas com valores diferentes nas colunas de variação.

**Posso ter quantas colunas de preço?**
Sim! Não há limite.

**Como solicitar uma conta?**
Entre em contato com o administrador do sistema.

**Esqueci minha senha**
Entre em contato com o administrador para resetar.

---

## Parar o Sistema

Para parar o sistema, no terminal execute:

```bash
docker-compose down
```

Para parar e remover todos os dados:

```bash
docker-compose down -v
```

---

## Suporte

**Problemas Técnicos:**
1. Anote a mensagem de erro
2. Tire um print da tela
3. Entre em contato com o administrador

**Navegadores Recomendados:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Desenvolvido para facilitar o gerenciamento de grandes volumes de produtos**

Versão: 1.0.0
