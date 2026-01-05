# 📦 Sistema de Backup e Restore do Banco de Dados

Este documento explica como gerenciar os dados do banco PostgreSQL usando arquivos JSON como backup.

## 🔄 Fluxo de Trabalho

### 1️⃣ Exportar Dados do Banco → JSON

Quando você quiser fazer backup dos dados atuais do banco:

```bash
yarn db:export
```

**O que faz:**
- Conecta no banco PostgreSQL
- Exporta todos os dados (users, categorias, despesas, fontes de renda, lançamentos)
- Salva em arquivos JSON em `src/data/`
- Exclui registros com `deletedAt` (soft deleted)

**Arquivos gerados:**
- `src/data/users.json`
- `src/data/categorias.json`
- `src/data/despesas.json`
- `src/data/fonteRendas.json`
- `src/data/lancamentos.json`

---

### 2️⃣ Importar Dados JSON → Banco

Quando você quiser restaurar ou popular o banco com os dados JSON:

```bash
yarn db:seed
```

**O que faz:**
- Lê os arquivos JSON de `src/data/`
- Limpa o banco (deleta todos os registros)
- Importa os dados dos JSON
- Mapeia IDs antigos para novos (caso necessário)
- Salva mapeamento em `src/data/id-mapping.json`

---

## 🛠️ Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `yarn db:export` | Exporta dados do banco para JSON |
| `yarn db:seed` | Importa dados dos JSON para o banco |
| `yarn db:fresh` | Reseta migrations + seed completo |
| `yarn db:studio` | Abre Prisma Studio (GUI) |
| `yarn db:migrate` | Cria nova migration |

---

## 📋 Casos de Uso

### Fazer Backup Antes de Mudanças
```bash
# 1. Exportar estado atual
yarn db:export

# 2. Fazer suas mudanças no banco via app

# 3. Se algo der errado, restaurar:
yarn db:seed
```

### Sincronizar Dados Entre Ambientes
```bash
# Ambiente de produção
yarn db:export

# Copiar arquivos JSON para dev
# Em dev:
yarn db:seed
```

### Resetar Banco com Dados de Teste
```bash
# 1. Apagar tudo e recriar migrations
yarn db:fresh
```

---

## ⚠️ Observações Importantes

1. **IDs Numéricos**: O banco usa `SERIAL` (autoincrement), então IDs podem mudar após import/export
2. **Senhas**: Usuários mantêm senhas hashadas com bcrypt
3. **Soft Delete**: Apenas registros ativos são exportados (`deletedAt: null`)
4. **Relacionamentos**: O seed preserva todas as relações entre tabelas

---

## 🗑️ Arquivos Obsoletos

O arquivo `prisma/seed.ts` atual será removido após validação do novo sistema.

Os dados JSON em `src/data/` agora servem como:
- ✅ Backup portátil
- ✅ Dados de seed
- ✅ Dados para testes

---

## 🔧 Estrutura dos Arquivos JSON

### `users.json`
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "password": "$2a$10$...",
    "name": "Administrador",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### `categorias.json`
```json
[
  {
    "id": 1,
    "userId": 1,
    "nome": "Alimentação",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

*Outros arquivos seguem estrutura similar*

---

## 🚀 Próximos Passos

1. ✅ Script de exportação criado
2. ⏳ Validar novo fluxo
3. ⏳ Remover `prisma/seed.ts` antigo
4. ⏳ Documentar no README principal
