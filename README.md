# 📊 Sistema Extrator de Planilhas

> **Transforme suas planilhas Excel em dados estruturados de forma rápida e intuitiva**

Sistema completo para upload, processamento, mapeamento e exportação de dados de planilhas Excel. Ideal para e-commerces, distribuidores e empresas que trabalham com grandes volumes de produtos.

---

## ✨ Funcionalidades

### 🎯 **Principais Recursos**

- ✅ **Upload de Planilhas** - Suporte para Excel (.xlsx, .xls), CSV e ODS
- ✅ **Preview Inteligente** - Visualize sua planilha antes de processar
- ✅ **Mapeamento Visual** - Mapeie colunas de forma intuitiva
- ✅ **Auto-detecção** - Sistema detecta automaticamente headers e estrutura
- ✅ **Colunas Ocultas** - Ignora automaticamente colunas ocultas no Excel
- ✅ **Múltiplos Preços** - Suporte para quantas colunas de preço você precisar
- ✅ **Variações de Produtos** - Detecta e processa variações (cores, tamanhos, etc)
- ✅ **Exportação Múltipla** - JSON, CSV ou XML
- ✅ **Seleção Flexível** - Exporte todos os produtos ou apenas os selecionados
- ✅ **Gerenciamento de Usuários** - Sistema completo de autenticação e permissões
- ✅ **Interface Moderna** - Design responsivo com animações suaves
- ✅ **Dark Mode** - Tema escuro automático

---

## 🚀 Como Usar

### **1. Acesse o Sistema**

Abra o sistema no navegador e faça login com suas credenciais.

> Se não tiver conta, solicite ao administrador do sistema.

---

### **2. Faça Upload da Planilha**

1. Clique em **"Começar Agora"** ou **"Upload"** no menu
2. Arraste e solte sua planilha Excel ou clique para selecionar
3. Aguarde o upload completar

**Formatos aceitos:**
- Excel (.xlsx, .xls)
- CSV (.csv)
- OpenDocument (.ods)

**Tamanho máximo:** Sem limite definido

---

### **3. Mapeie as Colunas**

Após o upload, você verá a **tela de mapeamento**:

#### **Campos Obrigatórios:**
- **Código** - Código único do produto
- **Nome** - Nome/descrição do produto

#### **Campos Opcionais:**
- **Descrição** - Descrição detalhada
- **NCM** - Código NCM fiscal
- **Dimensões** - Altura, Largura, Profundidade
- **Peso** - Peso em kg
- **Peso Cúbico** - Peso cubado

#### **Colunas de Preço:**
- Adicione quantas colunas de preço precisar
- Exemplo: "Atacado", "Varejo", "Revenda", "Promocional"
- Cada coluna pode ter um nome personalizado

#### **Colunas de Variação:**
- Selecione colunas que diferenciam variações do mesmo produto
- Exemplo: Cor, Tamanho, Modelo, Voltagem
- O sistema agrupará produtos com mesmo código mas variações diferentes

#### **Auto-Mapeamento:**
O sistema tenta mapear automaticamente baseado em:
- Nomes de colunas (código, nome, preço, etc)
- Posição das colunas
- Padrões comuns de planilhas

**Dica:** Revise o mapeamento automático antes de processar!

---

### **4. Processar a Planilha**

1. Revise o mapeamento
2. Clique em **"Processar Planilha"**
3. Aguarde a extração dos dados (pode levar alguns segundos)
4. Você será redirecionado para a tela de produtos

**O que acontece no processamento:**
- Sistema lê a planilha linha por linha
- Agrupa produtos por código
- Identifica variações
- Extrai preços e dimensões
- Calcula peso cúbico (se configurado)
- Ignora colunas ocultas automaticamente

---

### **5. Visualizar Produtos**

Na tela de produtos você pode:

- **Ver todos os produtos extraídos**
- **Expandir/Recolher** detalhes de cada produto
- **Ver tabela de variações** (cores, tamanhos, etc)
- **Buscar produtos** por código ou nome
- **Selecionar produtos** para exportação
- **Carregar mais** produtos (paginação)

**Informações exibidas:**
- Código e nome do produto
- Descrição e NCM
- Quantidade de variações
- Dimensões e peso
- Todos os preços cadastrados
- Dados adicionais (variações)

---

### **6. Exportar Dados**

#### **Exportação em Lote:**
1. Clique em **"Exportar Todos"** (sem seleção)
   - OU -
2. Selecione produtos específicos e clique em **"Exportar (X)"**
3. Escolha o formato:
   - **JSON** - Para integrações e APIs
   - **CSV** - Para Excel, Google Sheets
   - **XML** - Para sistemas legados
4. Download automático do arquivo

#### **Exportação Individual:**
1. Expanda um produto
2. Clique no ícone de download
3. Escolha o formato
4. Download individual do produto

---

## 👤 Gerenciamento de Perfil

### **Visualizar Perfil**

1. Clique no seu nome no canto superior direito
2. Selecione **"Perfil"**
3. Visualize suas informações

### **Editar Dados**

1. No perfil, clique em **"Editar"**
2. Altere nome, sobrenome ou email
3. Clique em **"Salvar Alterações"**

### **Alterar Senha**

1. No perfil, vá em **"Alterar Senha"**
2. Digite a senha atual
3. Digite a nova senha
4. Confirme a nova senha
5. Clique em **"Alterar Senha"**

> **Segurança:** Você será deslogado e precisará fazer login novamente com a nova senha.

---

## 👥 Gerenciamento de Usuários (Admin)

> **Esta funcionalidade está disponível apenas para administradores**

### **Acessar Gerenciamento**

1. No menu, clique em **"Usuários"**
2. Visualize lista de todos os usuários

### **Criar Novo Usuário**

1. Clique em **"Criar Novo Usuário"**
2. Preencha os dados:
   - Nome de usuário (único)
   - Email
   - Nome e sobrenome
   - Senha
   - Permissão de admin (opcional)
3. Clique em **"Criar Usuário"**

> **Email:** O sistema tentará enviar um email com as credenciais (se configurado)

### **Editar Usuário**

1. Clique no ícone de editar (✏️)
2. Altere os dados necessários
3. Clique em **"Salvar"**

### **Ativar/Desativar Usuário**

1. Clique no botão de status (Ativo/Inativo)
2. Confirme a ação

> **Importante:** Usuários inativos não conseguem fazer login

### **Deletar Usuário**

1. Clique no ícone de deletar (🗑️)
2. Confirme digitando "CONFIRMAR"
3. Clique em **"Deletar Permanentemente"**

> **Atenção:** Esta ação é irreversível!

---

## 💡 Dicas e Boas Práticas

### **Preparação da Planilha**

✅ **Organize os headers**
- Deixe os nomes de colunas na primeira linha
- Use nomes claros: "Código", "Nome", "Preço Atacado"
- Evite células mescladas nos headers

✅ **Padronize os dados**
- Códigos de produtos únicos
- Formatos consistentes (datas, números)
- Não deixe linhas vazias entre os produtos

✅ **Colunas ocultas**
- O sistema ignora automaticamente colunas ocultas
- Oculte colunas que não quer processar

✅ **Variações**
- Use colunas separadas para cada característica (Cor, Tamanho)
- Mantenha o mesmo código para variações do mesmo produto

### **Mapeamento**

✅ **Revise o auto-mapeamento**
- Mesmo com detecção automática, sempre revise
- Confirme se as colunas estão corretas

✅ **Preços múltiplos**
- Nomeie claramente cada tipo de preço
- Exemplo: "Atacado", "Varejo", "Promocional"

✅ **Dimensões**
- Certifique-se que altura, largura e profundidade estão corretas
- Isso afeta cálculos de peso cúbico

### **Exportação**

✅ **Escolha o formato correto**
- **JSON**: Para integrações com sistemas/APIs
- **CSV**: Para abrir no Excel ou importar
- **XML**: Para sistemas que precisam dessa estrutura

✅ **Exportação seletiva**
- Use busca para filtrar produtos
- Selecione apenas o que precisa
- Economize tempo e recursos

### **Segurança**

🔒 **Altere a senha padrão**
- Se recebeu uma senha temporária, altere imediatamente
- Use senhas fortes (letras, números, símbolos)

🔒 **Não compartilhe credenciais**
- Cada usuário deve ter sua própria conta
- Solicite novas contas ao admin

🔒 **Faça logout**
- Sempre faça logout em computadores compartilhados
- O sistema faz logout automático após inatividade

---

## ❓ Perguntas Frequentes (FAQ)

### **Qual o tamanho máximo de planilha?**
Não há limite rígido definido, mas planilhas muito grandes (>10.000 linhas) podem demorar mais para processar.

### **Posso processar a mesma planilha múltiplas vezes?**
Sim! Cada upload é independente. Você pode fazer upload da mesma planilha com mapeamentos diferentes.

### **Como funciona a detecção de variações?**
O sistema agrupa produtos com o **mesmo código** mas com valores diferentes nas **colunas de variação** selecionadas.

### **O que são colunas ocultas?**
Colunas ocultas no Excel são ignoradas automaticamente. Se não quer processar uma coluna, oculte-a no Excel antes do upload.

### **Posso ter quantas colunas de preço?**
Sim! Não há limite. Adicione quantas precisar.

### **Como o sistema calcula peso cúbico?**
Se você mapear as dimensões (altura, largura, profundidade), o sistema calcula: `(A × L × P) / 6000`

### **Posso exportar apenas alguns produtos?**
Sim! Use a busca para filtrar, selecione os produtos desejados e clique em "Exportar".

### **O que acontece se eu não mapear um campo?**
Campos não mapeados são ignorados. Apenas **Código** e **Nome** são obrigatórios.

### **Como solicitar uma conta de usuário?**
Entre em contato com o administrador do sistema. Apenas admins podem criar novas contas.

### **Esqueci minha senha, o que faço?**
Entre em contato com o administrador para resetar sua senha.

---

## 🎯 Fluxo Completo (Passo a Passo)

```
1. Login
   ↓
2. Upload da Planilha (.xlsx, .csv, .ods)
   ↓
3. Preview Automático
   ↓
4. Mapeamento de Colunas
   • Código ✓
   • Nome ✓
   • Descrição
   • NCM
   • Dimensões
   • Peso
   • Preços (múltiplos)
   • Variações
   ↓
5. Processamento
   • Extração linha por linha
   • Agrupamento por código
   • Detecção de variações
   • Cálculos automáticos
   ↓
6. Visualização
   • Buscar produtos
   • Expandir detalhes
   • Ver variações
   • Selecionar produtos
   ↓
7. Exportação
   • Escolher formato (JSON/CSV/XML)
   • Todos ou selecionados
   • Download automático
   ↓
8. Concluído! ✅
```

---

## 📞 Suporte

### **Problemas Técnicos**
Se encontrar algum erro ou comportamento inesperado:
1. Anote a mensagem de erro (se houver)
2. Tire um print da tela
3. Entre em contato com o administrador

### **Dúvidas sobre Uso**
Consulte este guia ou entre em contato com:
- Administrador do sistema
- Suporte técnico da sua empresa

### **Sugestões de Melhoria**
Sua opinião é importante! Compartilhe sugestões de:
- Novas funcionalidades
- Melhorias na interface
- Processos mais eficientes

---

## 🔐 Segurança e Privacidade

### **Seus Dados**
- ✅ Todos os uploads são privados
- ✅ Apenas você tem acesso aos seus dados
- ✅ Admins não veem suas planilhas
- ✅ Conexão HTTPS segura (produção)
- ✅ Senhas criptografadas
- ✅ Tokens JWT com expiração automática

### **Sessões**
- ⏱️ Token de acesso expira em **10 minutos** de uso
- ⏱️ Token de renovação expira em **1 dia**
- ⏱️ Logout automático após **10 minutos** de inatividade
- 🔒 Logout manual disponível a qualquer momento

---

## 🌟 Benefícios do Sistema

### **Economia de Tempo**
⏰ Processe centenas de produtos em segundos ao invés de horas

### **Redução de Erros**
✅ Evite erros manuais de digitação e cálculo

### **Flexibilidade**
🎯 Suporte para diversos formatos e estruturas de planilha

### **Escalabilidade**
📈 Processe desde pequenas até grandes planilhas

### **Facilidade de Uso**
😊 Interface intuitiva, não precisa ser técnico

### **Integrações**
🔌 Exporte em formatos prontos para integração com outros sistemas

---

## 🎨 Interface

### **Design Moderno**
- Interface limpa e profissional
- Gradientes suaves
- Ícones intuitivos
- Cores consistentes

### **Responsivo**
- Funciona em desktop, tablet e mobile
- Layout adaptativo
- Touch-friendly

### **Animações**
- Transições suaves entre páginas
- Feedback visual em ações
- Hover effects
- Loading states

### **Dark Mode**
- Tema escuro automático
- Confortável para longos períodos de uso
- Economia de bateria (OLED)

---

## 📱 Compatibilidade

### **Navegadores Suportados**
- ✅ Chrome 90+ (Recomendado)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### **Dispositivos**
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablet (iPad, Android)
- ✅ Mobile (iOS, Android)

> **Recomendação:** Use navegadores atualizados para melhor experiência

---

## 🚀 Primeiros Passos Rápidos

**Para começar imediatamente:**

1. **Faça login**
2. **Clique em "Começar Agora"**
3. **Arraste sua planilha Excel**
4. **Clique em "Processar"** (aceite o auto-mapeamento)
5. **Veja seus produtos!**
6. **Clique em "Exportar Todos"**
7. **Escolha JSON ou CSV**
8. **Pronto!** ✅

> É simples assim! O sistema faz o trabalho pesado por você.

---

## 📊 Exemplo de Uso

### **Planilha de Entrada:**

| Código | Nome | Cor | Tamanho | Preço Atacado | Preço Varejo |
|--------|------|-----|---------|---------------|--------------|
| CAM001 | Camiseta Premium | Azul | P | 25.90 | 39.90 |
| CAM001 | Camiseta Premium | Azul | M | 25.90 | 39.90 |
| CAM001 | Camiseta Premium | Vermelho | P | 25.90 | 39.90 |
| CAL002 | Calça Jeans | Azul | 38 | 89.90 | 129.90 |

### **Resultado Processado:**

**Produto 1: CAM001 - Camiseta Premium**
- 3 variações:
  - Azul - P
  - Azul - M
  - Vermelho - P
- Preços: Atacado R$ 25,90 / Varejo R$ 39,90

**Produto 2: CAL002 - Calça Jeans**
- 1 variação:
  - Azul - 38
- Preços: Atacado R$ 89,90 / Varejo R$ 129,90

---

**Sistema desenvolvido para facilitar o gerenciamento de grandes volumes de produtos** ✨

**Versão:** 1.0.0
**Última atualização:** Novembro 2025
