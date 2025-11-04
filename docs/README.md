# Documentação do Projeto

## Índice de Documentos

- [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) - Visão geral do sistema e arquitetura
- [TECHNICAL_REFERENCE.md](./TECHNICAL_REFERENCE.md) - Referência técnica detalhada

## Estrutura do Projeto

```
desafio_extrator/
├── backend/              # Configurações do Django
│   ├── settings/        # Settings separados por ambiente
│   ├── urls.py          # URLs principais
│   ├── wsgi.py          # WSGI config
│   └── asgi.py          # ASGI config
│
├── extractor/           # Aplicação principal
│   ├── services/        # Lógica de negócio
│   ├── utils/           # Utilidades e helpers
│   ├── tests/           # Testes unitários
│   ├── views.py         # Views da API
│   └── urls.py          # URLs da aplicação
│
├── docs/                # Documentação técnica
├── examples/            # Exemplos de planilhas
├── media/               # Upload de arquivos
├── scripts/             # Scripts auxiliares
├── manage.py            # Django management
└── requirements.txt     # Dependências Python
```

## Como Começar

Veja o [README principal](../README.md) para instruções de instalação e uso.
