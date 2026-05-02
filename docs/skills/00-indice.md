# MagicBox - Biblioteca de Skills

Conhecimento utilizado pelo Assistente Virtual para responder aos usuários.

## Arquitetura

```
docs/skills/
├── 00-indice.md           # Este arquivo
├── 01-comportamento.md    # Regras de comportamento e formatação
├── 02-ferramentas.md      # Quando usar cada ferramenta
├── 03-conhecimento-app.md # Glossário, tipos de conta, links
└── 04-regras-negocio.md   # Regras fundamentais do sistema
```

## Fluxo de Uso

1. O **System Prompt** (service.ts) carrega as skills dinamicamente
2. O modelo consulta as ferramentas quando precisa de dados reais
3. A resposta é formatada seguindo as regras de comportamento