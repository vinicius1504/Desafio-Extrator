# Integração com Google Sheets

## Visão Geral

O sistema agora suporta a importação de planilhas diretamente do Google Sheets através de links! Não é mais necessário baixar a planilha e fazer upload manualmente - basta colar o link e pronto.

## Como Funciona

### Backend

1. **Utilitário de Importação** (`backend/extractor/utils/google_sheets_importer.py`):
   - Valida URLs do Google Sheets
   - Extrai o ID da planilha
   - Baixa a planilha como arquivo Excel (.xlsx)
   - Converte para formato processável pelo sistema

2. **Endpoint de Upload** (`backend/extractor/views.py`):
   - Aceita tanto arquivos quanto URLs
   - Método `_create_from_google_sheets()` processa URLs
   - Retorna informações da planilha importada

3. **Serializer Atualizado** (`backend/extractor/serializers.py`):
   - Campo `google_sheets_url` para receber URLs
   - Validação automática

### Frontend

1. **Página de Upload** (`frontend/src/pages/UploadPage.tsx`):
   - Botões para alternar entre upload de arquivo e Google Sheets
   - Interface intuitiva para inserir URLs
   - Instruções de como compartilhar planilhas

2. **Hook de Upload** (`frontend/src/hooks/useUpload.ts`):
   - Suporta upload de arquivos E URLs
   - Mesma interface para ambos os métodos

## Como Usar

### Para o Usuário Final

1. **Preparar a Planilha no Google Sheets**:
   - Abra sua planilha no Google Sheets
   - Clique em "Compartilhar" (canto superior direito)
   - Em "Acesso geral", selecione **"Qualquer pessoa com o link"**
   - Certifique-se de que a permissão está em **"Visualizador"**
   - Copie o link gerado

2. **Importar no Sistema**:
   - Acesse a página de Upload
   - Clique no botão **"Google Sheets"**
   - Cole o link da planilha
   - Clique em **"Importar Planilha"**
   - Aguarde o processamento (barra de progresso será exibida)
   - Você será redirecionado automaticamente para o mapeamento de colunas

### Formatos de URL Aceitos

Todos os formatos padrão do Google Sheets são suportados:

```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid=0
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}
```

## Requisitos

### Backend

A dependência `requests` é necessária:

```bash
pip install -r requirements.txt
```

Ou manualmente:

```bash
pip install requests==2.31.0
```

### Permissões da Planilha

**IMPORTANTE**: A planilha precisa estar com permissão pública ou "Qualquer pessoa com o link" para que o sistema consiga acessá-la.

Se a planilha estiver privada, você receberá o erro:
```
Acesso negado. A planilha precisa ser pública ou ter permissões de visualização para qualquer pessoa com o link.
```

## Vantagens

✅ **Sem Downloads**: Não precisa baixar a planilha manualmente
✅ **Sempre Atualizada**: Importa a versão mais recente da planilha
✅ **Mais Rápido**: Processo direto sem intermediários
✅ **Integração Nativa**: Mesma experiência de upload de arquivos
✅ **Validação Automática**: Sistema valida o link antes de processar

## Tratamento de Erros

O sistema trata diversos cenários de erro:

| Erro | Causa | Solução |
|------|-------|---------|
| URL inválida | Link não é do Google Sheets | Verifique se copiou o link correto |
| Planilha não encontrada (404) | Link incorreto ou planilha deletada | Confirme se a planilha existe |
| Acesso negado (403) | Planilha privada | Configure compartilhamento como "Qualquer pessoa com o link" |
| Timeout | Planilha muito grande ou conexão lenta | Tente novamente ou use upload de arquivo |
| Arquivo inválido | Planilha vazia ou corrompida | Verifique o conteúdo da planilha |

## Exemplo de Uso na API

### Upload via Arquivo (modo tradicional)
```bash
curl -X POST http://localhost:8000/api/uploads/ \
  -H "Authorization: Bearer {token}" \
  -F "file=@planilha.xlsx"
```

### Upload via Google Sheets URL (novo)
```bash
curl -X POST http://localhost:8000/api/uploads/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "google_sheets_url": "https://docs.google.com/spreadsheets/d/ABC123/edit"
  }'
```

## Arquitetura

```
┌─────────────┐
│   Frontend  │
│ UploadPage  │
└──────┬──────┘
       │
       │ URL do Google Sheets
       ▼
┌─────────────┐
│   Backend   │
│   Views     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ GoogleSheetsImporter│
│   - Valida URL      │
│   - Baixa planilha  │
│   - Converte p/ XLS │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│  Processa   │
│  como file  │
│   normal    │
└─────────────┘
```

## Limitações

- ⚠️ A planilha precisa ser pública ou ter link de compartilhamento ativo
- ⚠️ Timeout padrão de 30 segundos (planilhas muito grandes podem exceder)
- ⚠️ Apenas a primeira aba da planilha é importada
- ⚠️ Tamanho máximo depende das limitações do Google Sheets

## Próximos Passos (Opcional)

Possíveis melhorias futuras:

1. **Suporte a múltiplas abas**: Permitir selecionar qual aba importar
2. **Sincronização automática**: Atualizar dados periodicamente
3. **OAuth**: Acessar planilhas privadas com autenticação do usuário
4. **Cache**: Armazenar planilhas baixadas temporariamente
5. **Streaming**: Processar planilhas grandes em chunks

## Troubleshooting

### Erro: "Acesso negado"
**Problema**: A planilha está privada
**Solução**: No Google Sheets, vá em Compartilhar > Acesso geral > "Qualquer pessoa com o link"

### Erro: "URL inválida"
**Problema**: O link copiado não é do Google Sheets
**Solução**: Certifique-se de copiar o link completo da barra de endereços

### Erro: "Timeout"
**Problema**: Planilha muito grande ou conexão lenta
**Solução**: Tente novamente ou faça download manual e use upload de arquivo

### Frontend não envia URL
**Problema**: Hook useUpload não foi atualizado
**Solução**: Certifique-se de que o código está atualizado e a dependência foi instalada

## Segurança

- ✅ Validação de URL antes de fazer requisição
- ✅ Timeout para evitar requisições infinitas
- ✅ Verifica assinatura do arquivo Excel baixado
- ✅ Não expõe credenciais ou tokens
- ✅ Limita tamanho de download
- ⚠️ URLs devem ser de fontes confiáveis

## Suporte

Para problemas ou dúvidas sobre a integração com Google Sheets:

1. Verifique os logs do backend
2. Confirme que a dependência `requests` está instalada
3. Teste com uma planilha pública simples primeiro
4. Verifique se o CORS está configurado corretamente
