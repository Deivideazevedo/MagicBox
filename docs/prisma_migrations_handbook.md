# 📘 A Receita: Raciocínio, Diagnóstico e Resolução de Conflitos no Prisma

Este manual é um guia de engenharia que descreve a **receita de raciocínio lógico** e os **comandos de diagnóstico** necessários para identificar, validar e resolver conflitos estruturais de banco de dados usando o Prisma de forma 100% segura.

---

## 🔎 PARTE 1: O Roteiro de Diagnóstico (Onde tudo começa?)

Quando um deploy falha com erros de banco de dados, você não deve chutar soluções. Siga este roteiro de comandos diagnósticos:

### Passo 1: Executar o Diagnóstico do Prisma
No terminal local, rode:
```bash
npx prisma migrate status
```
* **O que ele faz:** Ele compara as migrações salvas na tabela de controle física do banco (`_prisma_migrations`) com as pastas locais (`prisma/migrations`).
* **Como interpretar a resposta:**
  * Se disser `Drift detected: applied but missing from local`: Existem registros de migrations no banco que não existem na sua máquina (migrações fantasmas).
  * Se disser `Table user already exists`: O Prisma está tentando rodar uma migração do zero, mas o banco físico já tem tabelas criadas fora do controle de migrações.

### Passo 2: Listar as Migrações locais
No terminal, liste as pastas de histórico:
```bash
ls prisma/migrations
```
*Anote os nomes de todas as pastas encontradas.*

### Passo 3: Consultar os Registros Físicos do Banco
Rode uma consulta SQL na tabela interna do Prisma em ambos os bancos (Dev e Prod):
```sql
SELECT migration_name FROM _prisma_migrations;
```
*Anote todas as linhas retornadas.*

### Passo 4: Fazer o Mapeamento Lado a Lado
Monte uma tabela comparativa mental (ou em um bloco de notas):
* **Pastas locais:** `[20260426020208_init]`
* **Banco físico:** `[20260426020146_init, 20260426020208_init]`

> 📌 **Diagnóstico Final:** A migração `20260426020146_init` é uma **migração fantasma** (Ghost Migration). Ela está gravada no banco, mas não existe no código.

---

## 🛡️ PARTE 2: A Receita da Análise de Riscos (Como validar se é seguro?)

Antes de deletar qualquer registro histórico, você precisa garantir que não vai quebrar o banco físico. Siga estas duas regras de dedução científica:

### Dedução A: O Teste do Timestamp (Carimbo de Data/Hora)
Analise o nome das migrações envolvidas:
* Fantasma: `20260426020146_init` (Gerada em: 26 de Abril às **02:01:46**)
* Local: `20260426020208_init` (Gerada em: 26 de Abril às **02:02:08**)

> **Cálculo de Segurança:** As duas migrações foram geradas com **apenas 22 segundos de diferença**. As duas migrações foram geradas com apenas 22 segundos de diferença. É matematicamente e fisicamente impossível um programador alterar a estrutura de tabelas de um banco de dados em 22 segundos. Isso prova que a fantasma era apenas uma tentativa duplicada do mesmo `init`.

### Dedução B: O Teste de Mapeamento Físico
1. Abra o arquivo local `prisma/migrations/20260426020208_init/migration.sql` e veja quais tabelas ele cria.
2. Acesse seu banco físico e verifique se as tabelas existentes batem exatamente com as descritas no arquivo local.
3. Se o banco físico estivesse diferente (com mais colunas ou tabelas que a local não descrevia), a migração fantasma teria relevância e deletá-la seria perigoso. Como o banco físico batia 100% com a local, confirmamos que a fantasma era 100% redundante.

> **Decisão Técnica:** Risco Zero. Remover o registro fantasma apenas limpará o histórico de controle sem alterar a estrutura do banco físico.

---

## 🛠️ PARTE 3: O Fluxo de Resolução de Desvios (Passo a Passo)

### Cenário 1: Limpando a Linha do Tempo (Ghost Migrations)
1. Rode o SQL para apagar o registro fantasma do livro de registros de Dev e Prod:
   ```sql
   DELETE FROM _prisma_migrations WHERE migration_name = '20260426020146_init';
   ```
2. Valide o sucesso rodando novamente `npx prisma migrate status`. A mensagem de drift deve sumir.

---

### Cenário 2: Tratando tabelas órfãs (Criadas via `db push`)
Se você adicionou modelos no arquivo `.prisma` e usou `db push` no banco de Dev, mas em Produção elas ainda não existem, você gerou um desvio físico. Para resolver sem resetar dados locais:

#### Passo A: Criar a pasta e arquivo SQL manualmente
1. Crie uma pasta dentro de `prisma/migrations/` com a data atual e o nome da alteração. Exemplo:
   `prisma/migrations/20260518120000_add_security_logs`
2. Crie um arquivo chamado `migration.sql` dentro dela.
3. Escreva o código SQL puro de criação das tabelas novas (você pode extrair o SQL comparando schemas ou fazendo um dry-run).

#### Passo B: Assinar o livro de Dev (Evitar erros locais)
Como em desenvolvimento as tabelas físicas já existem, você diz ao Prisma local para apenas registrar no diário que a migração foi feita:
```bash
npx prisma migrate resolve --applied 20260518120000_add_security_logs
```

#### Passo C: Deploy oficial em Produção
Como em produção as tabelas **não existem**, você aponta o `.env.local` temporariamente para produção e roda o deploy real para executar o SQL físico na nuvem:
```bash
npx prisma migrate deploy
```

#### Passo D: Automatização Perpétua (Vercel)
Altere o script de build no seu `package.json` para rodar o deploy automaticamente a cada Git Push:
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

---

## 🏛️ PARTE 4: Abordagens Profissionais para Bancos de Dados Legados

Migrar um banco de dados legado corporativo gigantesco (com dados existentes, views, triggers e stored procedures) para o Prisma exige estratégias que eliminam o risco de downtime ou perda de dados. O comando `db push` é terminantemente proibido nessas situações. As três abordagens de mercado são:

### Abordagem A: Introspecção e Baselining (A mais comum)
Quando o banco de dados já existe e a empresa quer começar a usar o Prisma a partir de hoje:

1. **Introspecção (`npx prisma db pull`):** O Prisma se conecta ao banco legado existente, inspeciona sua estrutura física (tabelas, colunas, índices, chaves) e escreve automaticamente os arquivos `.prisma` correspondentes em segundos.
2. **Criação da Linha de Base (Baseline Migration):** 
   Geramos a migração inicial histórica contendo a estrutura herdada, mas sem executá-la fisicamente no banco:
   ```bash
   npx prisma migrate dev --name legacy_baseline --create-only
   ```
3. **Assinar o Histórico sem Alterar os Bancos:**
   Dizemos ao Prisma que a migração inicial já foi executada em todos os ambientes (Dev, Staging, Produção) para evitar que ele tente recriar tabelas que já existem fisicamente:
   ```bash
   npx prisma migrate resolve --applied <data_da_migration>_legacy_baseline
   ```
*A partir deste ponto de partida (baseline), qualquer nova mudança no banco de dados seguirá o fluxo de migração incremental tradicional.*

### Abordagem B: Injeção de SQL customizado em Migrations
O Prisma não mapeia nativamente stored procedures, triggers complexas, types customizados avançados ou funções PostgreSQL complexas no arquivo de esquema.

1. Geramos o arquivo de migração sem executá-lo:
   ```bash
   npx prisma migrate dev --name add_procedures --create-only
   ```
2. O desenvolvedor (ou DBA responsável) abre o arquivo `migration.sql` recém-gerado localmente.
3. Escreve diretamente no arquivo o SQL cru responsável por criar a trigger, stored procedure ou view complexa desejada.
4. Quando a migration é executada via deploy, o Prisma roda tudo dentro de uma única transação segura, garantindo o versionamento do banco legado e seus artefatos avançados juntos!

### Abordagem C: Microsserviço com Mapeamento Parcial (Prisma Modular)
Se a empresa possui um banco de dados colossal (milhares de tabelas e múltiplos sistemas escrevendo nele) e você está construindo um novo sistema que usará apenas 10 tabelas específicas:

1. Executamos o `npx prisma db pull` para introspectar o banco completo.
2. No arquivo `.prisma`, deletamos manualmente todos os modelos que não usaremos, deixando apenas as tabelas que nosso microsserviço precisa ler e escrever.
3. Desativamos as migrações do Prisma neste projeto (a estrutura do banco físico continuará sendo gerida centralizadamente pela equipe de DBAs usando ferramentas corporativas como Flyway, Liquibase ou scripts controlados de deploy). O Prisma atuará puramente como um Query Builder ágil, produtivo e seguro para o microsserviço!
